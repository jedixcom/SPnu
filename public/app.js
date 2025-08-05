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
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    // Replace with your actual config
    apiKey: "your-api-key",
    authDomain: "spnu-app.firebaseapp.com",
    projectId: "spnu-app",
    storageBucket: "spnu-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
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
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.bindEvents();
        this.setupAuthListener();
        this.loadEvents();
    }
    
    initMap() {
        this.map = L.map('map').setView([52.3676, 4.9041], 7);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }
    
    bindEvents() {
        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterEvents(e.target.dataset.filter);
                this.setActiveFilter(e.target);
            });
        });
        
        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.openModal('loginModal');
        });
        
        document.getElementById('signupBtn').addEventListener('click', () => {
            this.openModal('signupModal');
        });
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
        
        // Modal switches
        document.getElementById('switchToSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('loginModal');
            this.openModal('signupModal');
        });
        
        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('signupModal');
            this.openModal('loginModal');
        });
        
        // Add event button
        document.getElementById('addEvent').addEventListener('click', () => {
            if (!this.currentUser) {
                alert('Je moet ingelogd zijn om acties toe te voegen');
                this.openModal('loginModal');
                return;
            }
            this.openModal('eventModal');
        });
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.dataset.modal);
            });
        });
        
        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.signup();
        });
        
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEvent();
        });
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.updateUI();
        });
    }
    
    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userSection = document.getElementById('userSection');
        const userName = document.getElementById('userName');
        
        if (this.currentUser) {
            authButtons.style.display = 'none';
            userSection.style.display = 'flex';
            userName.textContent = this.currentUser.displayName || this.currentUser.email;
        } else {
            authButtons.style.display = 'flex';
            userSection.style.display = 'none';
        }
    }
    
    async signup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const location = document.getElementById('signupLocation').value;
        
        this.showLoading();
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            
            // Store additional user data
            await addDoc(collection(db, 'users'), {
                uid: userCredential.user.uid,
                name: name,
                email: email,
                location: location,
                createdAt: serverTimestamp()
            });
            
            this.closeModal('signupModal');
            this.hideLoading();
            alert('Account succesvol aangemaakt! 🎉');
            
        } catch (error) {
            this.hideLoading();
            alert('Registratie mislukt: ' + error.message);
        }
    }
    
    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        this.showLoading();
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            this.closeModal('loginModal');
            this.hideLoading();
            
        } catch (error) {
            this.hideLoading();
            alert('Inloggen mislukt: ' + error.message);
        }
    }
    
    async logout() {
        try {
            await signOut(auth);
            alert('Succesvol uitgelogd');
        } catch (error) {
            alert('Uitloggen mislukt: ' + error.message);
        }
    }
    
    loadEvents() {
        // Real-time listener for events
        const eventsQuery = query(
            collection(db, 'events'), 
            orderBy('createdAt', 'desc')
        );
        
        this.eventsListener = onSnapshot(eventsQuery, (snapshot) => {
            this.clearMarkers();
            
            snapshot.forEach((doc) => {
                const event = { id: doc.id, ...doc.data() };
                this.addMarkerToMap(event);
            });
        });
    }
    
    addMarkerToMap(event) {
        if (!event.coordinates || !event.coordinates.latitude) return;
        
        const coords = [event.coordinates.latitude, event.coordinates.longitude];
        const isMyEvent = this.currentUser && event.createdBy === this.currentUser.uid;
        
        const marker = L.marker(coords, {
            className: isMyEvent ? 'my-event' : ''
        })
        .bindPopup(this.createPopupContent(event))
        .addTo(this.map);
        
        marker.eventData = event;
        this.markers.push(marker);
    }
    
    createPopupContent(event) {
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
            `<button onclick="app.deleteEvent('${event.id}')" class="delete-btn">🗑️ Verwijderen</button>` : '';
        
        return `
            <div class="event-popup">
                <div class="event-title">${event.title}</div>
                <div class="event-type">${this.getTypeLabel(event.type)}</div>
                <div class="event-details">
                    <strong>📍</strong> ${event.location}<br>
                    <strong>📅</strong> ${date}<br>
                    <strong>👤</strong> ${event.createdByName}<br>
                    <p>${event.description}</p>
                    ${event.contact ? `<strong>📞</strong> ${event.contact}` : ''}
                    ${deleteButton}
                </div>
            </div>
        `;
    }
    
    async addEvent() {
        if (!this.currentUser) {
            alert('Je moet ingelogd zijn om acties toe te voegen');
            return;
        }
        
        const title = document.getElementById('eventTitle').value;
        const type = document.getElementById('eventType').value;
        const location = document.getElementById('eventLocation').value;
        const date = document.getElementById('eventDate').value;
        const description = document.getElementById('eventDescription').value;
        const contact = document.getElementById('eventContact').value;
        
        this.showLoading();
        
        try {
            const coordinates = await this.geocodeLocation(location);
            
            await addDoc(collection(db, 'events'), {
                title,
                type,
                location,
                date,
                description,
                contact,
                coordinates: {
                    latitude: coordinates[0],
                    longitude: coordinates[1]
                },
                createdBy: this.currentUser.uid,
                createdByName: this.currentUser.displayName || this.currentUser.email,
                createdAt: serverTimestamp()
            });
            
            this.closeModal('eventModal');
            this.hideLoading();
            alert('Actie succesvol toegevoegd! 🎉');
            
        } catch (error) {
            this.hideLoading();
            alert('Fout bij toevoegen: ' + error.message);
        }
    }
    
    async deleteEvent(eventId) {
        if (!confirm('Weet je zeker dat je deze actie wilt verwijderen?')) return;
        
        try {
            await deleteDoc(doc(db, 'events', eventId));
            alert('Actie verwijderd');
        } catch (error) {
            alert('Fout bij verwijderen: ' + error.message);
        }
    }
    
    async geocodeLocation(location) {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ', Netherlands')}&format=json&limit=1`
        );
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error('Locatie niet gevonden');
        }
        
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    
    filterEvents(filter) {
        this.markers.forEach(marker => {
            const event = marker.eventData;
            const shouldShow = filter === 'all' || event.type === filter;
            
            if (shouldShow) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }
    
    setActiveFilter(activeBtn) {
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }
    
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        // Reset forms
        document.querySelectorAll(`#${modalId} form`).forEach(form => form.reset());
    }
    
    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
    
    getTypeLabel(type) {
        const labels = {
            'protest': 'Protest',
            'meeting': 'Vergadering',
            'canvassing': 'Campagne',
            'action': 'Actie'
        };
        return labels[type] || type;
    }
}

// Initialize app and make it globally accessible
window.app = new SPnuApp();
