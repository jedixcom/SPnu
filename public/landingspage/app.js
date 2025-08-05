// SPnu Landing Page with Enhanced Analytics
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔴 SPnu Landing Page Loading...');
    
    // Initialize components
    initLoader();
    initMap();
    initNavigation();
    initAnalytics();
    
    console.log('✅ SPnu Landing Page Loaded Successfully');
});

// Loading Animation
function initLoader() {
    const loader = document.getElementById('spnu_loader');
    if (!loader) return;
    
    // Simulate loading progress
    const progressBar = loader.querySelector('.loading-progress');
    if (progressBar) {
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 15;
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                
                // Hide loader after completion
                setTimeout(() => {
                    loader.style.opacity = '0';
                    setTimeout(() => {
                        loader.remove();
                        trackEvent('Page', 'Loaded', 'Landing Page');
                    }, 500);
                }, 800);
            }
            progressBar.style.width = width + '%';
        }, 100);
    }
}

// Map Initialization
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    try {
        console.log('🗺️ Initializing preview map...');
        
        const map = L.map('map').setView([52.3676, 4.9041], 7);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add sample SP events
        const sampleEvents = [
            {
                title: 'SP Demonstratie Amsterdam',
                coords: [52.3738, 4.8910],
                type: 'protest',
                description: 'Demonstratie tegen huurverhoging'
            },
            {
                title: 'SP Vergadering Rotterdam',
                coords: [51.9225, 4.47917],
                type: 'meeting',
                description: 'Maandelijkse SP vergadering'
            },
            {
                title: 'SP Campagne Den Haag',
                coords: [52.0705, 4.3007],
                type: 'canvassing',
                description: 'Deur-tot-deur campagne'
            }
        ];
        
        sampleEvents.forEach(event => {
            const marker = L.marker(event.coords)
                .bindPopup(`
                    <div class="event-popup">
                        <h4>${event.title}</h4>
                        <p><strong>Type:</strong> ${getTypeLabel(event.type)}</p>
                        <p>${event.description}</p>
                    </div>
                `)
                .addTo(map);
            
            marker.eventType = event.type;
        });
        
        // Store map reference for filtering
        window.spnuMap = map;
        window.spnuMarkers = map._layers;
        
        console.log('✅ Preview map initialized');
        trackEvent('Map', 'Initialized', 'Landing Page');
        
    } catch (error) {
        console.error('❌ Map initialization failed:', error);
        mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666;">
                <div style="text-align: center;">
                    <h3>🗺️ Kaart wordt geladen...</h3>
                    <p>Interactieve kaart van SP acties komt hier</p>
                </div>
            </div>
        `;
    }
}

// Navigation and Filtering
function initNavigation() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('mobile-open');
            trackEvent('Navigation', 'Mobile Menu', isExpanded ? 'Close' : 'Open');
        });
    }
    
    // Map filter buttons
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            filterMapEvents(filter);
            
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            trackEvent('Map', 'Filter', filter);
        });
    });
    
    // CTA Button tracking
    const ctaButtons = document.querySelectorAll('.btn');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const buttonText = e.target.textContent.trim();
            trackEvent('CTA', 'Click', buttonText);
        });
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                trackEvent('Navigation', 'Scroll', targetId);
            }
        });
    });
}

// Map Event Filtering
function filterMapEvents(filter) {
    if (!window.spnuMap || !window.spnuMarkers) return;
    
    Object.values(window.spnuMarkers).forEach(layer => {
        if (layer instanceof L.Marker) {
            const shouldShow = filter === 'all' || layer.eventType === filter;
            
            if (shouldShow) {
                window.spnuMap.addLayer(layer);
            } else {
                window.spnuMap.removeLayer(layer);
            }
        }
    });
}

// Analytics Functions
function initAnalytics() {
    // Track page sections in view
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionName = entry.target.id || entry.target.className;
                trackEvent('Page Section', 'View', sectionName);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Track external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const url = e.target.href;
            const linkText = e.target.textContent.trim();
            trackEvent('External Link', 'Click', `${linkText} - ${url}`);
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
            trackEvent('Scroll Depth', 'Reached', `${scrollPercent}%`);
        }
    };
    
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
}

// Analytics Event Tracking
function trackEvent(category, action, label) {
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

// Utility Functions
function getTypeLabel(type) {
    const labels = {
        'protest': 'Protest/Demonstratie',
        'meeting': 'SP Vergadering',
        'canvassing': 'Campagne',
        'strike': 'Staking',
        'community': 'Buurtactie',
        'education': 'Politieke Educatie'
    };
    return labels[type] || type;
}

// Performance monitoring
window.addEventListener('load', () => {
    // Track page load time
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    trackEvent('Performance', 'Page Load Time', `${Math.round(loadTime)}ms`);
});

// Error tracking
window.addEventListener('error', (e) => {
    trackEvent('Error', 'JavaScript Error', e.message);
});

// Export for global access
window.SPnuLanding = {
    trackEvent,
    filterMapEvents,
    getTypeLabel
};
