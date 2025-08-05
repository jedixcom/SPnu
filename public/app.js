// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
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
    onSnapshot,
    where,
    serverTimestamp,
    doc,
    deleteDoc,
    updateDoc,
    GeoPoint
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyANa0kvCZcmiai6wbsgRWMTkHln09i7PcQ",
    authDomain: "spnu-nl.firebaseapp.com",
    projectId: "spnu-nl",
    storageBucket: "spnu-nl.firebasestorage.app",
    messagingSenderId: "817817458296",
    appId: "1:817817458296:web:a5faf87e37c033ef55ff8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

class SPnuApp {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentUser = null;
        this.eventsListener = null;
        this.isLandingPage = document.querySelector('.hero') !== null;
        this.stats = {
            totalEvents: 0,
            totalUsers: 0,
            activeBranches: 50
        };
        
        this.init();
    }

    init() {
        console.log('🔴 SPnu App initializing...', this.isLandingPage ? '(Landing Page Mode)' : '(App Mode)');
        
        if (this.isLandingPage) {
            this.initLandingPage();
        }
        
        this.initMap();
        this.bindEvents();
        this.setupAuthListener();
        this.loadEvents();
        this.loadStats();
        
        console.log('✅ SPnu App initialized successfully');
    }

    // Landing Page Specific Initialization
    initLandingPage() {
        this.initLoader();
        this.initScrollAnimations();
        this.initMobileMenu();
        this.initHeroStats();
        this.trackPageView();
    }

    initLoader() {
        const loader = document.getElementById('spnu_loader');
        if (!loader) return;

        const progressBar = loader.querySelector('.loading-progress');
        let width = 0;
        
        const interval = setInterval(() => {
            width += Math.random() * 15;
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    loader.style.opacity = '0';
                    setTimeout(() => {
                        loader.remove();
                        this.trackEvent('Page', 'Loaded', 'Landing');
                    }, 500);
                }, 800);
            }
            if (progressBar) {
                progressBar.style.width = width + '%';
            }
        }, 100);
    }

    initScrollAnimations() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Track section views
                    const sectionName = entry.target.id || entry.target.className.split(' ')[0];
                    this.trackEvent('Section', 'View', sectionName);
                }
            });
        }, observerOptions);

        // Observe sections
        document.querySelectorAll('section, .feature-card').forEach(section => {
            observer.observe(section);
        });
    }

    initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.nav');
        
        if (mobileMenuBtn && nav) {
            mobileMenuBtn.addEventListener('click', () => {
                const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
                mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
                nav.classList.toggle('mobile-open');
                
                // Animate hamburger menu
                mobileMenuBtn.classList.toggle('active');
                
                this.trackEvent('Navigation', 'Mobile Menu', isExpanded ? 'Close' : 'Open');
            });
        }
    }

    initHeroStats() {
        // Animate stats numbers
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent.replace(/[^\d]/g, ''));
            this.animateNumber(stat, 0, finalValue, 2000);
        });
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            const formattedNumber = current >= 1000 ? 
                (current / 1000).toFixed(0) + 'k+' : 
                current.toString();
            
            element.textContent = formattedNumber;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }

    initMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        try {
            console.log('🗺️ Initializing map...');
            
            this.map = L.map('map', {
                center: [52.3676, 4.9041],
                zoom: this.isLandingPage ? 7 : 8,
                zoomControl: true,
                attributionControl: true
            });

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors | SPnu - Socialistische Actie Platform',
                maxZoom: 18
            }).addTo(this.map);

            // Add custom controls for landing page
            if (this.isLandingPage) {
                this.addMapControls();
            }

            console.log('✅ Map initialized successfully');
            this.trackEvent('Map', 'Initialized', this.isLandingPage ? 'Landing' : 'App');
            
        } catch (error) {
            console.error('❌ Map initialization failed:', error);
            this.showMapError(mapContainer);
        }
    }

    addMapControls() {
        // Custom control for SP branding
        const spControl = L.Control.extend({
            onAdd: function(map) {
                const div = L.DomUtil.create('div', 'sp-map-control');
                div.innerHTML = `
                    <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <strong style="color: #e9161d;">SPnu</strong>
                        <br><small>Live Actiekaart</small>
                    </div>
                `;
                return div;
            }
        });
        new spControl({ position: 'topright' }).addTo(this.map);
    }

    showMapError(container) {
        container.innerHTML = `
            <div class="map-error" style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100%; 
                background: var(--sp-light-gray); 
                color: var(--sp-gray);
                text-align: center;
                padding: 2rem;
            ">
                <div>
                    <h3 style="color: var(--sp-red); margin-bottom: 1rem;">🗺️ Kaart laden...</h3>
                    <p>De interactieve kaart met SP acties wordt geladen.</p>
                    <p><small>Controleer je internetverbinding als dit lang duurt.</small></p>
                </div>
            </div>
        `;
    }

    bindEvents() {
        this.bindFilterEvents();
        this.bindAuthEvents();
        this.bindModalEvents();
        this.bindFormEvents();
        this.bindLandingPageEvents();
        this.bindAnalyticsEvents();
    }

    bindFilterEvents() {
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterEvents(filter);
                this.setActiveFilter(e.target);
                this.trackEvent('Map', 'Filter', filter);
            });
        });
    }

    bindAuthEvents() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.openModal('loginModal');
                this.trackEvent('Auth', 'Open', 'Login Modal');
            });
        }

        // Signup button  
        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.openModal('signupModal');
                this.trackEvent('Auth', 'Open', 'Signup Modal');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Join SP buttons (landing page)
        document.querySelectorAll('#joinSP, .btn[href*="wordlid"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackEvent('CTA', 'Click', 'Join SP');
            });
        });
    }

    bindModalEvents() {
        // Modal switches
        const switchToSignup = document.getElementById('switchToSignup');
        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('loginModal');
                this.openModal('signupModal');
                this.trackEvent('Auth', 'Switch', 'To Signup');
            });
        }

        const switchToLogin = document.getElementById('switchToLogin');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('signupModal');
                this.openModal('loginModal');
                this.trackEvent('Auth', 'Switch', 'To Login');
            });
        }

        // Add event button
        const addEventBtn = document.getElementById('addEvent');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => {
                if (!this.currentUser) {
                    this.showAuthRequired();
                    return;
                }
                this.openModal('eventModal');
                this.trackEvent('Event', 'Open', 'Add Modal');
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                if (modalId) {
                    this.closeModal(modalId);
                }
            });
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    bindFormEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.signup();
            });
        }

        // Event form
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addEvent();
            });
        }
    }

    bindLandingPageEvents() {
        if (!this.isLandingPage) return;

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    this.trackEvent('Navigation', 'Scroll', targetId);
                }
            });
        });

        // Feature card interactions
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    bindAnalyticsEvents() {
        // Track external links
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = e.target.href;
                const linkText = e.target.textContent.trim();
                this.trackEvent('External Link', 'Click', `${linkText} - ${url}`);
            });
        });

        // Track scroll depth
        let maxScroll = 0;
        const trackScrollDepth = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
                maxScroll = scrollPercent;
                this.trackEvent('Scroll Depth', 'Reached', `${scrollPercent}%`);
            }
        };

        window.addEventListener('scroll', trackScrollDepth, { passive: true });
    }

    setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            console.log('👤 Auth state changed:', user ? user.email : 'Not logged in');
            this.currentUser = user;
            this.updateUI();
            
            if (user) {
                this.trackEvent('Auth', 'State', 'Logged In');
            }
        });
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userSection = document.getElementById('userSection');
        const userName = document.getElementById('userName');

        if (!authButtons || !userSection || !userName) return;

        if (this.currentUser) {
            authButtons.style.display = 'none';
            userSection.style.display = 'flex';
            userName.textContent = this.currentUser.displayName || this.currentUser.email;
            
            // Update CTA buttons for logged in users
            this.updateCTAButtons(true);
        } else {
            authButtons.style.display = 'flex';
            userSection.style.display = 'none';
            
            this.updateCTAButtons(false);
        }
    }

    updateCTAButtons(isLoggedIn) {
        const ctaButtons = document.querySelectorAll('.nav-btn, .btn');
        ctaButtons.forEach(btn => {
            if (btn.textContent.includes('Word SP Lid') && isLoggedIn) {
                btn.textContent = '✊ Organiseer Actie';
                btn.onclick = () => this.openModal('eventModal');
            }
        });
    }

    async signup() {
        const name = document.getElementById('signupName')?.value;
        const email = document.getElementById('signupEmail')?.value;
        const password = document.getElementById('signupPassword')?.value;
        const location = document.getElementById('signupLocation')?.value;
        const branch = document.getElementById('signupBranch')?.value;

        if (!name || !email || !password) {
            this.showNotification('Vul alle verplichte velden in', 'error');
            return;
        }

        this.showLoading();
        this.trackEvent('Auth', 'Attempt', 'Signup');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });

            // Store additional user data
            await addDoc(collection(db, 'users'), {
                uid: userCredential.user.uid,
                name: name,
                email: email,
                location: location,
                branch: branch || 'Geen voorkeur',
                createdAt: serverTimestamp(),
                role: 'member'
            });

            this.closeModal('signupModal');
            this.hideLoading();
            this.showNotification('Welkom bij de SP! Je account is succesvol aangemaakt! 🔴✊', 'success');
            this.trackEvent('Auth', 'Success', 'Signup');

        } catch (error) {
            this.hideLoading();
            console.error('Signup error:', error);
            this.handleAuthError(error);
            this.trackEvent('Auth', 'Error', 'Signup - ' + error.code);
        }
    }

    async login() {
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            this.showNotification('Vul email en wachtwoord in', 'error');
            return;
        }

        this.showLoading();
        this.trackEvent('Auth', 'Attempt', 'Login');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            this.closeModal('loginModal');
            this.hideLoading();
            this.showNotification('Welkom terug, kameraad! 🔴', 'success');
            this.trackEvent('Auth', 'Success', 'Login');

        } catch (error) {
            this.hideLoading();
            console.error('Login error:', error);
            this.handleAuthError(error);
            this.trackEvent('Auth', 'Error', 'Login - ' + error.code);
        }
    }

    async logout() {
        try {
            await signOut(auth);
            this.showNotification('Tot ziens, kameraad! Blijf strijden! ✊', 'success');
            this.trackEvent('Auth', 'Success', 'Logout');
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Uitloggen mislukt: ' + error.message, 'error');
        }
    }

    loadEvents() {
        console.log('📅 Loading events...');
        
        const eventsQuery = query(
            collection(db, 'events'), 
            orderBy('createdAt', 'desc')
        );

        this.eventsListener = onSnapshot(eventsQuery, (snapshot) => {
            console.log(`📡 Received ${snapshot.size} events from Firebase`);
            this.clearMarkers();
            
            let eventCount = 0;
            snapshot.forEach((doc) => {
                const eventData = doc.data();
                const event = { id: doc.id, ...eventData };
                
                if (this.addMarkerToMap(event)) {
                    eventCount++;
                }
            });
            
            this.stats.totalEvents = eventCount;
            this.updateLandingPageStats();
            this.trackEvent('Events', 'Loaded', eventCount.toString());
            
        }, (error) => {
            console.error('❌ Events loading failed:', error);
            this.loadSampleEvents();
        });
    }

    loadSampleEvents() {
        console.log('📋 Loading sample events...');
        const sampleEvents = [
            {
                id: 'sample-1',
                title: 'SP Demonstratie tegen Huurverhoging',
                type: 'protest',
                location: 'Amsterdam, Dam',
                coordinates: { latitude: 52.3738, longitude: 4.8910 },
                date: '2024-12-25T14:00',
                description: 'Samen staan we sterk tegen onrechtvaardige huurverhogingen! Sluit je aan bij de SP.',
                createdByName: 'SP Amsterdam',
                contact: 'amsterdam@sp.nl'
            },
            {
                id: 'sample-2',
                title: 'SP Vergadering Rotterdam',
                type: 'meeting',
                location: 'Rotterdam, SP kantoor',
                coordinates: { latitude: 51.9225, longitude: 4.47917 },
                date: '2024-12-22T19:30',
                description: 'Maandelijkse vergadering voor alle SP leden. Nieuwe leden welkom!',
                createdByName: 'SP Rotterdam',
                contact: 'rotterdam@sp.nl'
            },
            {
                id: 'sample-3',
                title: 'SP Campagne Den Haag',
                type: 'canvassing',
                location: 'Den Haag, Centraal Station',
                coordinates: { latitude: 52.0805, longitude: 4.3247 },
                date: '2024-12-20T10:00',
                description: 'Deur-tot-deur campagne voor eerlijke zorg en betaalbare woningen.',
                createdByName: 'SP Den Haag',
                contact: 'denhaag@sp.nl'
            }
        ];

        sampleEvents.forEach(event => {
            this.addMarkerToMap(event);
        });

        this.stats.totalEvents = sampleEvents.length;
        this.updateLandingPageStats();
    }

    addMarkerToMap(event) {
        if (!event.coordinates || !event.coordinates.latitude || !this.map) {
            console.warn('⚠️ Invalid event data or map not initialized:', event);
            return false;
        }

        try {
            const coords = [event.coordinates.latitude, event.coordinates.longitude];
            const isMyEvent = this.currentUser && event.createdBy === this.currentUser.uid;

            // Create custom icon based on event type
            const icon = this.createEventIcon(event.type, isMyEvent);

            const marker = L.marker(coords, { icon })
                .bindPopup(this.createPopupContent(event))
                .addTo(this.map);

            marker.eventData = event;
            this.markers.push(marker);

            return true;
        } catch (error) {
            console.error('❌ Failed to add marker:', error);
            return false;
        }
    }

    createEventIcon(type, isMyEvent) {
        const colors = {
            'protest': '#e9161d',
            'meeting': '#ff6b35',
            'canvassing': '#f7931e',
            'strike': '#c41e3a',
            'community': '#2e86de',
            'education': '#10ac84'
        };

        const color = colors[type] || '#e9161d';
        const iconClass = isMyEvent ? 'my-event-icon' : 'event-icon';

        return L.divIcon({
            className: iconClass,
            html: `<div style="
                background: ${color};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ${isMyEvent ? 'border-color: #ffcc00; box-shadow: 0 0 10px rgba(255,204,0,0.5);' : ''}
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }

    createPopupContent(event) {
        if (!event) return '<div>Geen event data</div>';

        try {
            const date = new Date(event.date).toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const isMyEvent = this.currentUser && event.createdBy === this.currentUser.uid;
            const deleteButton = isMyEvent ? 
                `<button onclick="window.app.deleteEvent('${event.id}')" class="delete-btn" style="
                    background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; 
                    border-radius: 4px; cursor: pointer; margin-top: 0.5rem; font-size: 0.8rem;
                ">🗑️ Verwijderen</button>` : '';

            return `
                <div class="event-popup" style="min-width: 250px; font-family: 'Inter', sans-serif;">
                    <div class="event-title" style="
                        font-weight: 900; color: #e9161d; margin-bottom: 0.5rem; 
                        font-size: 1.1rem; text-transform: uppercase;
                    ">${this.escapeHtml(event.title)}</div>
                    
                    <div class="event-type" style="
                        background: #e9161d; color: white; padding: 0.25rem 0.75rem; 
                        border-radius: 3px; font-size: 0.8rem; font-weight: 700; 
                        text-transform: uppercase; display: inline-block; margin-bottom: 0.75rem;
                    ">${this.getTypeLabel(event.type)}</div>
                    
                    <div class="event-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <div style="margin-bottom: 0.5rem;">
                            <strong>📍</strong> ${this.escapeHtml(event.location)}<br>
                            <strong>📅</strong> ${date}<br>
                            <strong>👤</strong> ${this.escapeHtml(event.createdByName || 'SP Activist')}
                        </div>
                        
                        <p style="margin: 0.75rem 0; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                            ${this.escapeHtml(event.description || 'Geen beschrijving beschikbaar')}
                        </p>
                        
                        ${event.contact ? `
                            <div style="margin-top: 0.5rem;">
                                <strong>📞</strong> <a href="mailto:${event.contact}" style="color: #e9161d;">${this.escapeHtml(event.contact)}</a>
                            </div>
                        ` : ''}
                        
                        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #eee;">
                            <small style="color: #666;">
                                ✊ <strong>Solidariteit en samenwerking</strong><br>
                                Samen staan we sterk voor sociale rechtvaardigheid!
                            </small>
                        </div>
                        
                        ${deleteButton}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Failed to create popup:', error);
            return '<div>Fout bij laden event details</div>';
        }
    }

    async addEvent() {
        if (!this.currentUser) {
            this.showAuthRequired();
            return;
        }

        const title = document.getElementById('eventTitle')?.value;
        const type = document.getElementById('eventType')?.value;
        const location = document.getElementById('eventLocation')?.value;
        const date = document.getElementById('eventDate')?.value;
        const description = document.getElementById('eventDescription')?.value;
        const contact = document.getElementById('eventContact')?.value;

        if (!title || !type || !location || !date) {
            this.showNotification('Vul alle verplichte velden in', 'error');
            return;
        }

        this.showLoading();
        this.trackEvent('Event', 'Attempt', 'Add');

        try {
            const coordinates = await this.geocodeLocation(location);

            await addDoc(collection(db, 'events'), {
                title,
                type,
                location,
                date,
                description: description || 'Een socialistische actie georganiseerd door de SP.',
                contact,
                coordinates: new GeoPoint(coordinates[0], coordinates[1]),
                createdBy: this.currentUser.uid,
                createdByName: this.currentUser.displayName || this.currentUser.email,
                createdAt: serverTimestamp(),
                status: 'active'
            });

            this.closeModal('eventModal');
            this.hideLoading();
            this.showNotification('SP actie succesvol georganiseerd! Laat de revolutie beginnen! ✊🔴', 'success');
            this.trackEvent('Event', 'Success', 'Add - ' + type);

        } catch (error) {
            this.hideLoading();
            console.error('Add event error:', error);
            this.showNotification('Fout bij organiseren actie: ' + (error.message || 'Onbekende fout'), 'error');
            this.trackEvent('Event', 'Error', 'Add - ' + error.message);
        }
    }

    async deleteEvent(eventId) {
        if (!confirm('Weet je zeker dat je deze SP actie wilt verwijderen?')) return;

        this.trackEvent('Event', 'Attempt', 'Delete');

        try {
            await deleteDoc(doc(db, 'events', eventId));
            this.showNotification('SP actie succesvol verwijderd', 'success');
            this.trackEvent('Event', 'Success', 'Delete');
        } catch (error) {
            console.error('Delete event error:', error);
            this.showNotification('Fout bij verwijderen: ' + (error.message || 'Onbekende fout'), 'error');
            this.trackEvent('Event', 'Error', 'Delete - ' + error.message);
        }
    }

    async geocodeLocation(location) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ', Netherlands')}&format=json&limit=1&countrycodes=nl`
            );
            
            if (!response.ok) {
                throw new Error('Geocoding service niet beschikbaar');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                throw new Error('Locatie niet gevonden in Nederland. Probeer een meer specifiek adres.');
            }

            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    async loadStats() {
        try {
            // Get user count
            const usersSnapshot = await getDocs(collection(db, 'users'));
            this.stats.totalUsers = usersSnapshot.size;
            
            this.updateLandingPageStats();
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateLandingPageStats() {
        if (!this.isLandingPage) return;

        const statElements = {
            events: document.querySelector('.stat-number[data-stat="events"]'),
            users: document.querySelector('.stat-number[data-stat="users"]'),
            branches: document.querySelector('.stat-number[data-stat="branches"]')
        };

        if (statElements.events) {
            this.updateStatNumber(statElements.events, this.stats.totalEvents || 100);
        }
        
        if (statElements.users) {
            this.updateStatNumber(statElements.users, this.stats.totalUsers || 1500);
        }
    }

    updateStatNumber(element, newValue) {
        const currentValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
        this.animateNumber(element, currentValue, newValue, 1000);
    }

    filterEvents(filter) {
        if (!this.map) return;

        this.markers.forEach(marker => {
            if (!marker.eventData) return;

            const event = marker.eventData;
            const shouldShow = filter === 'all' || event.type === filter;

            if (shouldShow) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });

        console.log(`🔍 Filtered events: ${filter}`);
    }

    setActiveFilter(activeBtn) {
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    clearMarkers() {
        if (!this.map) return;
        
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    // UI Helper Methods
    showAuthRequired() {
        this.showNotification('Je moet ingelogd zijn als SP lid om acties te organiseren', 'warning');
        this.openModal('loginModal');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: ${type === 'warning' ? '#333' : 'white'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 400px;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            
            // Focus management for accessibility
            const firstInput = modal.querySelector('input, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scroll
            
            // Reset forms
            modal.querySelectorAll('form').forEach(form => form.reset());
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

    // Utility Methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getTypeLabel(type) {
        const labels = {
            'protest': 'Protest/Demonstratie',
            'meeting': 'SP Vergadering',
            'canvassing': 'Campagne Voeren',
            'strike': 'Staking/Solidariteit',
            'community': 'Buurtactie',
            'education': 'Politieke Educatie',
            'action': 'Algemene Actie'
        };
        return labels[type] || type;
    }

    handleAuthError(error) {
        const errorMessages = {
            'auth/user-not-found': 'Geen SP account gevonden met dit email adres',
            'auth/wrong-password': 'Verkeerd wachtwoord',
            'auth/email-already-in-use': 'Dit email adres is al geregistreerd als SP lid',
            'auth/weak-password': 'Wachtwoord is te zwak (minimaal 6 karakters)',
            'auth/invalid-email': 'Ongeldig email adres',
            'auth/too-many-requests': 'Te veel loginpogingen. Probeer later opnieuw.',
            'auth/network-request-failed': 'Netwerkfout. Controleer je internetverbinding.'
        };

        const message = errorMessages[error.code] || error.message || 'Onbekende fout';
        this.showNotification('SP Account Fout: ' + message, 'error');
    }

    // Analytics Methods
    trackPageView() {
        this.trackEvent('Page', 'View', window.location.pathname);
    }

    trackEvent(category, action, label) {
        // Matomo tracking
        if (window._paq) {
            window._paq.push(['trackEvent', category, action, label]);
        }

        // Console logging for development
        console.log(`📊 Analytics: ${category} - ${action} - ${label}`);

        // Google Analytics (if needed)
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
    }
}

// CSS Animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .mobile-open {
        display: flex !important;
        position: fixed;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
    }
    
    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔴 SPnu Platform Starting...');
    window.app = new SPnuApp();
});

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
    if (window.app && window.app.trackEvent) {
        window.app.trackEvent('Error', 'JavaScript Error', e.message);
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    console.log(`⚡ SPnu loaded in ${loadTime}ms`);
    
    if (window.app && window.app.trackEvent) {
        window.app.trackEvent('Performance', 'Page Load Time', `${Math.round(loadTime)}ms`);
    }
});

// Export for global access
window.SPnu = SPnuApp;