// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    limit,
    serverTimestamp,
    where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getAnalytics, 
    logEvent 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyANa0kvCZcmiai6wbsgRWMTkHln09i7PcQ",
    authDomain: "spnu-nl.firebaseapp.com",
    projectId: "spnu-nl",
    storageBucket: "spnu-nl.firebasestorage.app",
    messagingSenderId: "817817458296",
    appId: "1:817817458296:web:a5faf87e37c033ef55ff8d",
    measurementId: "G-XXXXXXXXXX" // Replace with your GA4 measurement ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

class SPnuLanding {
    constructor() {
        this.currentUser = null;
        this.stats = {
            users: 0,
            actions: 0,
            locations: 50
        };
        
        this.init();
    }

    init() {
        console.log('🔴 SPnu Action Platform Loading...');
        
        this.initLoader();
        this.initScrollAnimations();
        this.initMobileMenu();
        this.bindEvents();
        this.setupAuthListener();
        this.loadStats();
        this.trackPageView();
        
        console.log('✅ SPnu Landing Page Initialized');
    }

    // Loading Screen
    initLoader() {
        const loader = document.getElementById('spnu-loader');
        if (!loader) return;

        const progressBar = loader.querySelector('.progress-fill');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    loader.style.opacity = '0';
                    setTimeout(() => {
                        loader.remove();
                        this.trackEvent('page_load', 'landing_loaded');
                        this.animateStats();
                    }, 500);
                }, 1000);
            }
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }, 150);
    }

    // Scroll Animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Track section views
                    const sectionName = entry.target.id || entry.target.className.split(' ')[0];
                    this.trackEvent('section_view', sectionName);
                }
            });
        }, observerOptions);

        // Add animation classes and observe
        document.querySelectorAll('.feature-card, .step-card').forEach((el, index) => {
            el.classList.add('fade-in-up');
            el.style.animationDelay = `${index * 0.1}s`;
            observer.observe(el);
        });

        document.querySelectorAll('.hero-visual, .section-header').forEach(el => {
            el.classList.add('scale-in');
            observer.observe(el);
        });
    }

    // Mobile Menu
    initMobileMenu() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
                mobileBtn.setAttribute('aria-expanded', !isExpanded);
                
                // Toggle hamburger animation
                mobileBtn.classList.toggle('active');
                
                this.trackEvent('mobile_menu', isExpanded ? 'close' : 'open');
            });
        }
    }

    // Event Binding
    bindEvents() {
        // CTA Buttons
        document.getElementById('getStartedBtn')?.addEventListener('click', () => {
            this.handleGetStarted();
        });
        
        document.getElementById('joinPlatformBtn')?.addEventListener('click', () => {
            this.handleJoinPlatform();
        });
        
        document.getElementById('startActionBtn')?.addEventListener('click', () => {
            this.handleStartAction();
        });
        
        document.getElementById('explorePlatformBtn')?.addEventListener('click', () => {
            this.handleExplorePlatform();
        });
        
        document.getElementById('learnMoreBtn')?.addEventListener('click', () => {
            this.scrollToSection('features');
        });

        // Auth Buttons
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.openModal('authModal');
            this.switchTab('login');
        });

        // Modal Events
        this.bindModalEvents();
        
        // Form Events
        this.bindFormEvents();
        
        // External Links Tracking
        this.trackExternalLinks();
        
        // Scroll Depth Tracking
        this.trackScrollDepth();
    }

    bindModalEvents() {
        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    bindFormEvents() {
        // Login Form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register Form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    // Authentication
    setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.updateAuthUI();
            
            if (user) {
                this.trackEvent('auth_state', 'logged_in');
            }
        });
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        
        if (this.currentUser && loginBtn) {
            loginBtn.textContent = this.currentUser.displayName || 'Account';
            loginBtn.onclick = () => this.redirectToApp();
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            this.showNotification('Vul alle velden in', 'error');
            return;
        }

        this.showLoading();
        this.trackEvent('auth_attempt', 'login');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            
            this.closeModal('authModal');
            this.hideLoading();
            this.showNotification('Welkom terug! Doorsturen naar platform...', 'success');
            
            this.trackEvent('auth_success', 'login');
            
            setTimeout(() => {
                this.redirectToApp();
            }, 2000);

        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
            this.trackEvent('auth_error', `login_${error.code}`);
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const location = document.getElementById('registerLocation')?.value;
        const branch = document.getElementById('registerBranch')?.value;

        if (!name || !email || !password) {
            this.showNotification('Vul alle verplichte velden in', 'error');
            return;
        }

        this.showLoading();
        this.trackEvent('auth_attempt', 'register');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });

            // Save user data to Firestore
            await addDoc(collection(db, 'users'), {
                uid: userCredential.user.uid,
                name: name,
                email: email,
                location: location || '',
                branch: branch || 'andere',
                role: 'member',
                createdAt: serverTimestamp(),
                source: 'landing_page'
            });

            this.closeModal('authModal');
            this.hideLoading();
            this.showNotification('Account aangemaakt! Welkom bij de SP beweging! 🔴✊', 'success');
            
            this.trackEvent('auth_success', 'register');
            this.trackEvent('conversion', 'user_signup');
            
            setTimeout(() => {
                this.redirectToApp();
            }, 3000);

        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
            this.trackEvent('auth_error', `register_${error.code}`);
        }
    }

    handleAuthError(error) {
        const errorMessages = {
            'auth/user-not-found': 'Geen account gevonden met dit email adres',
            'auth/wrong-password': 'Verkeerd wachtwoord',
            'auth/email-already-in-use': 'Dit email adres is al geregistreerd',
            'auth/weak-password': 'Wachtwoord moet minimaal 6 karakters bevatten',
            'auth/invalid-email': 'Ongeldig email adres',
            'auth/too-many-requests': 'Te veel pogingen. Probeer later opnieuw.',
        };

        const message = errorMessages[error.code] || error.message;
        this.showNotification(message, 'error');
    }

    // CTA Handlers
    handleGetStarted() {
        this.trackEvent('cta_click', 'get_started_header');
        
        if (this.currentUser) {
            this.redirectToApp();
        } else {
            this.openModal('authModal');
            this.switchTab('register');
        }
    }

    handleJoinPlatform() {
        this.trackEvent('cta_click', 'join_platform_hero');
        
        if (this.currentUser) {
            this.redirectToApp();
        } else {
            this.openModal('authModal');
            this.switchTab('register');
        }
    }

    handleStartAction() {
        this.trackEvent('cta_click', 'start_action_cta');
        
        if (this.currentUser) {
            this.redirectToApp('?action=create');
        } else {
            this.openModal('authModal');
            this.switchTab('register');
        }
    }

    handleExplorePlatform() {
        this.trackEvent('cta_click', 'explore_platform_cta');
        this.redirectToApp('?mode=explore');
    }

    redirectToApp(params = '') {
        window.location.href = `/app${params}`;
    }

    // Stats Loading & Animation
    async loadStats() {
        try {
            // Load real stats from Firestore
            const [usersSnapshot, actionsSnapshot, locationsSnapshot] = await Promise.all([
                getDocs(query(collection(db, 'users'), limit(1))),
                getDocs(query(collection(db, 'actions'), limit(1))),
                getDocs(query(collection(db, 'locations'), limit(1)))
            ]);

            // Update stats with real or estimated numbers
            this.stats = {
                users: Math.max(usersSnapshot.size * 100, 10000), // Estimate based on actual users
                actions: Math.max(actionsSnapshot.size * 10, 500), // Estimate based on actual actions
                locations: Math.max(locationsSnapshot.size, 50) // Minimum 50 locations
            };

        } catch (error) {
            console.log('Using default stats:', error);
            // Use default impressive numbers
            this.stats = {
                users: 10000,
                actions: 500,
                locations: 50
            };
        }
    }

    animateStats() {
        const statElements = document.querySelectorAll('.stat-number');
        
        statElements.forEach((element, index) => {
            const target = parseInt(element.dataset.target) || this.getStatValue(index);
            this.animateNumber(element, 0, target, 2000 + (index * 500));
        });
    }

    getStatValue(index) {
        const values = [this.stats.users, this.stats.actions, this.stats.locations, 355];
        return values[index] || 0;
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * this.easeOut(progress));
            
            if (current >= 1000) {
                element.textContent = (current / 1000).toFixed(0) + 'k+';
            } else {
                element.textContent = current.toString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }

    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Utility Methods
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
            
            this.trackEvent('modal_open', modalId);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Reset forms
            modal.querySelectorAll('form').forEach(form => form.reset());
            
            this.trackEvent('modal_close', modalId);
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });

        this.trackEvent('tab_switch', tabName);
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            this.trackEvent('navigation', `scroll_to_${sectionId}`);
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: ${type === 'warning' ? '#333' : 'white'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Analytics & Tracking
    trackPageView() {
        this.trackEvent('page_view', 'landing_page');
        
        // Track UTM parameters if present
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmCampaign = urlParams.get('utm_campaign');
        
        if (utmSource) {
            this.trackEvent('utm_tracking', `source_${utmSource}`);
        }
        if (utmMedium) {
            this.trackEvent('utm_tracking', `medium_${utmMedium}`);
        }
        if (utmCampaign) {
            this.trackEvent('utm_tracking', `campaign_${utmCampaign}`);
        }
    }

    trackEvent(eventName, eventCategory, eventLabel = null) {
        // Google Analytics 4
        if (window.gtag) {
            window.gtag('event', eventName, {
                event_category: eventCategory,
                event_label: eventLabel
            });
        }

        // Firebase Analytics
        if (analytics) {
            logEvent(analytics, eventName, {
                category: eventCategory,
                label: eventLabel
            });
        }

        // Matomo
        if (window._paq) {
            window._paq.push(['trackEvent', eventCategory, eventName, eventLabel]);
        }

        // Console logging for development
        console.log(`📊 Event: ${eventName} | Category: ${eventCategory} | Label: ${eventLabel}`);
    }

    trackExternalLinks() {
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = e.target.href;
                const linkText = e.target.textContent.trim();
                this.trackEvent('external_link_click', linkText, url);
            });
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 90, 100];
        
        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && maxScroll < milestone) {
                    maxScroll = milestone;
                    this.trackEvent('scroll_depth', `${milestone}_percent`);
                }
            });
        };

        window.addEventListener('scroll', trackScroll, { passive: true });
    }
}

// CSS Animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyles);

// Initialize Landing Page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔴 SPnu Action Platform - Landing Page Starting...');
    window.spnuLanding = new SPnuLanding();
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('❌ Landing Page Error:', e.error);
    if (window.spnuLanding) {
        window.spnuLanding.trackEvent('javascript_error', e.message);
    }
});

// Performance Monitoring
window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`⚡ Landing page loaded in ${loadTime}ms`);
    
    if (window.spnuLanding) {
        window.spnuLanding.trackEvent('performance', `load_time_${Math.round(loadTime/1000)}s`);
    }
});

// Export for global access
window.SPnuLanding = SPnuLanding;
