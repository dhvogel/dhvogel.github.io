# Dan Vogel - Personal Website

A modern, responsive personal website showcasing Dan Vogel's software engineering portfolio, personal story, and blog.

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Portfolio Showcase**: Display your software engineering projects
- **Personal Story**: Share your journey and background
- **Blog Section**: Space for writing and sharing insights
- **Contact Form**: Easy way for potential employers to reach out

## Structure

```
dhvogel.github.io/
├── index.html      # Main HTML file
├── styles.css      # All styling
├── script.js       # JavaScript for interactivity
├── projects.json   # Project data (configurable)
└── README.md       # This file
```

## Getting Started

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Customize** the content:
   - Update personal information in `index.html`
   - Add your actual projects
   - Write blog posts
   - Update contact information
   - Modify skills and technologies

## Customization Guide

### Update Personal Information

1. Edit the hero section in `index.html` (around line 30)
2. Update the About section with your personal story
3. Modify the skills section with your actual technologies

### Add Your Projects

Projects are now loaded dynamically from `projects.json`. To add or update projects:

1. Open `projects.json` in a text editor
2. Edit the JSON array to add, remove, or modify projects
3. Each project should have:
   - `title`: Project name
   - `description`: Brief description of the project
   - `technologies`: Array of technology names (e.g., `["React", "Node.js"]`)
   - `links`: Object with `demo` and `github` URLs (use `"#"` to hide a link)
4. Save the file - projects will automatically load when you refresh the page

Example project entry:
```json
{
    "title": "My Awesome Project",
    "description": "A project that solves an important problem using modern technologies.",
    "technologies": ["React", "TypeScript", "Node.js"],
    "links": {
        "demo": "https://myproject.com",
        "github": "https://github.com/username/project"
    }
}
```

### Write Blog Posts

Blog posts are loaded dynamically from `blog/blog.json`. To add or update blog posts:

1. Create a markdown file (`.md`) in the `blog/` directory with your post content
2. Create an HTML file (`.html`) in the `blog/` directory that renders the markdown (you can use the existing posts as templates)
3. Add an entry to `blog/blog.json` with the following fields:
   - `slug`: URL-friendly identifier (matches the HTML filename without `.html`)
   - `title`: Post title
   - `date`: Publication date (e.g., "November 26, 2025")
   - `excerpt`: Short description/preview text
   - `file`: Name of the markdown file (e.g., "my-post.md")
   - `draft`: (optional) Set to `true` to hide the post from public listings. Omit or set to `false` to publish.

Example blog entry:
```json
{
    "slug": "my-new-post",
    "title": "My New Post",
    "date": "December 1, 2025",
    "excerpt": "This is a brief description of my post.",
    "file": "my-new-post.md",
    "draft": false
}
```

To create a draft post that won't appear on the blog listing or homepage in production:
```json
{
    "slug": "work-in-progress",
    "title": "Work in Progress",
    "date": "December 1, 2025",
    "excerpt": "This post is not ready yet.",
    "file": "work-in-progress.md",
    "draft": true
}
```

**Note**: Draft posts will be visible when running the site locally (localhost, 127.0.0.1, or file://), but will be hidden in production. This allows you to preview drafts during development while keeping them private on the live site.

### Update Contact Information

1. Find the contact section in `index.html` (around line 200)
2. Update email, LinkedIn, and GitHub links
3. Configure the contact form to work with your email service or backend

### Styling

- Modify `styles.css` to change colors, fonts, spacing, etc.
- Color scheme is defined in CSS variables at the top of `styles.css`
- Update the `:root` variables to quickly change the theme

## Deployment

### GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Select the branch (usually `main`) and folder (`/root`)
4. Your site will be available at `https://yourusername.github.io`

### Other Hosting Options

- **Netlify**: Drag and drop the folder or connect your Git repository
- **Vercel**: Import your Git repository
- **Any static hosting service**: Upload the files via FTP or their interface

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal use.

## Contact

For questions or suggestions, feel free to reach out!

