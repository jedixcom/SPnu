# Installatie Handleiding - SPnu! Platform

## Systeem Vereisten

### Minimale Vereisten
- **Besturingssysteem**: Windows 10+, macOS 10.14+, of Linux (Ubuntu 18.04+)
- **RAM**: 4GB (8GB aanbevolen)
- **Schijfruimte**: 500MB vrije ruimte
- **Internet**: Stabiele internetverbinding (minimum 10 Mbps)

### Browser Ondersteuning
- **Chrome**: 90+ (aanbevolen)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🚀 Snelle Installatie

### Voor Gebruikers (Geen Development)

**SPnu! is een web-applicatie - geen installatie vereist!**

1. **Ga naar**: [spnu.nl](https://spnu.nl)
2. **Maak account aan** of log in
3. **Begin met acties organiseren**

### PWA Installatie (Aanbevolen)

Voor de beste ervaring, installeer SPnu! als Progressive Web App:

#### Android/Chrome:
1. Ga naar [spnu.nl](https://spnu.nl)
2. Tik op het menu (⋮) 
3. Selecteer "App installeren" of "Toevoegen aan startscherm"

#### iOS/Safari:
1. Ga naar [spnu.nl](https://spnu.nl)
2. Tik op het deel-icoon (□↗)
3. Selecteer "Voeg toe aan beginscherm"

#### Desktop:
1. Ga naar [spnu.nl](https://spnu.nl)
2. Klik op het installatie-icoon in de adresbalk
3. Klik "Installeren"

## 💻 Development Setup

### Stap 1: Repository Clonen

```bash
# HTTPS
git clone https://github.com/jedixcom/SPnu.git

# SSH (aanbevolen voor contributors)
git clone git@github.com:jedixcom/SPnu.git

cd SPnu
```

### Stap 2: Dependencies Installeren

```bash
cd public
npm install
```

### Stap 3: Firebase Setup (Optioneel)

Voor volledige functionality heb je Firebase toegang nodig:

```bash
# Installeer Firebase CLI globaal
npm install -g firebase-tools

# Login bij Firebase
firebase login

# Initialiseer project (alleen voor nieuwe setup)
firebase init hosting
```

### Stap 4: Development Server Starten

```bash
# Optie 1: Firebase CLI (aanbevolen)
firebase serve --host 0.0.0.0 --port 5000

# Optie 2: Webpack dev server
npm run dev

# Optie 3: Eenvoudige HTTP server
python -m http.server 8000
# Of:
npx serve .
```

### Stap 5: Verificatie

1. **Open browser**: `http://localhost:5000` (of andere poort)
2. **Check console**: Geen JavaScript errors
3. **Test login**: Maak test account aan
4. **Test maps**: Controleer of kaarten laden

## 🔧 Geavanceerde Configuratie

### Environment Variables

Maak een `.env` bestand in de `public/` directory:

```env
# Firebase configuratie
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=spnu-nl.firebaseapp.com
FIREBASE_PROJECT_ID=spnu-nl
FIREBASE_STORAGE_BUCKET=spnu-nl.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Development
DEBUG_MODE=true
LOG_LEVEL=debug
```

### Build Configuratie

Voor productie builds:

```bash
# Development build
npm run build:dev

# Production build (minified, optimized)
npm run build:prod

# Bundle analyzer
npm run analyze
```

### SSL/HTTPS Setup (Development)

Voor testing van PWA features:

```bash
# Genereer self-signed certificaat
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Start HTTPS server
firebase serve --host 0.0.0.0 --port 5000 --key key.pem --cert cert.pem
```

## 🐳 Docker Setup (Optioneel)

Voor geïsoleerde development environment:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY public/package*.json ./
RUN npm install

COPY public/ ./
EXPOSE 5000

CMD ["firebase", "serve", "--host", "0.0.0.0", "--port", "5000"]
```

```bash
# Build en run
docker build -t spnu-dev .
docker run -p 5000:5000 spnu-dev
```

## 📱 Mobile Development

### Android Studio Setup

Voor native app development (toekomstig):

1. **Download**: [Android Studio](https://developer.android.com/studio)
2. **Install**: Android SDK 30+
3. **Enable**: Developer options op device
4. **Connect**: USB debugging

### iOS Development

Voor iOS app (toekomstig):

1. **macOS**: Vereist voor iOS development
2. **Xcode**: Latest version van App Store
3. **Apple Developer**: Account voor testing op device

## 🔍 Troubleshooting

### Veel Voorkomende Problemen

#### "Firebase not defined" Error
```bash
# Controleer Firebase SDK versie
cat public/app.js | grep gstatic.com

# Update naar laatste versie
# Wijzig versie nummer in app.js
```

#### CORS Errors
```bash
# Start met correct origin
firebase serve --host localhost

# Of configureer CORS in Firebase Console
```

#### Maps Niet Laden
```bash
# Controleer internet verbinding
ping 8.8.8.8

# Controleer Leaflet CDN
curl -I https://unpkg.com/leaflet/dist/leaflet.css
```

#### Build Failures
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Firebase cache
firebase hosting:channel:delete preview
```

### Debug Tools

#### Browser DevTools
- **F12**: Open developer tools
- **Console**: Check voor JavaScript errors  
- **Network**: Monitor API calls
- **Application**: Check Service Worker status

#### Firebase Debug
```bash
# Enable debug mode
firebase serve --debug

# Check Firebase logs
firebase functions:log

# Test Firebase rules
firebase firestore:rules:get
```

## 📋 Checklist Na Installatie

- [ ] Repository succesvol gecloned
- [ ] Dependencies geïnstalleerd zonder errors
- [ ] Development server start zonder problemen
- [ ] Website laadt correct in browser
- [ ] Geen JavaScript console errors
- [ ] Firebase connectie werkt (indien geconfigureerd)
- [ ] Maps worden correct weergegeven
- [ ] PWA installatie werkt
- [ ] Responsive design werkt op mobiel

## 🆘 Hulp Nodig?

- **GitHub Issues**: [Nieuwe issue aanmaken](https://github.com/jedixcom/SPnu/issues/new)
- **Email**: dev-support@spnu.nl
- **SP Nederland**: Voor algemene vragen over de SP
- **Community**: Discussies in GitHub repository

---

**Volgende stap**: [User Guide](user-guide.md) voor het gebruik van het platform.