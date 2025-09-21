// Resume Editor JavaScript
class ResumeEditor {
    constructor() {
        this.currentResumeData = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCurrentResumeData();
    }

    bindEvents() {
        // Button events with error handling
        document.getElementById('load-current')?.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Load current button clicked');
            this.loadCurrentResumeData().catch(error => {
                console.error('Error in loadCurrentResumeData:', error);
                this.showMessage('Error loading data: ' + error.message, 'error');
            });
        });
        
        document.getElementById('preview')?.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Preview button clicked');
            this.previewResume().catch(error => {
                console.error('Error in previewResume:', error);
                this.showMessage('Error generating preview: ' + error.message, 'error');
            });
        });
        
        document.getElementById('save')?.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Save button clicked');
            this.handleSave().catch(error => {
                console.error('Error in handleSave:', error);
                this.showMessage('Error saving resume: ' + error.message, 'error');
            });
        });
        
        // Remove the old download button handler since it's now part of save options

        // Dynamic form events
        document.getElementById('add-experience').addEventListener('click', () => this.addExperienceItem());
        document.getElementById('add-skill-category').addEventListener('click', () => this.addSkillCategory());
        document.getElementById('add-education').addEventListener('click', () => this.addEducationItem());
        document.getElementById('add-project').addEventListener('click', () => this.addProjectItem());

        // Remove events (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-experience')) {
                this.removeItem(e.target, '.experience-item');
            } else if (e.target.classList.contains('remove-skill-category')) {
                this.removeItem(e.target, '.skill-category');
            } else if (e.target.classList.contains('remove-education')) {
                this.removeItem(e.target, '.education-item');
            } else if (e.target.classList.contains('remove-project')) {
                this.removeItem(e.target, '.project-item');
            }
        });

        // Modal events
        document.querySelector('.close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('preview-modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Filename modal events
        document.getElementById('filename-close')?.addEventListener('click', () => this.closeFilenameModal());
        document.getElementById('cancel-filename')?.addEventListener('click', () => this.closeFilenameModal());
        document.getElementById('save-with-filename')?.addEventListener('click', () => this.saveWithCustomFilename());
        document.getElementById('filename-modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeFilenameModal();
        });

        // Auto-save functionality
        document.getElementById('resume-form')?.addEventListener('input', () => {
            this.autoSave();
        });

        // Save location help text updates
        document.getElementById('save-location')?.addEventListener('change', (e) => {
            this.updateSaveHelp(e.target.value);
        });
    }

    async loadCurrentResumeData() {
        try {
            // Check if there's saved data in localStorage first
            const savedData = localStorage.getItem('resumeEditorData');
            if (savedData) {
                this.currentResumeData = JSON.parse(savedData);
                this.populateForm(this.currentResumeData);
                this.showMessage('Loaded saved resume data', 'success');
                return;
            }

            // If no saved data, try to parse the current index.html
            try {
                const response = await fetch('./index.html');
                if (!response.ok) {
                    throw new Error('Could not fetch index.html');
                }
                const html = await response.text();
                this.currentResumeData = this.parseResumeFromHTML(html);
                this.populateForm(this.currentResumeData);
                this.showMessage('Loaded current resume from index.html', 'success');
            } catch (fetchError) {
                console.warn('Could not fetch index.html, loading with default data:', fetchError);
                // Load with default/empty data
                this.currentResumeData = this.getDefaultResumeData();
                this.populateForm(this.currentResumeData);
                this.showMessage('Loaded with default template', 'success');
            }
        } catch (error) {
            console.error('Error loading resume data:', error);
            this.showMessage('Error loading resume data', 'error');
        }
    }

    parseResumeFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const data = {
            personal: {
                fullName: doc.querySelector('.name')?.textContent || '',
                jobTitle: doc.querySelector('.title')?.textContent || '',
                email: doc.querySelector('.email')?.textContent || '',
                phone: doc.querySelector('.phone')?.textContent || '',
                location: doc.querySelector('.location')?.textContent || '',
                website: doc.querySelector('.website')?.textContent || ''
            },
            summary: doc.querySelector('.summary-text')?.textContent.trim() || '',
            experience: [],
            skills: [],
            education: [],
            projects: []
        };

        // Parse experience
        doc.querySelectorAll('.job').forEach(job => {
            data.experience.push({
                title: job.querySelector('.job-title')?.textContent || '',
                company: job.querySelector('.job-company')?.textContent || '',
                location: job.querySelector('.job-location')?.textContent || '',
                dates: job.querySelector('.job-dates')?.textContent || '',
                responsibilities: Array.from(job.querySelectorAll('.job-responsibilities li'))
                    .map(li => li.textContent).join('\n')
            });
        });

        // Parse skills
        doc.querySelectorAll('.skill-category').forEach(category => {
            const categoryTitle = category.querySelector('.skill-category-title')?.textContent || '';
            const skills = Array.from(category.querySelectorAll('.skill-tag'))
                .map(tag => tag.textContent).join(', ');
            data.skills.push({
                category: categoryTitle,
                skills: skills
            });
        });

        // Parse education
        doc.querySelectorAll('.education-item').forEach(item => {
            data.education.push({
                degree: item.querySelector('.degree')?.textContent || '',
                school: item.querySelector('.school')?.textContent || '',
                location: item.querySelector('.education-location')?.textContent || '',
                date: item.querySelector('.graduation-date')?.textContent || '',
                details: item.querySelector('.education-details')?.textContent || ''
            });
        });

        // Parse projects
        doc.querySelectorAll('.project').forEach(project => {
            data.projects.push({
                title: project.querySelector('.project-title')?.textContent || '',
                tech: project.querySelector('.project-tech')?.textContent || '',
                link: project.querySelector('.project-link')?.href || '',
                description: project.querySelector('.project-description')?.textContent || ''
            });
        });

        return data;
    }

    getDefaultResumeData() {
        return {
            personal: {
                fullName: 'Brian M Coonan',
                jobTitle: 'Solution Manager',
                email: 'bmcoonan@gmail.com',
                phone: '+1 (989) 798-7304',
                location: 'Bay City, MI',
                website: 'yourwebsite.com'
            },
            summary: 'Experienced Solution Manager with a proven track record of driving strategic initiatives and delivering innovative solutions across diverse industries. Expertise in stakeholder management, process optimization, and cross-functional team leadership, with a strong focus on translating business requirements into actionable technical solutions. Passionate about leveraging technology and data-driven insights to solve complex business challenges and drive organizational growth.',
            experience: [
                {
                    title: 'Job Title',
                    company: 'Company Name',
                    location: 'Location',
                    dates: 'Start Date - End Date',
                    responsibilities: '• Key responsibility or achievement with quantifiable results\n• Another important accomplishment demonstrating your impact\n• Technical skills or leadership experience relevant to the role'
                }
            ],
            skills: [
                {
                    category: 'Programming Languages',
                    skills: 'JavaScript, Python, Java, TypeScript'
                },
                {
                    category: 'Frameworks & Libraries',
                    skills: 'React, Node.js, Express, Django'
                },
                {
                    category: 'Tools & Technologies',
                    skills: 'Git, Docker, AWS, MongoDB'
                }
            ],
            education: [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    school: 'University Name',
                    location: 'Location',
                    date: 'Graduation Year',
                    details: 'Relevant coursework, honors, or notable achievements during your studies.'
                }
            ],
            projects: [
                {
                    title: 'Project Name',
                    tech: 'Technologies Used',
                    link: '#',
                    description: 'Brief description of the project, your role, and key achievements or learnings.'
                }
            ]
        };
    }

    populateForm(data) {
        // Personal information
        if (data.personal) {
            document.getElementById('full-name').value = data.personal.fullName || '';
            document.getElementById('job-title').value = data.personal.jobTitle || '';
            document.getElementById('email').value = data.personal.email || '';
            document.getElementById('phone').value = data.personal.phone || '';
            document.getElementById('location').value = data.personal.location || '';
            document.getElementById('website').value = data.personal.website || '';
        }

        // Summary
        document.getElementById('summary').value = data.summary || '';

        // Experience
        this.populateExperience(data.experience || []);

        // Skills
        this.populateSkills(data.skills || []);

        // Education
        this.populateEducation(data.education || []);

        // Projects
        this.populateProjects(data.projects || []);
    }

    populateExperience(experiences) {
        const container = document.getElementById('experience-container');
        container.innerHTML = '';
        
        experiences.forEach((exp, index) => {
            this.addExperienceItem(exp, index);
        });

        if (experiences.length === 0) {
            this.addExperienceItem();
        }
    }

    populateSkills(skills) {
        const container = document.getElementById('skills-container');
        container.innerHTML = '';
        
        skills.forEach((skill, index) => {
            this.addSkillCategory(skill, index);
        });

        if (skills.length === 0) {
            this.addSkillCategory();
        }
    }

    populateEducation(education) {
        const container = document.getElementById('education-container');
        container.innerHTML = '';
        
        education.forEach((edu, index) => {
            this.addEducationItem(edu, index);
        });

        if (education.length === 0) {
            this.addEducationItem();
        }
    }

    populateProjects(projects) {
        const container = document.getElementById('projects-container');
        container.innerHTML = '';
        
        projects.forEach((project, index) => {
            this.addProjectItem(project, index);
        });

        if (projects.length === 0) {
            this.addProjectItem();
        }
    }

    addExperienceItem(data = {}, index = null) {
        const container = document.getElementById('experience-container');
        const itemIndex = index !== null ? index : container.children.length;
        
        const item = document.createElement('div');
        item.className = 'experience-item';
        item.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" name="experience[${itemIndex}][title]" value="${data.title || ''}" placeholder="Job Title">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" name="experience[${itemIndex}][company]" value="${data.company || ''}" placeholder="Company Name">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="experience[${itemIndex}][location]" value="${data.location || ''}" placeholder="City, State">
                </div>
                <div class="form-group">
                    <label>Dates</label>
                    <input type="text" name="experience[${itemIndex}][dates]" value="${data.dates || ''}" placeholder="Jan 2020 - Present">
                </div>
            </div>
            <div class="form-group">
                <label>Responsibilities (one per line)</label>
                <textarea name="experience[${itemIndex}][responsibilities]" rows="4" placeholder="• Key responsibility or achievement&#10;• Another important accomplishment&#10;• Technical skills or leadership experience">${data.responsibilities || ''}</textarea>
            </div>
            <button type="button" class="remove-experience btn btn-danger">Remove</button>
        `;
        
        container.appendChild(item);
    }

    addSkillCategory(data = {}, index = null) {
        const container = document.getElementById('skills-container');
        const itemIndex = index !== null ? index : container.children.length;
        
        const item = document.createElement('div');
        item.className = 'skill-category';
        item.innerHTML = `
            <div class="form-group">
                <label>Category Name</label>
                <input type="text" name="skills[${itemIndex}][category]" value="${data.category || ''}" placeholder="Programming Languages">
            </div>
            <div class="form-group">
                <label>Skills (comma-separated)</label>
                <input type="text" name="skills[${itemIndex}][skills]" value="${data.skills || ''}" placeholder="JavaScript, Python, Java, TypeScript">
            </div>
            <button type="button" class="remove-skill-category btn btn-danger">Remove</button>
        `;
        
        container.appendChild(item);
    }

    addEducationItem(data = {}, index = null) {
        const container = document.getElementById('education-container');
        const itemIndex = index !== null ? index : container.children.length;
        
        const item = document.createElement('div');
        item.className = 'education-item';
        item.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" name="education[${itemIndex}][degree]" value="${data.degree || ''}" placeholder="Bachelor of Science in Computer Science">
                </div>
                <div class="form-group">
                    <label>School</label>
                    <input type="text" name="education[${itemIndex}][school]" value="${data.school || ''}" placeholder="University Name">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="education[${itemIndex}][location]" value="${data.location || ''}" placeholder="City, State">
                </div>
                <div class="form-group">
                    <label>Graduation Date</label>
                    <input type="text" name="education[${itemIndex}][date]" value="${data.date || ''}" placeholder="2020">
                </div>
            </div>
            <div class="form-group">
                <label>Details (optional)</label>
                <textarea name="education[${itemIndex}][details]" rows="2" placeholder="Relevant coursework, honors, or notable achievements...">${data.details || ''}</textarea>
            </div>
            <button type="button" class="remove-education btn btn-danger">Remove</button>
        `;
        
        container.appendChild(item);
    }

    addProjectItem(data = {}, index = null) {
        const container = document.getElementById('projects-container');
        const itemIndex = index !== null ? index : container.children.length;
        
        const item = document.createElement('div');
        item.className = 'project-item';
        item.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" name="projects[${itemIndex}][title]" value="${data.title || ''}" placeholder="Project Name">
                </div>
                <div class="form-group">
                    <label>Technologies</label>
                    <input type="text" name="projects[${itemIndex}][tech]" value="${data.tech || ''}" placeholder="React, Node.js, MongoDB">
                </div>
            </div>
            <div class="form-group">
                <label>Project Link (optional)</label>
                <input type="url" name="projects[${itemIndex}][link]" value="${data.link || ''}" placeholder="https://github.com/username/project">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="projects[${itemIndex}][description]" rows="3" placeholder="Brief description of the project, your role, and key achievements...">${data.description || ''}</textarea>
            </div>
            <button type="button" class="remove-project btn btn-danger">Remove</button>
        `;
        
        container.appendChild(item);
    }

    removeItem(button, selector) {
        const item = button.closest(selector);
        if (item) {
            item.remove();
            this.reindexItems();
        }
    }

    reindexItems() {
        // Reindex experience items
        document.querySelectorAll('.experience-item').forEach((item, index) => {
            item.querySelectorAll('input, textarea').forEach(field => {
                const name = field.name;
                if (name && name.includes('experience[')) {
                    field.name = name.replace(/experience\[\d+\]/, `experience[${index}]`);
                }
            });
        });

        // Reindex skill categories
        document.querySelectorAll('.skill-category').forEach((item, index) => {
            item.querySelectorAll('input').forEach(field => {
                const name = field.name;
                if (name && name.includes('skills[')) {
                    field.name = name.replace(/skills\[\d+\]/, `skills[${index}]`);
                }
            });
        });

        // Reindex education items
        document.querySelectorAll('.education-item').forEach((item, index) => {
            item.querySelectorAll('input, textarea').forEach(field => {
                const name = field.name;
                if (name && name.includes('education[')) {
                    field.name = name.replace(/education\[\d+\]/, `education[${index}]`);
                }
            });
        });

        // Reindex project items
        document.querySelectorAll('.project-item').forEach((item, index) => {
            item.querySelectorAll('input, textarea').forEach(field => {
                const name = field.name;
                if (name && name.includes('projects[')) {
                    field.name = name.replace(/projects\[\d+\]/, `projects[${index}]`);
                }
            });
        });
    }

    collectFormData() {
        const formData = new FormData(document.getElementById('resume-form'));
        const data = {
            personal: {
                fullName: formData.get('fullName') || '',
                jobTitle: formData.get('jobTitle') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                location: formData.get('location') || '',
                website: formData.get('website') || ''
            },
            summary: formData.get('summary') || '',
            experience: [],
            skills: [],
            education: [],
            projects: []
        };

        // Collect experience data
        let expIndex = 0;
        while (formData.get(`experience[${expIndex}][title]`) !== null) {
            data.experience.push({
                title: formData.get(`experience[${expIndex}][title]`) || '',
                company: formData.get(`experience[${expIndex}][company]`) || '',
                location: formData.get(`experience[${expIndex}][location]`) || '',
                dates: formData.get(`experience[${expIndex}][dates]`) || '',
                responsibilities: formData.get(`experience[${expIndex}][responsibilities]`) || ''
            });
            expIndex++;
        }

        // Collect skills data
        let skillIndex = 0;
        while (formData.get(`skills[${skillIndex}][category]`) !== null) {
            data.skills.push({
                category: formData.get(`skills[${skillIndex}][category]`) || '',
                skills: formData.get(`skills[${skillIndex}][skills]`) || ''
            });
            skillIndex++;
        }

        // Collect education data
        let eduIndex = 0;
        while (formData.get(`education[${eduIndex}][degree]`) !== null) {
            data.education.push({
                degree: formData.get(`education[${eduIndex}][degree]`) || '',
                school: formData.get(`education[${eduIndex}][school]`) || '',
                location: formData.get(`education[${eduIndex}][location]`) || '',
                date: formData.get(`education[${eduIndex}][date]`) || '',
                details: formData.get(`education[${eduIndex}][details]`) || ''
            });
            eduIndex++;
        }

        // Collect projects data
        let projIndex = 0;
        while (formData.get(`projects[${projIndex}][title]`) !== null) {
            data.projects.push({
                title: formData.get(`projects[${projIndex}][title]`) || '',
                tech: formData.get(`projects[${projIndex}][tech]`) || '',
                link: formData.get(`projects[${projIndex}][link]`) || '',
                description: formData.get(`projects[${projIndex}][description]`) || ''
            });
            projIndex++;
        }

        return data;
    }

    async generateResumeHTML(data) {
        // Load the original template
        let html;
        try {
            const response = await fetch('./index.html');
            if (!response.ok) {
                throw new Error('Could not fetch index.html');
            }
            html = await response.text();
        } catch (fetchError) {
            console.warn('Could not fetch index.html for generation, using stored template:', fetchError);
            // Use a basic template if we can't fetch the original
            html = this.getBasicTemplate();
        }
        
        // Replace personal information
        html = html.replace(/<h1 class="name">.*?<\/h1>/, `<h1 class="name">${data.personal.fullName}</h1>`);
        html = html.replace(/<p class="title">.*?<\/p>/, `<p class="title">${data.personal.jobTitle}</p>`);
        html = html.replace(/<span class="email">.*?<\/span>/, `<span class="email">${data.personal.email}</span>`);
        html = html.replace(/<span class="phone">.*?<\/span>/, `<span class="phone">${data.personal.phone}</span>`);
        html = html.replace(/<span class="location">.*?<\/span>/, `<span class="location">${data.personal.location}</span>`);
        html = html.replace(/<span class="website">.*?<\/span>/, `<span class="website">${data.personal.website}</span>`);
        
        // Replace summary
        html = html.replace(/<p class="summary-text">[\s\S]*?<\/p>/, `<p class="summary-text">
                    ${data.summary}
                </p>`);

        // Replace experience section
        const experienceHTML = data.experience.map(exp => {
            const responsibilities = exp.responsibilities
                .split('\n')
                .filter(r => r.trim())
                .map(r => `<li>${r.replace(/^•\s*/, '')}</li>`)
                .join('\n                        ');
            
            return `<div class="job">
                    <div class="job-header">
                        <h3 class="job-title">${exp.title}</h3>
                        <span class="job-company">${exp.company}</span>
                        <span class="job-location">${exp.location}</span>
                        <span class="job-dates">${exp.dates}</span>
                    </div>
                    <ul class="job-responsibilities">
                        ${responsibilities}
                    </ul>
                </div>`;
        }).join('\n\n                ');

        // Find and replace the experience section more reliably
        const experienceRegex = /<section class="section experience">[\s\S]*?<\/section>/;
        const experienceMatch = html.match(experienceRegex);
        if (experienceMatch) {
            const newExperienceSection = `<section class="section experience">
                <h2 class="section-title">Work Experience</h2>
                
                ${experienceHTML}
            </section>`;
            html = html.replace(experienceRegex, newExperienceSection);
        }

        // Replace skills section
        const skillsHTML = data.skills.map(skillCat => {
            const skillTags = skillCat.skills
                .split(',')
                .map(s => s.trim())
                .filter(s => s)
                .map(s => `<span class="skill-tag">${s}</span>`)
                .join('\n                            ');
            
            return `<div class="skill-category">
                        <h3 class="skill-category-title">${skillCat.category}</h3>
                        <div class="skill-tags">
                            ${skillTags}
                        </div>
                    </div>`;
        }).join('\n                    ');

        // Replace the skills section
        const skillsRegex = /<section class="section skills">[\s\S]*?<\/section>/;
        const skillsMatch = html.match(skillsRegex);
        if (skillsMatch) {
            const newSkillsSection = `<section class="section skills">
                <h2 class="section-title">Technical Skills</h2>
                <div class="skills-grid">
                    ${skillsHTML}
                </div>
            </section>`;
            html = html.replace(skillsRegex, newSkillsSection);
        }

        // Replace education section
        const educationHTML = data.education.map(edu => {
            return `<div class="education-item">
                    <div class="education-header">
                        <h3 class="degree">${edu.degree}</h3>
                        <span class="school">${edu.school}</span>
                        <span class="education-location">${edu.location}</span>
                        <span class="graduation-date">${edu.date}</span>
                    </div>
                    ${edu.details ? `<p class="education-details">${edu.details}</p>` : ''}
                </div>`;
        }).join('\n\n                ');

        const educationRegex = /<section class="section education">[\s\S]*?<\/section>/;
        const educationMatch = html.match(educationRegex);
        if (educationMatch) {
            const newEducationSection = `<section class="section education">
                <h2 class="section-title">Education</h2>
                
                ${educationHTML}
            </section>`;
            html = html.replace(educationRegex, newEducationSection);
        }

        // Replace projects section
        const projectsHTML = data.projects.map(project => {
            return `<div class="project">
                    <div class="project-header">
                        <h3 class="project-title">${project.title}</h3>
                        <span class="project-tech">${project.tech}</span>
                        ${project.link && project.link !== '#' ? `<a href="${project.link}" class="project-link">View Project</a>` : ''}
                    </div>
                    <p class="project-description">${project.description}</p>
                </div>`;
        }).join('\n\n                ');

        const projectsRegex = /<section class="section projects">[\s\S]*?<\/section>/;
        const projectsMatch = html.match(projectsRegex);
        if (projectsMatch) {
            const newProjectsSection = `<section class="section projects">
                <h2 class="section-title">Notable Projects</h2>
                
                ${projectsHTML}
            </section>`;
            html = html.replace(projectsRegex, newProjectsSection);
        }

        // Update the title in head
        html = html.replace(/<title>.*?<\/title>/, `<title>${data.personal.fullName} - Resume</title>`);

        // Update footer
        html = html.replace(/&copy; \d+ .*?\. All rights reserved\./, `&copy; ${new Date().getFullYear()} ${data.personal.fullName}. All rights reserved.`);

        return html;
    }

    getBasicTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="header-content">
                <h1 class="name">Your Name</h1>
                <p class="title">Your Title</p>
                <div class="contact-info">
                    <span class="email">email@example.com</span>
                    <span class="phone">+1 (000) 000-0000</span>
                    <span class="location">City, State</span>
                    <span class="website">website.com</span>
                </div>
            </div>
        </header>
        <main class="main-content">
            <section class="section about">
                <h2 class="section-title">Professional Summary</h2>
                <p class="summary-text">Your professional summary goes here.</p>
            </section>
            <section class="section experience">
                <h2 class="section-title">Work Experience</h2>
            </section>
            <section class="section skills">
                <h2 class="section-title">Technical Skills</h2>
                <div class="skills-grid"></div>
            </section>
            <section class="section education">
                <h2 class="section-title">Education</h2>
            </section>
            <section class="section projects">
                <h2 class="section-title">Notable Projects</h2>
            </section>
        </main>
        <footer class="footer">
            <p>&copy; 2024 Your Name. All rights reserved.</p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>`;
    }

    async previewResume() {
        try {
            const data = this.collectFormData();
            const html = await this.generateResumeHTML(data);
            
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const modal = document.getElementById('preview-modal');
            const frame = document.getElementById('preview-frame');
            frame.src = url;
            modal.style.display = 'block';
            
            // Clean up the URL after some time
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error) {
            console.error('Error previewing resume:', error);
            this.showMessage('Error generating preview', 'error');
        }
    }

    async handleSave() {
        const saveLocation = document.getElementById('save-location').value;
        
        switch (saveLocation) {
            case 'localStorage':
                await this.saveToLocalStorage();
                break;
            case 'download':
                await this.downloadResume();
                break;
            case 'replace-original':
                await this.replaceOriginalResume();
                break;
            case 'custom-name':
                this.showFilenameModal();
                break;
            default:
                await this.saveToLocalStorage();
        }
    }

    async saveToLocalStorage() {
        try {
            const data = this.collectFormData();
            
            // Save form data to localStorage
            localStorage.setItem('resumeEditorData', JSON.stringify(data));
            
            // Generate and save the HTML file
            const html = await this.generateResumeHTML(data);
            localStorage.setItem('generatedResumeHTML', html);
            
            this.showMessage('Resume saved to browser storage successfully!', 'success');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showMessage('Error saving to browser storage', 'error');
        }
    }

    async replaceOriginalResume() {
        try {
            const data = this.collectFormData();
            const html = await this.generateResumeHTML(data);
            
            // Create a blob and download as index.html
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'index.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showMessage('Resume downloaded as index.html - replace your original file with this one!', 'success');
        } catch (error) {
            console.error('Error replacing original resume:', error);
            this.showMessage('Error generating replacement file', 'error');
        }
    }

    showFilenameModal() {
        const data = this.collectFormData();
        const defaultFilename = data.personal.fullName 
            ? data.personal.fullName.replace(/\s+/g, '_') + '_Resume'
            : 'My_Resume';
        
        document.getElementById('custom-filename').value = defaultFilename;
        document.getElementById('filename-modal').style.display = 'block';
        document.getElementById('custom-filename').focus();
    }

    closeFilenameModal() {
        document.getElementById('filename-modal').style.display = 'none';
    }

    async saveWithCustomFilename() {
        try {
            const filename = document.getElementById('custom-filename').value.trim();
            const format = document.querySelector('input[name="file-format"]:checked').value;
            
            if (!filename) {
                this.showMessage('Please enter a filename', 'error');
                return;
            }
            
            const data = this.collectFormData();
            
            if (format === 'html') {
                await this.downloadResumeWithFilename(data, filename + '.html');
            } else if (format === 'pdf') {
                await this.downloadAsPDF(data, filename + '.pdf');
            }
            
            this.closeFilenameModal();
        } catch (error) {
            console.error('Error saving with custom filename:', error);
            this.showMessage('Error saving file: ' + error.message, 'error');
        }
    }

    async downloadResumeWithFilename(data, filename) {
        const html = await this.generateResumeHTML(data);
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showMessage(`Resume saved as ${filename}!`, 'success');
    }

    async downloadAsPDF(data, filename) {
        try {
            this.showMessage('Creating print-ready PDF page...', 'success');
            
            // Create a print-optimized HTML version and open it
            await this.createPrintReadyPage(data, filename);
            
        } catch (error) {
            console.error('PDF creation failed:', error);
            this.showMessage(`PDF creation failed: ${error.message}`, 'error');
            
            // Show alternatives
            this.showPDFAlternatives(data, filename);
        }
    }
    
    async tryPDFGeneration(data, filename) {
        // Use simple text-based PDF generation (more reliable)
        if (typeof window.jsPDF !== 'undefined') {
            await this.generateTextBasedPDF(data, filename);
            return;
        }
        
        throw new Error('jsPDF library not available');
    }
    
    async generatePDFFromHTML(data, filename) {
        let tempContainer = null;
        
        try {
            // Validate libraries
            if (typeof window.jsPDF === 'undefined') {
                throw new Error('jsPDF library not loaded');
            }
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library not loaded');
            }
            
            // Create a temporary container for the resume HTML
            tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: absolute;
                top: -10000px;
                left: -10000px;
                width: 800px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #333;
                padding: 40px;
                box-sizing: border-box;
                z-index: -1000;
            `;
            
            // Generate and insert the resume content
            tempContainer.innerHTML = await this.generatePDFContent(data);
            document.body.appendChild(tempContainer);
            
            // Wait a moment for fonts and styles to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Use html2canvas with more conservative settings
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                removeContainer: false,
                imageTimeout: 15000,
                onclone: (clonedDoc) => {
                    // Ensure the cloned document has proper styles
                    const clonedElement = clonedDoc.querySelector('div');
                    if (clonedElement) {
                        clonedElement.style.transform = 'none';
                        clonedElement.style.position = 'static';
                    }
                }
            });
            
            // Clean up temporary container
            if (tempContainer && tempContainer.parentNode) {
                document.body.removeChild(tempContainer);
                tempContainer = null;
            }
            
            // Validate canvas
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('Failed to generate canvas from HTML');
            }
            
            // Create PDF
            const { jsPDF } = window.jsPDF;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Calculate dimensions to fit A4
            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm
            const imgWidth = pdfWidth - 20; // Leave margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add image to PDF
            const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for smaller size
            
            // If content fits on one page
            if (imgHeight <= pdfHeight - 20) {
                pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
            } else {
                // Handle multi-page content
                let yPosition = 0;
                let pageNumber = 0;
                
                while (yPosition < imgHeight) {
                    if (pageNumber > 0) {
                        pdf.addPage();
                    }
                    
                    const sourceY = yPosition;
                    const sourceHeight = Math.min(pdfHeight - 20, imgHeight - yPosition);
                    
                    // Create a temporary canvas for this page
                    const pageCanvas = document.createElement('canvas');
                    const pageCtx = pageCanvas.getContext('2d');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = (sourceHeight * canvas.width) / imgWidth;
                    
                    pageCtx.drawImage(
                        canvas,
                        0, (sourceY * canvas.width) / imgWidth,
                        canvas.width, pageCanvas.height,
                        0, 0,
                        canvas.width, pageCanvas.height
                    );
                    
                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
                    pdf.addImage(pageImgData, 'JPEG', 10, 10, imgWidth, sourceHeight);
                    
                    yPosition += sourceHeight;
                    pageNumber++;
                    
                    // Safety check to prevent infinite loop
                    if (pageNumber > 10) {
                        console.warn('Too many pages, truncating PDF');
                        break;
                    }
                }
            }
            
            // Save the PDF
            pdf.save(filename);
            this.showMessage(`PDF saved as ${filename} successfully!`, 'success');
            
        } catch (error) {
            // Clean up on error
            if (tempContainer && tempContainer.parentNode) {
                document.body.removeChild(tempContainer);
            }
            
            console.error('Error in generatePDFFromHTML:', error);
            throw new Error(`HTML to PDF conversion failed: ${error.message}`);
        }
    }
    
    async generatePDFContent(data) {
        // Create resume content optimized for PDF
        return `
            <div class="pdf-resume">
                <!-- Header -->
                <div class="pdf-header" style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px;">
                    <h1 style="font-size: 28px; margin: 0 0 8px 0; color: #333;">${data.personal.fullName}</h1>
                    <p style="font-size: 18px; margin: 0 0 15px 0; color: #667eea; font-weight: 600;">${data.personal.jobTitle}</p>
                    <div style="font-size: 14px; color: #666;">
                        <span>${data.personal.email}</span> • 
                        <span>${data.personal.phone}</span> • 
                        <span>${data.personal.location}</span>
                        ${data.personal.website ? ` • <span>${data.personal.website}</span>` : ''}
                    </div>
                </div>
                
                <!-- Summary -->
                ${data.summary ? `
                <div class="pdf-section" style="margin-bottom: 25px;">
                    <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; font-size: 16px;">Professional Summary</h2>
                    <p style="margin: 0; text-align: justify; line-height: 1.6;">${data.summary}</p>
                </div>
                ` : ''}
                
                <!-- Experience -->
                ${data.experience && data.experience.length > 0 ? `
                <div class="pdf-section" style="margin-bottom: 25px;">
                    <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; font-size: 16px;">Work Experience</h2>
                    ${data.experience.map(exp => `
                        <div style="margin-bottom: 20px; page-break-inside: avoid;">
                            <div style="margin-bottom: 8px;">
                                <h3 style="margin: 0; font-size: 15px; color: #333;">${exp.title}</h3>
                                <p style="margin: 2px 0; font-weight: 600; color: #667eea;">${exp.company} • ${exp.location}</p>
                                <p style="margin: 2px 0; font-size: 12px; color: #666; font-style: italic;">${exp.dates}</p>
                            </div>
                            ${exp.responsibilities ? `
                            <ul style="margin: 8px 0; padding-left: 18px;">
                                ${exp.responsibilities.split('\n').filter(r => r.trim()).map(responsibility => 
                                    `<li style="margin-bottom: 4px; line-height: 1.5;">${responsibility.replace(/^•\s*/, '')}</li>`
                                ).join('')}
                            </ul>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <!-- Skills -->
                ${data.skills && data.skills.length > 0 ? `
                <div class="pdf-section" style="margin-bottom: 25px;">
                    <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; font-size: 16px;">Technical Skills</h2>
                    ${data.skills.map(skillCat => `
                        <div style="margin-bottom: 12px;">
                            <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #333;">${skillCat.category}</h4>
                            <p style="margin: 0; color: #666; line-height: 1.4;">${skillCat.skills}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <!-- Education -->
                ${data.education && data.education.length > 0 ? `
                <div class="pdf-section" style="margin-bottom: 25px;">
                    <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; font-size: 16px;">Education</h2>
                    ${data.education.map(edu => `
                        <div style="margin-bottom: 15px; page-break-inside: avoid;">
                            <h3 style="margin: 0; font-size: 14px; color: #333;">${edu.degree}</h3>
                            <p style="margin: 2px 0; font-weight: 600; color: #667eea;">${edu.school} • ${edu.location}</p>
                            <p style="margin: 2px 0; font-size: 12px; color: #666; font-style: italic;">${edu.date}</p>
                            ${edu.details ? `<p style="margin: 8px 0 0 0; color: #666; line-height: 1.5;">${edu.details}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <!-- Projects -->
                ${data.projects && data.projects.length > 0 ? `
                <div class="pdf-section">
                    <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; font-size: 16px;">Notable Projects</h2>
                    ${data.projects.map(project => `
                        <div style="margin-bottom: 15px; page-break-inside: avoid;">
                            <div style="margin-bottom: 6px;">
                                <h3 style="margin: 0; font-size: 14px; color: #333; display: inline;">${project.title}</h3>
                                <span style="color: #667eea; font-size: 12px; margin-left: 10px;">${project.tech}</span>
                            </div>
                            <p style="margin: 6px 0 0 0; color: #666; line-height: 1.5;">${project.description}</p>
                            ${project.link && project.link !== '#' ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #667eea;">${project.link}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }
    
    async generateTextBasedPDF(data, filename) {
        try {
            // Check if jsPDF is available in different formats
            let doc;
            
            if (typeof window.jsPDF !== 'undefined') {
                // UMD format: window.jsPDF.jsPDF
                const { jsPDF } = window.jsPDF;
                doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
            } else if (typeof jsPDF !== 'undefined') {
                // Global format: window.jsPDF
                doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
            } else {
                throw new Error('jsPDF library not loaded');
            }
            
            let currentY = 20;
            const pageHeight = 297;
            const margin = 20;
            const lineHeight = 6;
            const sectionSpacing = 10;
            
            // Helper function to add text with wrapping
            const addText = (text, x, y, options = {}) => {
                const fontSize = options.fontSize || 10;
                const maxWidth = options.maxWidth || 170;
                const isBold = options.bold || false;
                
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                
                if (text.length === 0) return y;
                
                const lines = doc.splitTextToSize(text, maxWidth);
                
                lines.forEach((line, index) => {
                    if (y + (index * lineHeight) > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(line, x, y + (index * lineHeight));
                });
                
                return y + (lines.length * lineHeight);
            };
            
            // Header
            currentY = addText(data.personal.fullName || 'Resume', margin, currentY, { fontSize: 18, bold: true });
            currentY += 3;
            currentY = addText(data.personal.jobTitle || '', margin, currentY, { fontSize: 14, bold: true });
            currentY += 5;
            
            // Contact info
            const contactInfo = [
                data.personal.email,
                data.personal.phone,
                data.personal.location,
                data.personal.website
            ].filter(info => info && info.trim()).join(' • ');
            
            if (contactInfo) {
                currentY = addText(contactInfo, margin, currentY, { fontSize: 10 });
                currentY += sectionSpacing;
            }
            
            // Add a line separator
            doc.setDrawColor(102, 126, 234);
            doc.setLineWidth(0.5);
            doc.line(margin, currentY, 190, currentY);
            currentY += sectionSpacing;
            
            // Professional Summary
            if (data.summary && data.summary.trim()) {
                currentY = addText('PROFESSIONAL SUMMARY', margin, currentY, { fontSize: 12, bold: true });
                currentY += 3;
                currentY = addText(data.summary, margin, currentY);
                currentY += sectionSpacing;
            }
            
            // Work Experience
            if (data.experience && data.experience.length > 0) {
                currentY = addText('WORK EXPERIENCE', margin, currentY, { fontSize: 12, bold: true });
                currentY += 5;
                
                data.experience.forEach(exp => {
                    if (currentY > pageHeight - 40) {
                        doc.addPage();
                        currentY = margin;
                    }
                    
                    currentY = addText(exp.title || '', margin, currentY, { fontSize: 11, bold: true });
                    currentY = addText(`${exp.company || ''} • ${exp.location || ''} • ${exp.dates || ''}`, margin, currentY, { fontSize: 9 });
                    currentY += 2;
                    
                    if (exp.responsibilities) {
                        const responsibilities = exp.responsibilities.split('\n').filter(r => r.trim());
                        responsibilities.forEach(resp => {
                            const cleanResp = resp.replace(/^•\s*/, '• ');
                            currentY = addText(cleanResp, margin + 5, currentY, { fontSize: 9 });
                        });
                    }
                    currentY += sectionSpacing;
                });
            }
            
            // Skills
            if (data.skills && data.skills.length > 0) {
                if (currentY > pageHeight - 30) {
                    doc.addPage();
                    currentY = margin;
                }
                
                currentY = addText('TECHNICAL SKILLS', margin, currentY, { fontSize: 12, bold: true });
                currentY += 5;
                
                data.skills.forEach(skillCat => {
                    currentY = addText(`${skillCat.category}:`, margin, currentY, { fontSize: 10, bold: true });
                    currentY = addText(skillCat.skills, margin + 5, currentY, { fontSize: 9 });
                    currentY += 3;
                });
                currentY += sectionSpacing;
            }
            
            // Education
            if (data.education && data.education.length > 0) {
                if (currentY > pageHeight - 30) {
                    doc.addPage();
                    currentY = margin;
                }
                
                currentY = addText('EDUCATION', margin, currentY, { fontSize: 12, bold: true });
                currentY += 5;
                
                data.education.forEach(edu => {
                    currentY = addText(edu.degree || '', margin, currentY, { fontSize: 11, bold: true });
                    currentY = addText(`${edu.school || ''} • ${edu.location || ''} • ${edu.date || ''}`, margin, currentY, { fontSize: 9 });
                    if (edu.details) {
                        currentY += 1;
                        currentY = addText(edu.details, margin + 5, currentY, { fontSize: 9 });
                    }
                    currentY += 5;
                });
            }
            
            // Projects
            if (data.projects && data.projects.length > 0) {
                if (currentY > pageHeight - 30) {
                    doc.addPage();
                    currentY = margin;
                }
                
                currentY = addText('NOTABLE PROJECTS', margin, currentY, { fontSize: 12, bold: true });
                currentY += 5;
                
                data.projects.forEach(project => {
                    currentY = addText(`${project.title} (${project.tech})`, margin, currentY, { fontSize: 11, bold: true });
                    currentY = addText(project.description, margin + 5, currentY, { fontSize: 9 });
                    if (project.link && project.link !== '#') {
                        currentY = addText(project.link, margin + 5, currentY, { fontSize: 8 });
                    }
                    currentY += 5;
                });
            }
            
            // Save the PDF
            doc.save(filename);
            this.showMessage(`PDF saved as ${filename} successfully!`, 'success');
            
        } catch (error) {
            console.error('Error in generateTextBasedPDF:', error);
            throw error;
        }
    }
    
    async createPrintReadyPage(data, filename) {
        try {
            // Generate a print-optimized HTML page
            const printHTML = await this.generatePrintReadyHTML(data, filename);
            
            // Create blob and URL
            const blob = new Blob([printHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Try to open in new window
            const printWindow = window.open(url, '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
            
            if (printWindow) {
                // Add instructions and auto-trigger print
                printWindow.onload = () => {
                    setTimeout(() => {
                        this.showMessage('Print window opened! Press Cmd+P (Mac) or Ctrl+P (Windows) and choose "Save as PDF"', 'success');
                        
                        // Optional: Auto-trigger print dialog
                        try {
                            printWindow.focus();
                            printWindow.print();
                        } catch (e) {
                            console.log('Could not auto-trigger print dialog');
                        }
                    }, 1000);
                };
            } else {
                // If popup blocked, download the HTML file
                const a = document.createElement('a');
                a.href = url;
                a.download = filename.replace('.pdf', '_print_ready.html');
                a.click();
                
                this.showMessage('Pop-up blocked. Downloaded print-ready HTML file. Open it and print as PDF.', 'success');
            }
            
            // Clean up URL after some time
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            
        } catch (error) {
            console.error('Error creating print-ready page:', error);
            throw error;
        }
    }
    
    async generatePrintReadyHTML(data, filename) {
        // Create a complete HTML document optimized for printing to PDF
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personal.fullName} - Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            font-size: 14px;
        }
        
        .print-container {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.75in;
            background: white;
            min-height: 11in;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 20px;
        }
        
        .name {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }
        
        .title {
            font-size: 18px;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .contact-info {
            font-size: 14px;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .job, .education-item, .project {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .job-title, .degree, .project-title {
            font-size: 15px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
        }
        
        .job-company, .school {
            font-weight: 600;
            color: #667eea;
            margin-bottom: 2px;
        }
        
        .job-dates, .graduation-date {
            font-size: 12px;
            color: #666;
            font-style: italic;
            margin-bottom: 8px;
        }
        
        .job-responsibilities {
            list-style: none;
            padding-left: 0;
        }
        
        .job-responsibilities li {
            margin-bottom: 4px;
            padding-left: 18px;
            position: relative;
            line-height: 1.5;
        }
        
        .job-responsibilities li:before {
            content: '•';
            color: #667eea;
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
        }
        
        .skill-category {
            margin-bottom: 12px;
        }
        
        .skill-category-title {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 6px;
        }
        
        .skills-list {
            color: #666;
            line-height: 1.4;
        }
        
        .project-tech {
            color: #667eea;
            font-size: 12px;
            margin-left: 10px;
        }
        
        .project-description {
            margin-top: 6px;
            color: #666;
            line-height: 1.5;
        }
        
        .project-link {
            color: #667eea;
            font-size: 11px;
            margin-top: 4px;
            display: block;
        }
        
        .education-details {
            color: #666;
            line-height: 1.5;
            margin-top: 8px;
        }
        
        /* Print-specific styles */
        @media print {
            body {
                font-size: 12pt;
            }
            
            .print-container {
                max-width: none;
                padding: 0.5in;
                margin: 0;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .job, .education-item, .project {
                page-break-inside: avoid;
            }
        }
        
        @page {
            margin: 0.5in;
            size: letter;
        }
        
        /* Print instructions */
        .print-instructions {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        }
        
        .print-instructions h3 {
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .print-instructions button {
            background: white;
            color: #007bff;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px 5px 0 0;
            font-size: 12px;
        }
        
        @media print {
            .print-instructions {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="print-instructions">
        <h3>📄 Create PDF</h3>
        <p><strong>Steps:</strong></p>
        <ol style="margin: 10px 0; padding-left: 20px; font-size: 12px;">
            <li>Press <kbd>Cmd+P</kbd> (Mac) or <kbd>Ctrl+P</kbd> (Windows)</li>
            <li>Choose "Save as PDF"</li>
            <li>Set margins to "Minimum"</li>
            <li>Save as: <strong>${filename}</strong></li>
        </ol>
        <button onclick="window.print()">🖨️ Print Now</button>
        <button onclick="window.close()">✕ Close</button>
    </div>
    
    <div class="print-container">
        <header class="header">
            <div class="name">${data.personal.fullName || 'Your Name'}</div>
            <div class="title">${data.personal.jobTitle || 'Your Title'}</div>
            <div class="contact-info">
                ${[data.personal.email, data.personal.phone, data.personal.location, data.personal.website]
                    .filter(item => item && item.trim())
                    .join(' • ')}
            </div>
        </header>
        
        <main>
            ${data.summary ? `
            <section class="section">
                <h2 class="section-title">Professional Summary</h2>
                <p>${data.summary}</p>
            </section>
            ` : ''}
            
            ${data.experience && data.experience.length > 0 ? `
            <section class="section">
                <h2 class="section-title">Work Experience</h2>
                ${data.experience.map(exp => `
                    <div class="job">
                        <div class="job-title">${exp.title || ''}</div>
                        <div class="job-company">${exp.company || ''} • ${exp.location || ''}</div>
                        <div class="job-dates">${exp.dates || ''}</div>
                        ${exp.responsibilities ? `
                        <ul class="job-responsibilities">
                            ${exp.responsibilities.split('\n')
                                .filter(r => r.trim())
                                .map(r => `<li>${r.replace(/^•\s*/, '')}</li>`)
                                .join('')}
                        </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.skills && data.skills.length > 0 ? `
            <section class="section">
                <h2 class="section-title">Technical Skills</h2>
                <div class="skills-grid">
                    ${data.skills.map(skillCat => `
                        <div class="skill-category">
                            <div class="skill-category-title">${skillCat.category}:</div>
                            <div class="skills-list">${skillCat.skills}</div>
                        </div>
                    `).join('')}
                </div>
            </section>
            ` : ''}
            
            ${data.education && data.education.length > 0 ? `
            <section class="section">
                <h2 class="section-title">Education</h2>
                ${data.education.map(edu => `
                    <div class="education-item">
                        <div class="degree">${edu.degree || ''}</div>
                        <div class="school">${edu.school || ''} • ${edu.location || ''}</div>
                        <div class="graduation-date">${edu.date || ''}</div>
                        ${edu.details ? `<div class="education-details">${edu.details}</div>` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.projects && data.projects.length > 0 ? `
            <section class="section">
                <h2 class="section-title">Notable Projects</h2>
                ${data.projects.map(project => `
                    <div class="project">
                        <div class="project-title">${project.title || ''}
                            ${project.tech ? `<span class="project-tech">(${project.tech})</span>` : ''}
                        </div>
                        <div class="project-description">${project.description || ''}</div>
                        ${project.link && project.link !== '#' ? `<div class="project-link">${project.link}</div>` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
        </main>
    </div>
</body>
</html>`;
    }
    
    async showPDFAlternatives(data, filename) {
        const alternativeMessage = `
            PDF creation failed. Here are alternative options:
            
            1. Use "Quick Download" to get HTML file, then:
               • Open in browser
               • Press Cmd+P (Mac) or Ctrl+P (Windows) 
               • Choose "Save as PDF"
            
            2. Use online HTML to PDF converters
            
            3. Copy content and paste into a document editor
        `;
        
        if (confirm(alternativeMessage + '\n\nWould you like to download as HTML instead?')) {
            // Fallback to HTML download
            await this.downloadResumeWithFilename(data, filename.replace('.pdf', '.html'));
        }
    }
    

    updateSaveHelp(saveOption) {
        const helpElement = document.getElementById('save-help');
        if (!helpElement) return;

        const helpTexts = {
            'localStorage': '💾 Saves to browser storage - data will persist until you clear browser data',
            'download': '⬇️ Downloads resume with default filename to your Downloads folder',
            'replace-original': '🔄 Downloads as "index.html" to replace your current resume file',
            'custom-name': '📝 Choose your own filename and format (HTML or PDF)'
        };

        const helpText = helpTexts[saveOption] || helpTexts['localStorage'];
        helpElement.innerHTML = `<small>${helpText}</small>`;
    }

    async downloadResume() {
        try {
            const data = this.collectFormData();
            const html = await this.generateResumeHTML(data);
            
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.personal.fullName.replace(/\s+/g, '_')}_Resume.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showMessage('Resume downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading resume:', error);
            this.showMessage('Error downloading resume', 'error');
        }
    }

    autoSave() {
        // Debounced auto-save
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const data = this.collectFormData();
            localStorage.setItem('resumeEditorData', JSON.stringify(data));
        }, 2000);
    }

    closeModal() {
        document.getElementById('preview-modal').style.display = 'none';
    }

    showMessage(message, type) {
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        const header = document.querySelector('.editor-header');
        header.parentNode.insertBefore(messageDiv, header.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ResumeEditor();
});