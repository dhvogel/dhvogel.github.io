// Dark Mode Toggle
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    
    // Apply saved theme
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.removeAttribute('data-theme');
    }
    
    // Create or update theme toggle button
    let themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) {
        themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        
        // Insert inside nav-brand
        const navBrand = document.querySelector('.nav-brand');
        if (navBrand) {
            navBrand.appendChild(themeToggle);
        }
    }
    
    // Update button icon
    updateThemeIcon(themeToggle, savedTheme);
    
    // Add click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        if (newTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(themeToggle, newTheme);
    });
}

function updateThemeIcon(button, theme) {
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <line x1="12" y1="2" x2="12" y2="4"></line>
        <line x1="12" y1="20" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="4" y2="12"></line>
        <line x1="20" y1="12" x2="22" y2="12"></line>
        <line x1="6.34" y1="17.66" x2="4.93" y2="19.07"></line>
        <line x1="19.07" y1="4.93" x2="17.66" y2="6.34"></line>
    </svg>`;
    
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>`;
    
    if (theme === 'dark') {
        button.innerHTML = sunIcon;
        button.setAttribute('aria-label', 'Switch to light mode');
    } else {
        button.innerHTML = moonIcon;
        button.setAttribute('aria-label', 'Switch to dark mode');
    }
}

// Initialize dark mode when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    initDarkMode();
}

// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
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

// Check if running locally vs production
function isLocalEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    // Check for localhost, 127.0.0.1, or file:// protocol
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname === '' ||
           protocol === 'file:';
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
        
        // Filter out draft posts only in production
        const publishedPosts = isLocalEnvironment() 
            ? posts 
            : posts.filter(post => !post.draft);
        
        // Show only first 3 posts on homepage
        const previewPosts = publishedPosts.slice(0, 3);
        
        blogGrid.innerHTML = '';
        
        previewPosts.forEach((post) => {
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
            titleLink.href = `/blog/${post.slug}.html`;
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
            readMore.href = `/blog/${post.slug}.html`;
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

