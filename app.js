// Modern Portfolio JavaScript with Interactive Features

class Portfolio {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupThemeToggle();
        this.setupMobileMenu();
        this.setupTypingEffect();
        this.setupScrollAnimations();
        this.setupSmoothScrolling();
        this.setupFormHandling();
        this.setupNavbarScroll();
    }

    setupEventListeners() {
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.addFadeInAnimations();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        
        // Check for saved theme preference or default to light mode
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-color-scheme', currentTheme);
        
        // Set initial icon
        themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-color-scheme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-color-scheme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            
            // Add transition class for smooth theme change
            document.body.classList.add('theme-transition');
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, 300);
        });
    }

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    setupTypingEffect() {
        const typingElement = document.getElementById('typing-text');
        const texts = [
            'AI & Full Stack Developer',
            'Machine Learning Engineer',
            'Frontend Developer',
            'Backend Developer',
            'Problem Solver'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeText = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 100 : 150;
            
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500; // Pause before next text
            }
            
            setTimeout(typeText, typeSpeed);
        };
        
        // Start typing effect
        setTimeout(typeText, 1000);
    }

    setupScrollAnimations() {
        // Create intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    
                    // Animate skill items with stagger effect
                    if (entry.target.classList.contains('skill-category')) {
                        this.animateSkillItems(entry.target);
                    }
                    
                    // Animate project cards
                    if (entry.target.classList.contains('project-card')) {
                        this.animateProjectCard(entry.target);
                    }
                    
                    // Animate timeline items
                    if (entry.target.classList.contains('timeline-item')) {
                        this.animateTimelineItem(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.skill-category, .project-card, .timeline-item, .contact-item').forEach(el => {
            observer.observe(el);
        });
    }

    animateSkillItems(skillCategory) {
        const skillItems = skillCategory.querySelectorAll('.skill-item');
        skillItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            }, index * 100);
        });
    }

    animateProjectCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    }

    animateTimelineItem(item) {
        const content = item.querySelector('.timeline-content');
        content.style.opacity = '0';
        content.style.transform = 'translateX(30px)';
        content.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            content.style.opacity = '1';
            content.style.transform = 'translateX(0)';
        }, 200);
    }

    setupSmoothScrolling() {
        // Add smooth scrolling to navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Add smooth scrolling to hero buttons
        document.querySelectorAll('.hero-buttons .btn').forEach(btn => {
            if (btn.getAttribute('href').startsWith('#')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = btn.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        const offsetTop = targetSection.offsetTop - 70;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        });
    }

    setupFormHandling() {
        const contactForm = document.getElementById('contact-form');
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (this.validateForm(data)) {
                this.submitForm(data);
            }
        });

        // Add real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateForm(data) {
        let isValid = true;
        const errors = [];

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push('Please enter a valid email address');
            isValid = false;
        }

        // Subject validation
        if (!data.subject || data.subject.trim().length < 5) {
            errors.push('Subject must be at least 5 characters long');
            isValid = false;
        }

        // Message validation
        if (!data.message || data.message.trim().length < 10) {
            errors.push('Message must be at least 10 characters long');
            isValid = false;
        }

        if (!isValid) {
            this.showNotification('Please fix the following errors:\n' + errors.join('\n'), 'error');
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        field.classList.remove('error', 'valid');
        
        let isValid = true;
        
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                break;
            case 'text':
                isValid = value.length >= 2;
                break;
            case 'textarea':
                isValid = value.length >= 10;
                break;
        }
        
        field.classList.add(isValid ? 'valid' : 'error');
        return isValid;
    }

    submitForm(data) {
        // Show loading state
        const submitBtn = document.querySelector('#contact-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            document.getElementById('contact-form').reset();
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            this.sendEmail(data);
        }, 2000);
    }
    sendEmail(data) {
    if (typeof emailjs === "undefined" || !emailjs.send) {
        this.showNotification("Email service not available. Please try again later.", "error");
        return;
    }

    const serviceID = "service_g06qotm";
    const templateID = "template_qovombc";
    // const userID = "2XHhlJ0ailyeT-FYS";

    emailjs.send(serviceID, templateID, {
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message
    })
    .then((response) => {
        this.showNotification("Thank you for your message! I'll get back to you soon.", "success");
    })
    .catch((err) => {
        let msg = "Failed to send message.";
        if (err && err.text) {
            msg += " " + err.text;
        }
        this.showNotification(msg, "error");
    });
}


    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    setupNavbarScroll() {
        let lastScrollTop = 0;
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove scrolled class for styling
            if (scrollTop > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    addFadeInAnimations() {
        // Add fade-in animations to elements as they come into view
        const elements = document.querySelectorAll('.hero-content, .section-header, .about-content, .education-card');
        
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s ease';
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    handleResize() {
        const mobileMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        
        if (window.innerWidth > 768) {
            mobileMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    createParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(33, 128, 141, 0.3);
                border-radius: 50%;
                animation: float ${Math.random() * 3 + 2}s infinite ease-in-out;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 2}s;
            `;
            particlesContainer.appendChild(particle);
        }
    }

    addInteractiveEffects() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new Portfolio();
    
    portfolio.createParticles();
    portfolio.addInteractiveEffects();
});

const validationStyles = `
    .form-control.valid {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .form-control.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(15px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
    
    .theme-transition * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding: 2rem 0;
            transition: left 0.3s ease;
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = validationStyles;
document.head.appendChild(styleSheet);

// Image Gallery Functionality
class ImageGallery {
    constructor() {
        this.galleryScroll = document.getElementById('gallery-scroll');
        this.imageUpload = document.getElementById('image-upload');
        this.clearGallery = document.getElementById('clear-gallery');
        this.prevBtn = document.getElementById('gallery-prev');
        this.nextBtn = document.getElementById('gallery-next');
        this.galleryContainer = document.querySelector('.gallery-container');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.loadSavedImages();
        this.updateNavigationButtons();
    }

    setupEventListeners() {
        // Image upload
        this.imageUpload.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files);
        });

        // Clear gallery
        this.clearGallery.addEventListener('click', () => {
            this.clearAllImages();
        });

        // Navigation buttons
        this.prevBtn.addEventListener('click', () => {
            this.scrollGallery('prev');
        });

        this.nextBtn.addEventListener('click', () => {
            this.scrollGallery('next');
        });

        // Scroll event for navigation buttons
        this.galleryScroll.addEventListener('scroll', () => {
            this.updateNavigationButtons();
        });

        // Click to view full size
        this.galleryScroll.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const img = galleryItem.querySelector('img');
                this.openModal(img.src, img.alt);
            }
        });
    }

    setupDragAndDrop() {
        // Create drop zone
        const dropZone = document.createElement('div');
        dropZone.className = 'gallery-drop-zone';
        dropZone.innerHTML = '<div class="gallery-drop-text">📷 Drop images here to add them to the gallery</div>';
        this.galleryContainer.appendChild(dropZone);

        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.galleryContainer.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.galleryContainer.addEventListener(eventName, () => {
                this.galleryContainer.classList.add('drag-over');
                dropZone.classList.add('active');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.galleryContainer.addEventListener(eventName, () => {
                this.galleryContainer.classList.remove('drag-over');
                dropZone.classList.remove('active');
            }, false);
        });

        this.galleryContainer.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleImageUpload(files);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleImageUpload(files) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showNotification('Please select valid image files.', 'error');
            return;
        }

        imageFiles.forEach(file => {
            this.addImageToGallery(file);
        });

        // Clear the input
        this.imageUpload.value = '';
    }

    addImageToGallery(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageData = {
                src: e.target.result,
                name: file.name,
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                timestamp: Date.now()
            };

            this.createGalleryItem(imageData);
            this.saveImageToStorage(imageData);
            this.updateNavigationButtons();
        };

        reader.readAsDataURL(file);
    }

    createGalleryItem(imageData) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item fade-in';
        galleryItem.innerHTML = `
            <img src="${imageData.src}" alt="${imageData.title}" loading="lazy">
            <div class="gallery-overlay">
                <span class="gallery-title">${imageData.title}</span>
                <button class="gallery-delete-btn" onclick="imageGallery.removeImage(${imageData.timestamp})">
                    🗑️ Remove
                </button>
            </div>
        `;

        this.galleryScroll.appendChild(galleryItem);

        // Scroll to the new image
        setTimeout(() => {
            galleryItem.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }, 100);
    }

    removeImage(timestamp) {
        const galleryItems = this.galleryScroll.querySelectorAll('.gallery-item');
        let itemToRemove = null;

        // Find the item by timestamp (stored in the overlay)
        galleryItems.forEach(item => {
            const deleteBtn = item.querySelector('.gallery-delete-btn');
            if (deleteBtn && deleteBtn.onclick.toString().includes(timestamp)) {
                itemToRemove = item;
            }
        });

        if (itemToRemove) {
            itemToRemove.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                itemToRemove.remove();
                this.removeImageFromStorage(timestamp);
                this.updateNavigationButtons();
            }, 300);
        }
    }

    clearAllImages() {
        if (confirm('Are you sure you want to clear all images from the gallery?')) {
            // Keep only the default placeholder images (first 5)
            const galleryItems = this.galleryScroll.querySelectorAll('.gallery-item');
            const itemsToRemove = Array.from(galleryItems).slice(5); // Remove all except first 5

            itemsToRemove.forEach(item => {
                item.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    item.remove();
                }, 300);
            });

            // Clear from storage
            localStorage.removeItem('galleryImages');
            this.updateNavigationButtons();
            this.showNotification('Gallery cleared successfully!', 'success');
        }
    }

    scrollGallery(direction) {
        const scrollAmount = 320; // Width of one item + gap
        const currentScroll = this.galleryScroll.scrollLeft;
        
        if (direction === 'prev') {
            this.galleryScroll.scrollTo({
                left: currentScroll - scrollAmount,
                behavior: 'smooth'
            });
        } else {
            this.galleryScroll.scrollTo({
                left: currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    updateNavigationButtons() {
        const maxScroll = this.galleryScroll.scrollWidth - this.galleryScroll.clientWidth;
        const currentScroll = this.galleryScroll.scrollLeft;

        this.prevBtn.disabled = currentScroll <= 0;
        this.nextBtn.disabled = currentScroll >= maxScroll - 1;
    }

    openModal(src, alt) {
        // Create modal if it doesn't exist
        let modal = document.querySelector('.gallery-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'gallery-modal';
            modal.innerHTML = `
                <div class="gallery-modal-content">
                    <button class="gallery-modal-close">&times;</button>
                    <img src="" alt="">
                </div>
            `;
            document.body.appendChild(modal);

            // Close modal events
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });

            modal.querySelector('.gallery-modal-close').addEventListener('click', () => {
                this.closeModal();
            });

            // Keyboard events
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }

        // Set image and show modal
        const modalImg = modal.querySelector('img');
        modalImg.src = src;
        modalImg.alt = alt;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.querySelector('.gallery-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    saveImageToStorage(imageData) {
        let savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        savedImages.push(imageData);
        localStorage.setItem('galleryImages', JSON.stringify(savedImages));
    }

    removeImageFromStorage(timestamp) {
        let savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        savedImages = savedImages.filter(img => img.timestamp !== timestamp);
        localStorage.setItem('galleryImages', JSON.stringify(savedImages));
    }

    loadSavedImages() {
        const savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        savedImages.forEach(imageData => {
            this.createGalleryItem(imageData);
        });
    }

    showNotification(message, type = 'info') {
        // Use the existing notification system from the main Portfolio class
        if (window.portfolio && window.portfolio.showNotification) {
            window.portfolio.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

const galleryStyles = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }
    
    .gallery-delete-btn {
        background: rgba(220, 36, 36, 0.9);
        color: white;
        border: none;
        padding: 0.3rem 0.6rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        cursor: pointer;
        margin-top: 0.5rem;
        transition: all 0.3s ease;
    }
    
    .gallery-delete-btn:hover {
        background: rgba(239, 68, 68, 1);
        transform: scale(1.05);
    }
`;

const galleryStyleSheet = document.createElement('style');
galleryStyleSheet.textContent = galleryStyles;
document.head.appendChild(galleryStyleSheet);

document.addEventListener('DOMContentLoaded', () => {
    window.imageGallery = new ImageGallery();
});

document.addEventListener('DOMContentLoaded', () => {
    if (window.portfolio) {
        window.portfolio = new Portfolio();
    }
});

