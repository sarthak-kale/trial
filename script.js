// ========================================
// FOCUSFLOW - LANDING PAGE SCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initModals();
    initAnimations();
    initFaq();
    initStatsCounter();
});

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.8)';
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    if (mobileMenu) {
                        mobileMenu.classList.remove('active');
                    }
                }
            }
        });
    });
}

// ========================================
// MODALS
// ========================================
function initModals() {
    const modal = document.getElementById('accessModal');
    const getStartedBtns = document.querySelectorAll('#getStartedBtn, #getStartedBtnMobile, #heroGetStarted, #pricingGetStarted, #ctaGetStarted');
    
    // Open modal on all "Get Started" buttons
    getStartedBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
            });
        }
    });
    
    // Close modal on overlay click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
}

function openModal() {
    const modal = document.getElementById('accessModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('accessModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function submitAccess() {
    const accessCode = document.getElementById('accessCode')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';
    const name = document.getElementById('name')?.value?.trim() || '';
    
    // Validation
    if (!email || !password || !name) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Determine plan based on access code
    let plan = 'free';
    if (accessCode === 'ff9') {
        plan = 'pro';
    } else if (accessCode === 'student21') {
        plan = 'student';
    }
    
    // Save user data to localStorage
    const userData = {
        email: email,
        name: name,
        plan: plan,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('focusflow_user', JSON.stringify(userData));
    localStorage.setItem('focusflow_logged_in', 'true');
    
    // Initialize default data
    initDefaultData();
    
    // Close modal and redirect
    closeModal();
    
    // Show success message and redirect
    setTimeout(() => {
        alert('Account created successfully! Welcome to FocusFlow!');
        window.location.href = 'home.html';
    }, 300);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function initDefaultData() {
    // Initialize tasks array
    if (!localStorage.getItem('focusflow_tasks')) {
        localStorage.setItem('focusflow_tasks', JSON.stringify([]));
    }
    
    // Initialize pomodoro sessions
    if (!localStorage.getItem('focusflow_pomodoro')) {
        localStorage.setItem('focusflow_pomodoro', JSON.stringify({
            totalSessions: 0,
            totalMinutes: 0,
            todaySessions: 0,
            todayMinutes: 0
        }));
    }
    
    // Initialize streak
    if (!localStorage.getItem('focusflow_streak')) {
        localStorage.setItem('focusflow_streak', JSON.stringify({
            current: 0,
            longest: 0,
            lastActiveDate: null
        }));
    }
    
    // Initialize goals
    if (!localStorage.getItem('focusflow_goals')) {
        localStorage.setItem('focusflow_goals', JSON.stringify({
            daily: [],
            weekly: []
        }));
    }
    
    // Initialize habits
    if (!localStorage.getItem('focusflow_habits')) {
        localStorage.setItem('focusflow_habits', JSON.stringify([]));
    }
    
    // Initialize notes
    if (!localStorage.getItem('focusflow_notes')) {
        localStorage.setItem('focusflow_notes', JSON.stringify([]));
    }
    
    // Initialize achievements
    if (!localStorage.getItem('focusflow_achievements')) {
        localStorage.setItem('focusflow_achievements', JSON.stringify({
            badges: [],
            firstTask: false,
            sevenDayStreak: false,
            tenPomodoros: false,
            hundredTasks: false
        }));
    }
    
    // Initialize settings
    if (!localStorage.getItem('focusflow_settings')) {
        localStorage.setItem('focusflow_settings', JSON.stringify({
            theme: 'dark',
            accentColor: '#6366f1',
            pomodoroWork: 25,
            pomodoroBreak: 5,
            pomodoroLongBreak: 15,
            autoStartBreak: false,
            soundEnabled: true
        }));
    }
}

// ========================================
// ANIMATIONS
// ========================================
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.feature-card, .step, .testimonial-card, .pricing-card, .faq-item').forEach(el => {
        observer.observe(el);
    });
    
    // Hero animation on load
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('animate-fade-up');
    }
}

// ========================================
// FAQ
// ========================================
function initFaq() {
    // FAQ toggle is handled inline with onclick
}

function toggleFaq(button) {
    const item = button.parentElement;
    const answer = item.querySelector('.faq-answer');
    const icon = button.querySelector('i');
    
    // Toggle current item
    answer.classList.toggle('open');
    button.classList.toggle('active');
    
    if (answer.classList.contains('open')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
        answer.style.maxHeight = '0';
    }
}

// ========================================
// STATS COUNTER
// ========================================
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-count'));
                animateCounter(element, target);
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ========================================
// THEME TOGGLE (if needed on landing page)
// ========================================
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.classList.remove('dark-theme', 'light-theme');
    body.classList.add(newTheme + '-theme');
    
    localStorage.setItem('focusflow_theme', newTheme);
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('focusflow_theme');
if (savedTheme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(savedTheme + '-theme');
}
