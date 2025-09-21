# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a modern, responsive resume template built as a static web application using vanilla HTML, CSS, and JavaScript. The template is designed to be customizable, print-friendly, and accessible, with interactive features for better user experience.

## Architecture

### Core Structure
- **Static Site**: No build process or framework dependencies - pure HTML/CSS/JS
- **Single Page Application**: All content contained in `index.html`
- **Modular Styling**: CSS organized by sections with CSS Grid and Flexbox layouts
- **Progressive Enhancement**: JavaScript adds interactivity but site works without it

### Key Files
- `index.html`: Main template structure with semantic HTML sections
- `styles.css`: Complete styling including responsive design and print styles
- `script.js`: Interactive features (animations, clipboard, print functionality)
- `package.json`: Development tooling and scripts (no runtime dependencies)

### Interactive Features Architecture
The JavaScript follows a module pattern with these key components:
- **Event-driven initialization**: DOMContentLoaded event triggers all setup
- **Observer pattern**: IntersectionObserver for scroll animations
- **Clipboard API**: Modern clipboard access with fallback for older browsers
- **Print optimization**: Dynamic print button with print-specific styles
- **Accessibility**: Keyboard navigation and semantic HTML structure

### CSS Architecture
- **CSS Custom Properties**: Theme colors defined as CSS variables
- **Mobile-first**: Responsive design with progressive enhancement
- **Print styles**: Dedicated `@media print` rules for resume printing
- **Component-based**: Each section has its own styling scope
- **Animation system**: CSS transitions with JavaScript triggers

## Common Development Commands

### Development Server
```bash
npm start                    # Start local server (tries Python, then npx http-server)
npm run serve               # Start http-server with no caching
```

### Code Quality
```bash
npm run lint                # Run all linters (HTML, CSS, JS)
npm run lint:html           # Check HTML with HTMLHint
npm run lint:css            # Check CSS with Stylelint  
npm run lint:js             # Check JavaScript with ESLint
npm run format              # Format all files with Prettier
```

### Testing & Validation
```bash
npm test                    # Currently placeholder - no tests defined
```

## Development Workflow

### Customizing Content
1. **Personal Info**: Update header section in `index.html` (name, title, contact)
2. **Work Experience**: Modify `.job` elements with your experience
3. **Skills**: Update skill categories and tags in `.skills` section
4. **Projects**: Add/modify `.project` elements
5. **Styling**: Adjust CSS variables in `styles.css` for theme colors

### Adding New Sections
1. Add semantic HTML structure to `index.html`
2. Style the section in `styles.css` following existing patterns
3. Add any interactive features to `script.js` following the event-driven pattern

### Print Optimization
The template includes comprehensive print styles. Test print layout by:
1. Using the "Print Resume" button
2. Browser print preview (Ctrl/Cmd+P)
3. Checking print styles in DevTools media emulation

### Responsive Testing
Test across breakpoints:
- Desktop: 769px and up (full layout)
- Tablet: 768px and down (adjusted spacing)
- Mobile: Optimized for small screens

## Deployment

### Static Hosting
Since this is a static site, deploy by uploading files to:
- **GitHub Pages**: Push to repo, enable Pages in settings
- **Netlify**: Connect repo for automatic deployments
- **Vercel**: Import repository for instant deployment
- **Traditional hosting**: Upload all files to web server

### Before Deployment
1. Customize all placeholder content in `index.html`
2. Update meta tags (title, description) for SEO
3. Test print functionality across browsers
4. Validate responsive design on various devices
5. Run `npm run format` for consistent code style

## Code Patterns

### Adding Interactive Elements
Follow the existing pattern in `script.js`:
```javascript
// Event listener pattern
element.addEventListener('event', function() {
    // Handle interaction
    // Update styles inline for dynamic effects
    // Provide user feedback
});
```

### CSS Component Pattern
New sections should follow this structure:
```css
.section-name {
    /* Base styles */
}

.section-name .element {
    /* Element-specific styles */
}

@media print {
    .section-name {
        /* Print-specific overrides */
    }
}
```

### Accessibility Considerations
- Use semantic HTML elements (`header`, `main`, `section`, `footer`)
- Maintain proper heading hierarchy (h1 → h2 → h3)
- Ensure keyboard navigation works for all interactive elements
- Provide meaningful alt text for any images added
- Test with screen readers when adding new content