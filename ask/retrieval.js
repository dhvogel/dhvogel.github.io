// retrieval.js
//
// Modular retrieval layer for the "Ask about Dan" feature.
//
// The contract every retriever implements:
//   async load()                       -> initialize (fetch graph, build index, etc.)
//   retrieve(question, opts) -> { facts: string[], nodes: [], edges: [] }
//
// The default implementation is GraphTraversalRetriever: a tiny, dependency-free
// keyword-scored traversal over knowledge-graph.json. It is more than fast enough
// for a personal-portfolio-sized graph.
//
// To swap in a real graph database later (e.g. KuzuDB-WASM with Cypher), write a
// new class with the same load()/retrieve() methods and pass it to AskEngine.
// No other file needs to change.

const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been",
    "being", "to", "of", "in", "on", "at", "for", "with", "about", "as", "by",
    "do", "does", "did", "doing", "what", "which", "who", "whom", "whose", "when",
    "where", "why", "how", "you", "your", "yours", "he", "him", "his", "she", "her",
    "it", "its", "they", "them", "their", "i", "me", "my", "we", "us", "our",
    "this", "that", "these", "those", "tell", "know", "can", "could", "would",
    "should", "has", "have", "had", "any", "some", "more", "most", "much", "many"
]);

function tokenize(text) {
    return (text || "")
        .toLowerCase()
        .replace(/[^a-z0-9+#\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

export class GraphTraversalRetriever {
    constructor(graphUrl) {
        this.graphUrl = graphUrl;
        this.graph = null;
        this.nodesById = new Map();
        this.outgoing = new Map();
        this.incoming = new Map();
    }

    async load() {
        const res = await fetch(this.graphUrl);
        if (!res.ok) throw new Error(`Failed to load knowledge graph (HTTP ${res.status})`);
        this.graph = await res.json();

        for (const node of this.graph.nodes) {
            this.nodesById.set(node.id, node);
            this.outgoing.set(node.id, []);
            this.incoming.set(node.id, []);
        }
        for (const edge of this.graph.edges) {
            if (this.outgoing.has(edge.source)) this.outgoing.get(edge.source).push(edge);
            if (this.incoming.has(edge.target)) this.incoming.get(edge.target).push(edge);
        }
        return this;
    }

    // Score a node by how well its searchable text matches the question tokens.
    _scoreNode(node, queryTokens) {
        const haystack = [
            node.label,
            node.summary,
            (node.tags || []).join(" "),
            node.type
        ].join(" ").toLowerCase();
        const hay = new Set(tokenize(haystack));

        let score = 0;
        for (const qt of queryTokens) {
            if (hay.has(qt)) {
                score += 2;
            } else if (haystack.includes(qt)) {
                // partial / substring match (e.g. "google" in "google+")
                score += 1;
            }
        }
        // Boost exact tag matches, which are high-signal.
        for (const tag of node.tags || []) {
            if (queryTokens.includes(tag.toLowerCase())) score += 2;
        }
        return score;
    }

    retrieve(question, opts = {}) {
        const maxSeeds = opts.maxSeeds || 4;
        const maxFacts = opts.maxFacts || 10;
        const queryTokens = tokenize(question);

        // 1. Score every node, keep the best-matching "seed" nodes.
        const scored = this.graph.nodes
            .map((node) => ({ node, score: this._scoreNode(node, queryTokens) }))
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score);

        // The person node is always relevant context for a personal Q&A.
        const selected = new Map();
        const danNode = this.nodesById.get("dan");
        if (danNode) selected.set("dan", { node: danNode, score: 0.5 });

        // If nothing matched, fall back to a high-level overview (person + direct neighbors).
        const seeds = scored.length > 0 ? scored.slice(0, maxSeeds) : [{ node: danNode, score: 1 }];

        for (const { node, score } of seeds) {
            selected.set(node.id, { node, score });
            // 2. Expand one hop along edges to pull in connected context.
            for (const edge of this.outgoing.get(node.id) || []) {
                const neighbor = this.nodesById.get(edge.target);
                if (neighbor && !selected.has(neighbor.id)) {
                    selected.set(neighbor.id, { node: neighbor, score: score * 0.4, viaEdge: edge });
                }
            }
            for (const edge of this.incoming.get(node.id) || []) {
                const neighbor = this.nodesById.get(edge.source);
                if (neighbor && !selected.has(neighbor.id)) {
                    selected.set(neighbor.id, { node: neighbor, score: score * 0.4, viaEdge: edge });
                }
            }
        }

        // 3. Rank the selected subgraph and turn it into grounding facts.
        const rankedNodes = Array.from(selected.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, maxFacts)
            .map((s) => s.node);

        const nodeIds = new Set(rankedNodes.map((n) => n.id));
        const subEdges = this.graph.edges.filter(
            (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
        );

        const facts = [];
        for (const node of rankedNodes) {
            if (node.summary) facts.push(node.summary);
        }
        for (const edge of subEdges) {
            const s = this.nodesById.get(edge.source);
            const t = this.nodesById.get(edge.target);
            if (s && t && edge.label) {
                facts.push(`${s.label} ${edge.label} ${t.label}.`);
            }
        }

        // De-duplicate while preserving order.
        const seen = new Set();
        const dedupedFacts = facts.filter((f) => {
            const key = f.trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return { facts: dedupedFacts, nodes: rankedNodes, edges: subEdges };
    }
}
