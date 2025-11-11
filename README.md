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

1. Find the blog section in `index.html` (around line 160)
2. Add new blog post cards with your content
3. Link to full blog post pages (you can create separate HTML files for each post)

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

