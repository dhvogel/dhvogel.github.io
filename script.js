// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Load and render projects from JSON
async function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    
    try {
        const response = await fetch('projects.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const projects = await response.json();
        
        // Validate projects is an array
        if (!Array.isArray(projects)) {
            throw new Error('projects.json does not contain an array');
        }
        
        // Clear existing content
        projectsGrid.innerHTML = '';
        
        projects.forEach(project => {
            // Create project card
            const card = document.createElement('div');
            card.className = 'project-card';
            
            // Image (if provided)
            if (project.image) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'project-image';
                const img = document.createElement('img');
                img.src = project.image;
                img.alt = project.title;
                
                // Make image clickable if demo link exists
                if (project.links && project.links.demo && project.links.demo !== '#') {
                    const imageLink = document.createElement('a');
                    imageLink.href = project.links.demo;
                    imageLink.target = '_blank';
                    imageLink.appendChild(img);
                    imageContainer.appendChild(imageLink);
                } else {
                    imageContainer.appendChild(img);
                }
                
                card.appendChild(imageContainer);
            }
            
            const content = document.createElement('div');
            content.className = 'project-content';
            
            // Title
            const title = document.createElement('h3');
            title.className = 'project-title';
            title.textContent = project.title;
            content.appendChild(title);
            
            // Description
            const description = document.createElement('p');
            description.className = 'project-description';
            description.textContent = project.description;
            content.appendChild(description);
            
            // Technologies
            if (project.technologies && Array.isArray(project.technologies)) {
                const techContainer = document.createElement('div');
                techContainer.className = 'project-tech';
                project.technologies.forEach(tech => {
                    const techTag = document.createElement('span');
                    techTag.className = 'tech-tag';
                    techTag.textContent = tech;
                    techContainer.appendChild(techTag);
                });
                content.appendChild(techContainer);
            }
            
            // Links
            if (project.links) {
                const linksContainer = document.createElement('div');
                linksContainer.className = 'project-links';
                
                if (project.links.demo && project.links.demo !== '#') {
                    const demoLink = document.createElement('a');
                    demoLink.href = project.links.demo;
                    demoLink.className = 'project-link';
                    demoLink.target = '_blank';
                    demoLink.textContent = 'Live Demo';
                    linksContainer.appendChild(demoLink);
                }
                
                if (project.links.github && project.links.github !== '#') {
                    const githubLink = document.createElement('a');
                    githubLink.href = project.links.github;
                    githubLink.className = 'project-link';
                    githubLink.target = '_blank';
                    githubLink.textContent = 'GitHub';
                    linksContainer.appendChild(githubLink);
                }
                
                content.appendChild(linksContainer);
            }
            
            card.appendChild(content);
            projectsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = `<p style="color: var(--text-secondary);">Unable to load projects. ${error.message}. Make sure you're running this from a web server (not file://).</p>`;
    }
}

// Load and render blog post previews on homepage
async function loadBlogPreviews() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;
    
    try {
        // Try different possible paths
        let response = await fetch('blog/blog.json');
        
        // If that fails, try without blog/ prefix (in case we're in a subdirectory)
        if (!response.ok) {
            response = await fetch('/blog/blog.json');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        if (!Array.isArray(posts)) {
            throw new Error('blog.json does not contain an array');
        }
        
        // Show only first 3 posts on homepage
        const previewPosts = posts.slice(0, 3);
        
        blogGrid.innerHTML = '';
        
        previewPosts.forEach((post, index) => {
            // Create blog card
            const card = document.createElement('article');
            card.className = 'blog-card';
            
            // Date
            const date = document.createElement('div');
            date.className = 'blog-date';
            date.textContent = post.date;
            card.appendChild(date);
            
            // Title
            const title = document.createElement('h3');
            title.className = 'blog-title';
            const titleLink = document.createElement('a');
            titleLink.href = `/blog/blog-${index + 1}.html`;
            titleLink.textContent = post.title;
            title.appendChild(titleLink);
            card.appendChild(title);
            
            // Excerpt
            const excerpt = document.createElement('p');
            excerpt.className = 'blog-excerpt';
            excerpt.textContent = post.excerpt;
            card.appendChild(excerpt);
            
            // Read More link
            const readMore = document.createElement('a');
            readMore.href = `/blog/blog-${index + 1}.html`;
            readMore.className = 'blog-read-more';
            readMore.textContent = 'Read More →';
            card.appendChild(readMore);
            
            blogGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading blog previews:', error);
        console.error('Attempted to fetch from: blog/blog.json');
        const blogGrid = document.getElementById('blog-grid');
        if (blogGrid) {
            blogGrid.innerHTML = `<p style="color: var(--text-secondary);">Unable to load blog posts. Make sure you're running this from a web server (not file://). Error: ${error.message}</p>`;
        }
    }
}

// Load projects when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadProjects();
        loadBlogPreviews();
    });
} else {
    loadProjects();
    loadBlogPreviews();
}

