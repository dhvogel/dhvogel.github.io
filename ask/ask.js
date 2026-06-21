// ask.js
//
// Orchestrates the "Ask about Dan" feature:
//   1. Retrieval: pull a relevant subgraph of facts from the knowledge graph.
//   2. Inference: run an open-weights LLM entirely in the visitor's browser via
//      WebLLM (WebGPU). No backend, no API keys, zero inference cost.
//
// Everything runs client-side, so this works on static hosting (GitHub Pages).

import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
import { GraphTraversalRetriever } from "./retrieval.js";

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

const SYSTEM_PROMPT = `You are an assistant that answers questions about Dan Vogel on his personal website.
You will be given a set of FACTS about Dan. Answer the user's question using ONLY those facts.
Rules:
- Speak about Dan in the third person ("Dan", "he").
- If the facts do not contain the answer, say you don't have that information about Dan rather than guessing.
- Be concise, friendly, and professional. Do not invent details, dates, employers, or projects.`;

const els = {};
let engine = null;
let retriever = null;
let modelReady = false;
let loadingModel = false;
const history = [];

function $(id) {
    return document.getElementById(id);
}

function setStatus(text, busy = false) {
    if (!els.status) return;
    els.status.textContent = text || "";
    els.status.style.display = text ? "flex" : "none";
    els.status.classList.toggle("ask-status--busy", busy);
}

function webGpuSupported() {
    return typeof navigator !== "undefined" && "gpu" in navigator;
}

function connectionInfo() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return { known: false, metered: false, slow: false };
    const slow = ["slow-2g", "2g", "3g"].includes(c.effectiveType);
    const metered = c.saveData === true || c.type === "cellular";
    return { known: true, metered, slow };
}

function addMessage(role, text) {
    const wrap = document.createElement("div");
    wrap.className = `ask-msg ask-msg--${role}`;
    const bubble = document.createElement("div");
    bubble.className = "ask-bubble";
    if (role === "assistant" && typeof marked !== "undefined") {
        bubble.innerHTML = marked.parse(text || "");
    } else {
        bubble.textContent = text;
    }
    wrap.appendChild(bubble);
    els.messages.appendChild(wrap);
    els.messages.scrollTop = els.messages.scrollHeight;
    return bubble;
}

function setControlsEnabled(enabled) {
    els.input.disabled = !enabled;
    els.send.disabled = !enabled;
}

async function ensureModel() {
    if (modelReady || loadingModel) return;
    loadingModel = true;
    setControlsEnabled(false);

    try {
        retriever = retriever || (await new GraphTraversalRetriever("knowledge-graph.json").load());

        engine = await CreateMLCEngine(MODEL_ID, {
            initProgressCallback: (report) => {
                setStatus(report.text || "Loading model…", true);
            }
        });
        modelReady = true;
        setStatus("");
        addMessage("assistant", "Hi! I'm an AI running entirely in your browser. Ask me anything about Dan's work, projects, writing, or background.");
    } catch (err) {
        console.error(err);
        setStatus(`Couldn't load the model: ${err.message}`, false);
    } finally {
        loadingModel = false;
        setControlsEnabled(modelReady);
        if (modelReady) els.input.focus();
    }
}

function buildPrompt(question) {
    const { facts } = retriever.retrieve(question);
    const factsBlock = facts.length
        ? facts.map((f) => `- ${f}`).join("\n")
        : "- (No specific facts matched this question.)";
    return `FACTS about Dan Vogel:\n${factsBlock}\n\nQuestion: ${question}`;
}

async function handleAsk() {
    const question = els.input.value.trim();
    if (!question || !modelReady) return;

    els.input.value = "";
    addMessage("user", question);
    setControlsEnabled(false);
    setStatus("Thinking…", true);

    const grounded = buildPrompt(question);
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: grounded }
    ];

    const bubble = addMessage("assistant", "");
    let answer = "";

    try {
        const chunks = await engine.chat.completions.create({
            messages,
            temperature: 0.4,
            stream: true
        });
        for await (const chunk of chunks) {
            const delta = chunk.choices?.[0]?.delta?.content || "";
            if (delta) {
                answer += delta;
                bubble.innerHTML = (typeof marked !== "undefined")
                    ? marked.parse(answer)
                    : answer;
                els.messages.scrollTop = els.messages.scrollHeight;
            }
        }
        // Keep a short rolling history (raw question, not the grounded prompt).
        history.push({ role: "user", content: question });
        history.push({ role: "assistant", content: answer });
        while (history.length > 6) history.shift();
    } catch (err) {
        console.error(err);
        bubble.textContent = `Something went wrong generating an answer: ${err.message}`;
    } finally {
        setStatus("");
        setControlsEnabled(true);
        els.input.focus();
    }
}

function init() {
    els.start = $("ask-start");
    els.startBtn = $("ask-start-btn");
    els.chat = $("ask-chat");
    els.messages = $("ask-messages");
    els.input = $("ask-input");
    els.send = $("ask-send");
    els.status = $("ask-status");
    els.unsupported = $("ask-unsupported");

    if (!webGpuSupported()) {
        if (els.start) els.start.style.display = "none";
        if (els.unsupported) els.unsupported.style.display = "block";
        return;
    }

    // Warm up the retriever immediately — the graph is tiny and this removes it
    // from the critical path before the first question.
    retriever = new GraphTraversalRetriever("knowledge-graph.json");
    const retrieverReady = retriever.load().catch((err) => {
        console.error("Failed to preload knowledge graph:", err);
        retriever = null;
    });

    // Warn (don't block) when the visitor appears to be on a slow/metered
    // connection, since starting is a ~0.9 GB download. Nothing downloads until
    // they explicitly click, so simply visiting the page never uses data.
    const info = connectionInfo();
    const warning = $("ask-start-warning");
    if (warning && (info.metered || info.slow)) {
        warning.textContent = "Heads up: you appear to be on a slow or metered connection. This is a ~0.9 GB download and may use mobile data \u2014 it only starts if you tap below.";
        warning.style.display = "block";
    }

    // The explicit click is the consent gate for the download.
    els.startBtn.addEventListener("click", async () => {
        localStorage.setItem("askModelConsent", "1");
        els.start.style.display = "none";
        els.chat.style.display = "flex";
        setControlsEnabled(false);
        await retrieverReady;
        await ensureModel();
    });

    els.send.addEventListener("click", handleAsk);
    els.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    });

    els.chat.querySelectorAll("[data-example]").forEach((btn) => {
        btn.addEventListener("click", () => {
            els.input.value = btn.getAttribute("data-example");
            if (modelReady) handleAsk();
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
