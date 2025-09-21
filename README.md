# Resume Web Template

A modern, professional, and responsive resume template built with HTML, CSS, and JavaScript. This template provides a clean and elegant way to showcase your professional experience, skills, and achievements online.

## ✨ Features

- **Responsive Design**: Looks great on desktop, tablet, and mobile devices
- **Modern Styling**: Clean, professional design with a beautiful gradient header
- **Interactive Elements**: Hover effects, smooth scrolling, and click-to-copy contact info
- **Print-Friendly**: Optimized CSS for printing with a convenient print button
- **Accessible**: Built with semantic HTML and accessibility best practices
- **Easy to Customize**: Well-organized code structure for easy personalization
- **Performance Optimized**: Lightweight and fast-loading
- **📝 Visual Editor**: Built-in form editor for easy resume customization
- **📄 PDF Generation**: Create professional PDF resumes instantly
- **💾 Multiple Save Options**: Save to browser storage, download HTML, or create PDFs

## 🚀 Quick Start

### Option 1: Use the Visual Editor (Recommended)
1. **Open** `editor.html` in your web browser
2. **Fill out** all sections using the user-friendly form interface
3. **Preview** your resume using the preview button
4. **Save** your resume as HTML or generate a PDF
5. **Deploy** the generated files to your preferred hosting platform

### Option 2: Direct HTML Editing
1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Customize** the content with your information directly in the HTML
4. **Deploy** to your preferred hosting platform

## 📁 Project Structure

```
resume-web-template/
├── index.html          # Main resume page
├── styles.css          # Resume styling
├── script.js           # Interactive features for main resume
├── editor.html         # Visual resume editor interface
├── editor-styles.css   # Editor interface styling
├── editor-script.js    # Editor functionality and PDF generation
├── README.md           # Documentation (this file)
├── .gitignore          # Git ignore patterns
├── package.json        # Project configuration
└── WARP.md            # Development guidance
```

## 🎨 Customization Guide

### 1. Personal Information

Edit the following sections in `index.html`:

**Header Section:**
```html
<h1 class="name">Your Full Name</h1>
<p class="title">Your Professional Title</p>
<div class="contact-info">
    <span class="email">your.email@example.com</span>
    <span class="phone">+1 (555) 123-4567</span>
    <span class="location">City, State</span>
    <span class="website">yourwebsite.com</span>
</div>
```

**Professional Summary:**
Update the summary text in the `.about` section with your own professional summary.

### 2. Work Experience

Add your work experience by modifying the `.job` elements:

```html
<div class="job">
    <div class="job-header">
        <h3 class="job-title">Your Job Title</h3>
        <span class="job-company">Company Name</span>
        <span class="job-location">Location</span>
        <span class="job-dates">Start Date - End Date</span>
    </div>
    <ul class="job-responsibilities">
        <li>Your key responsibility or achievement</li>
        <li>Another important accomplishment</li>
        <li>Technical skills or leadership experience</li>
    </ul>
</div>
```

### 3. Skills

Update the skill categories and tags in the `.skills` section:

```html
<div class="skill-category">
    <h3 class="skill-category-title">Category Name</h3>
    <div class="skill-tags">
        <span class="skill-tag">Skill 1</span>
        <span class="skill-tag">Skill 2</span>
        <!-- Add more skills as needed -->
    </div>
</div>
```

### 4. Education

Modify the `.education-item` elements:

```html
<div class="education-item">
    <div class="education-header">
        <h3 class="degree">Your Degree</h3>
        <span class="school">University Name</span>
        <span class="education-location">Location</span>
        <span class="graduation-date">Graduation Year</span>
    </div>
    <p class="education-details">
        Additional details about your education
    </p>
</div>
```

### 5. Projects

Add or modify project entries:

```html
<div class="project">
    <div class="project-header">
        <h3 class="project-title">Project Name</h3>
        <span class="project-tech">Technologies Used</span>
        <a href="your-project-url" class="project-link">View Project</a>
    </div>
    <p class="project-description">
        Brief description of your project and achievements
    </p>
</div>
```

## 🎨 Styling Customization

### Color Scheme

The template uses a purple gradient theme. To change colors, modify these CSS variables in `styles.css`:

```css
/* Main theme colors */
--primary-color: #667eea;
--secondary-color: #764ba2;
--text-color: #495057;
--muted-color: #6c757d;
--background-color: #f8f9fa;
```

### Fonts

The template uses system fonts for better performance. To use a custom font:

1. Add the font import to the `<head>` section of `index.html`
2. Update the `font-family` in the `body` selector in `styles.css`

### Layout

The template uses CSS Grid and Flexbox for layout. Key layout elements:

- **Container width**: Adjust `max-width` in `.container` (default: 900px)
- **Section spacing**: Modify margins in `.section`
- **Grid layouts**: Customize grid templates in `.job-header`, `.education-header`, etc.

## 💡 Interactive Features

### Print Functionality
- **Print Button**: Fixed position button for easy printing
- **Print Styles**: Optimized CSS for print media
- **Keyboard Shortcut**: Ctrl+P for quick printing

### Contact Information
- **Click to Copy**: Click any contact info to copy to clipboard
- **Visual Feedback**: Hover effects and copy notifications

### Animations
- **Scroll Animations**: Sections fade in as you scroll
- **Hover Effects**: Interactive elements respond to mouse hover
- **Smooth Scrolling**: Smooth scrolling for internal links

### Accessibility Features
- **Semantic HTML**: Proper heading structure and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Friendly**: ARIA labels and semantic elements

## 📱 Responsive Breakpoints

- **Desktop**: 769px and up
- **Tablet**: 768px and down
- **Mobile**: Optimized for small screens

## 🚀 Deployment Options

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select your source branch
4. Your resume will be available at `https://yourusername.github.io/repository-name`

### Netlify
1. Connect your repository to Netlify
2. Deploy automatically on push
3. Custom domain support available

### Vercel
1. Import your repository
2. Automatic deployments
3. Built-in performance optimizations

### Traditional Web Hosting
Upload all files to your web hosting provider's public folder.

## 🔧 Browser Support

- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **Fallbacks**: Graceful degradation for older browsers
- **Mobile Browsers**: Optimized for mobile Safari and Chrome

## 📝 SEO Optimization

To improve search engine visibility:

1. **Update the title tag** in `index.html`
2. **Add meta description**: 
   ```html
   <meta name="description" content="Professional resume of Your Name - Your Title">
   ```
3. **Add Open Graph tags** for social media sharing
4. **Include structured data** for better search results

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

If you encounter any issues or have questions:

1. Check the documentation above
2. Search existing issues
3. Create a new issue with details about your problem

## 🙏 Acknowledgments

- Design inspiration from modern resume templates
- Built with semantic HTML5 and modern CSS3
- JavaScript features for enhanced user experience

---

**Happy job hunting! 🎯**

Remember to customize this template with your own information and make it uniquely yours!