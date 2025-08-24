# Troubleshooting Guide - SPnu! Platform

## 🔧 Veelvoorkomende Problemen

### 🌐 Toegang & Login Problemen

#### Platform laadt niet
**Symptomen**: Witte pagina, "Site can't be reached" error

**Oplossingen**:
```bash
# Check internetverbinding
ping google.com

# Clear browser cache
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Try incognito/private browsing
Ctrl+Shift+N (Chrome)
Ctrl+Shift+P (Firefox)
```

**Checklist**:
- [ ] Internetverbinding actief
- [ ] Juiste URL: https://spnu.nl
- [ ] Browser cache geleegd
- [ ] JavaScript enabled
- [ ] Ad blockers uitgeschakeld

#### Kan niet inloggen
**Symptomen**: "Onjuiste inloggegevens" ondanks correct wachtwoord

**Oplossingen**:
1. **Wachtwoord reset**:
   - Klik "Wachtwoord vergeten"
   - Check spam folder voor reset email
   - Gebruik sterke wachtwoord met 8+ karakters

2. **Account verificatie**:
   - Check email voor verificatielink
   - Klik link binnen 24 uur
   - Vraag nieuwe verificatie aan indien nodig

3. **Browser issues**:
   ```javascript
   // Clear localStorage
   localStorage.clear();
   
   // Clear sessionStorage  
   sessionStorage.clear();
   ```

#### Verificatie email niet ontvangen
**Oplossingen**:
- Check spam/junk folder
- Voeg support@spnu.nl toe aan contacten
- Vraag nieuwe verificatie aan na 5 minuten
- Gebruik alternatief emailadres indien mogelijk

### 🗺️ Kaart Problemen

#### Kaart laadt niet
**Symptomen**: Grijze vlakken in plaats van kaart

**Oplossingen**:
```javascript
// Check console voor errors
F12 → Console tab

// Common fixes:
- Refresh pagina (F5)
- Check internet snelheid (min 10 Mbps)
- Disable VPN tijdelijk
- Allow location access in browser
```

#### Locatie niet gevonden
**Symptomen**: "Kan je locatie niet bepalen"

**Oplossingen**:
1. **Browser permissies**:
   - Chrome: klik slot-icoon → Location → Allow
   - Firefox: klik schild-icoon → Permissions → Location → Allow
   - Safari: Preferences → Privacy → Location Services

2. **Handmatige locatie**:
   - Voer postcode in zoekbalk
   - Gebruik adres in plaats van GPS
   - Check spelling van plaatsnaam

3. **VPN/Proxy issues**:
   - Schakel VPN uit voor accuraat resultaat
   - Use Nederlandse IP voor beste ervaring

#### Markers niet zichtbaar
**Oplossingen**:
- Zoom out voor breder overzicht
- Check filters (alle categorieën aan)
- Refresh pagina en wacht op data loading
- Clear browser cache

### 📱 Mobile/PWA Problemen

#### App installeert niet
**Symptomen**: "Install" knop niet zichtbaar

**Oplossingen per platform**:

**Android/Chrome**:
```bash
# Requirements checken:
- Chrome 90+
- Android 7.0+
- Stable internet connection

# Manual install:
1. Chrome menu (⋮)
2. "Add to Home screen"
3. Confirm installation
```

**iOS/Safari**:
```bash
# Requirements:
- Safari 14.0+
- iOS 14.0+

# Manual install:
1. Share button (□↗)
2. "Add to Home Screen"
3. Confirm
```

**Desktop**:
- Chrome: Address bar install icon
- Edge: Settings → Apps → Install this site as an app
- Firefox: Use browser shortcuts

#### Push notificaties werken niet
**Oplossingen**:
1. **Browser permissions**:
   - Chrome: Settings → Privacy → Notifications → Allow spnu.nl
   - Firefox: Preferences → Privacy → Notifications → Exceptions

2. **Device settings**:
   - Android: Settings → Apps → Chrome → Notifications → Allow
   - iOS: Settings → Safari → Notifications → Allow

3. **Re-enable**:
   ```javascript
   // In browser console:
   Notification.requestPermission().then(permission => {
       console.log('Permission:', permission);
   });
   ```

### 🔥 Firebase Connectie Problemen

#### "Connection lost" berichten
**Symptomen**: Real-time updates stoppen

**Oplossingen**:
```javascript
// Check Firebase status
https://status.firebase.google.com/

// Browser console check:
firebase.database().goOnline();

// Force reconnection:
location.reload();
```

#### Data niet bijgewerkt
**Oplossingen**:
- Hard refresh: Ctrl+Shift+R
- Check account permissions
- Logout en login opnieuw
- Clear browser data

### 💬 Chat & Berichten Problemen

#### Berichten komen niet aan
**Diagnose stappen**:
1. Check internetverbinding
2. Refresh chat venster
3. Logout/login opnieuw
4. Check of ontvanger online is

**Code debugging**:
```javascript
// Console check voor chat errors:
console.log('Chat connected:', chatConnected);
console.log('User online:', userOnline);
console.log('Last message time:', lastMessageTime);
```

#### Kan geen groepen joinen
**Oplossingen**:
- Check of account geverifieerd is
- Wacht op admin goedkeuring (kan 24-48 uur duren)
- Contact groep admins direct
- Check account standing (geen bans/warnings)

### 🔧 Performance Problemen

#### Langzaam laden
**Performance optimalisatie**:

```bash
# Browser optimalisatie:
- Close unused tabs
- Disable unnecessary extensions
- Clear cache regularly
- Update browser to latest version

# Network optimization:
- Use WiFi instead of mobile data
- Move closer to router
- Restart router if needed
- Contact ISP for persistent issues
```

#### Hoog data verbruik
**Data saving tips**:
- Gebruik WiFi waar mogelijk
- Disable auto-play videos
- Lower map detail level
- Compress images before upload

### 🛡️ Beveiliging & Privacy

#### Verdachte account activiteit
**Onmiddellijke stappen**:
1. **Wachtwoord wijzigen**: Direct nieuw sterk wachtwoord
2. **Logout alle devices**: Account settings → Security → Logout all
3. **Check login history**: Review recent login locations/times
4. **Enable 2FA**: Extra beveiliging voor account

**Contact support**:
- Email: security@spnu.nl
- Include: IP addresses, timestamps, suspicious activity details

#### Privacy settings niet opgeslagen
**Oplossingen**:
- Check browser allows cookies voor spnu.nl
- Disable incognito/private browsing
- Clear cache en probeer opnieuw
- Check account permissions

## 🛠️ Developer Issues

### Build Problemen

#### npm install fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check Node version
node --version  # Should be 18+
npm --version   # Should be 9+

# Alternative package managers
yarn install
# or
pnpm install
```

#### Webpack build errors
```bash
# Clear webpack cache
rm -rf node_modules/.cache
rm -rf dist/

# Rebuild
npm run build:clean
npm run build

# Check for conflicting dependencies
npm ls
npm audit fix
```

#### Firebase deployment fails
```bash
# Check Firebase login
firebase login --reauth

# Verify project access
firebase projects:list
firebase use spnu-nl

# Deploy specific targets
firebase deploy --only hosting
firebase deploy --only functions
```

### Development Server Issues

#### localhost:5000 not accessible
```bash
# Check if port is available
netstat -an | grep 5000
lsof -i :5000

# Try different port
firebase serve --port 5001
npm run dev -- --port 3000

# Check firewall
sudo ufw allow 5000  # Linux
```

#### Hot reload not working
```bash
# Check webpack dev server config
npm run dev:debug

# Verify file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart dev server
npm run dev:restart
```

## 📞 Escalatie Procedures

### Level 1: Self-Service
- Check deze troubleshooting guide
- Search [GitHub Issues](https://github.com/jedixcom/SPnu/issues)
- Try [Community Forum](https://github.com/jedixcom/SPnu/discussions)

### Level 2: Community Support
- Post in [GitHub Discussions](https://github.com/jedixcom/SPnu/discussions)
- Ask in SP Nederland local groups
- Check [Stack Overflow](https://stackoverflow.com/questions/tagged/spnu) (tag: spnu)

### Level 3: Direct Support
- **General Issues**: support@spnu.nl
- **Technical Issues**: tech@spnu.nl  
- **Security Issues**: security@spnu.nl
- **Account Issues**: accounts@spnu.nl

### Level 4: Emergency
- **Critical bugs**: emergency@spnu.nl
- **Security breaches**: security@spnu.nl (urgent)
- **Service outages**: ops@spnu.nl

## 📊 Diagnostics Tools

### Browser Debug Info
```javascript
// Run in console for debug info:
console.log({
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    cookies: navigator.cookieEnabled,
    online: navigator.onLine,
    connection: navigator.connection?.effectiveType
});
```

### Network Diagnostics
```bash
# Test connectivity
ping spnu.nl
nslookup spnu.nl
traceroute spnu.nl

# Speed test
curl -w "@curl-format.txt" -o /dev/null -s https://spnu.nl/

# DNS check
dig spnu.nl
```

### Firebase Debug
```javascript
// Enable Firebase debug mode
localStorage.setItem('debug', 'firebase*');

// Check auth state
firebase.auth().currentUser;

// Test database connection
firebase.firestore().enableNetwork();
```

## 📝 Reporting Template

Wanneer je support contacteert, gebruik deze template:

```
Subject: [ISSUE TYPE] Brief description

**Issue Description**:
Clear description of the problem

**Steps to Reproduce**:
1. Step one
2. Step two  
3. Step three

**Expected Behavior**:
What should happen

**Actual Behavior**: 
What actually happens

**Environment**:
- OS: Windows 10 / macOS 11.6 / Ubuntu 20.04
- Browser: Chrome 96 / Firefox 95 / Safari 15
- Device: Desktop / Mobile (iPhone 12 / Samsung Galaxy S21)
- Network: WiFi / Mobile data / Corporate network

**Account Info** (if relevant):
- Username: your.email@example.com
- Member type: SP Member / Sympathizer
- Account created: Approximate date

**Screenshots/Logs**:
Attach relevant screenshots or error logs

**Attempts to Fix**:
What you've already tried
```

---

**Need immediate help?** Join our community chat or email support@spnu.nl

**Found a solution not listed here?** Consider contributing to this guide via [GitHub](https://github.com/jedixcom/SPnu/edit/main/docs/troubleshooting.md)!