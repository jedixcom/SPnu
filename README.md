# SPnu! - Socialistische Actie Platform

[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-SP%20Nederland-red)](https://sp.nl/)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](https://github.com/jedixcom/SPnu)

**SPnu!** is het digitale actieplatform van de Socialistische Partij Nederland. Een krachtig platform waar socialistische actie tot leven komt - organiseer protesten, vind lokale SP groepen, en maak daadwerkelijk het verschil voor Nederland.

## 🎯 Missie

*"Actie begint hier"* - SPnu! verbindt SP-leden en sympathisanten door heel Nederland om samen te strijden voor sociale rechtvaardigheid, eerlijke lonen en een solidaire samenleving.

## ✨ Kernfuncties

- **🏛️ Actie Organisatie**: Plan en coördineer protesten en demonstraties
- **📍 Lokale Groepen**: Vind en sluit je aan bij SP afdelingen in je buurt  
- **📱 Real-time Communicatie**: Direct contact tussen activisten
- **🗺️ Actiekaart**: Interactieve kaart van lopende acties
- **📊 Impact Tracking**: Meet de effectiviteit van jullie acties
- **🔐 Veilige Platform**: Privacy-first met end-to-end encryptie

## 🚀 Snelstart

### Vereisten

- Moderne webbrowser (Chrome, Firefox, Safari, Edge)
- Internetverbinding
- [Optioneel] Firebase CLI voor development

### Installatie

1. **Clone de repository**
   ```bash
   git clone https://github.com/jedixcom/SPnu.git
   cd SPnu
   ```

2. **Installeer dependencies**
   ```bash
   cd public
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # Of gebruik Firebase CLI:
   firebase serve
   ```

4. **Open je browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

Het platform draait op Firebase Hosting:

```bash
# Deploy naar production
firebase deploy --only hosting

# Deploy met preview URL
firebase hosting:channel:deploy preview
```

## 📱 Platform Overzicht

### Voor SP-leden

- **Registreer**: Maak je SPnu! account aan
- **Verbind**: Vind je lokale SP afdeling
- **Organiseer**: Start nieuwe acties in je gemeente  
- **Deel**: Nodig anderen uit om mee te doen

### Voor Sympathisanten

- **Ontdek**: Bekijk lopende acties in je buurt
- **Steun**: Draag bij aan socialistische doelen
- **Leer**: Ontdek meer over SP standpunten
- **Engageer**: Word actief betrokken bij verandering

## 🛠️ Technologie Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **Maps**: Leaflet.js voor interactieve kaarten
- **PWA**: Service Workers voor offline functionaliteit
- **Build**: Webpack voor bundling en optimalisatie

## 📚 Documentatie

- [Installation Guide](docs/installation.md)
- [User Manual](docs/user-guide.md)  
- [API Documentation](docs/api.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Bijdragen

We verwelkomen bijdragen van alle SP-leden en sympathisanten! Zie [CONTRIBUTING.md](CONTRIBUTING.md) voor:

- Code standaarden
- Pull request proces  
- Bug reporting guidelines
- Feature request process

### Development Setup

```bash
# Fork het project
git fork https://github.com/jedixcom/SPnu

# Maak een feature branch
git checkout -b feature/nieuwe-functionaliteit

# Maak je wijzigingen en test
npm run test
npm run build

# Commit met duidelijke message
git commit -m "feat: voeg nieuwe functionaliteit toe"

# Push en maak pull request
git push origin feature/nieuwe-functionaliteit
```

## 🔒 Privacy & Veiligheid

SPnu! neemt privacy zeer serieus:

- **GDPR Compliant**: Volledig in lijn met Europese privacy wetgeving
- **Data Minimalisatie**: We verzamelen alleen noodzakelijke gegevens  
- **Encryptie**: Alle communicatie is beveiligd
- **Transparantie**: Open source voor volledige controleerbaarheid

## 📞 Contact & Support

- **Website**: [spnu.nl](https://spnu.nl)
- **Email**: support@spnu.nl
- **SP Nederland**: [sp.nl](https://sp.nl)
- **Issues**: [GitHub Issues](https://github.com/jedixcom/SPnu/issues)

## 🏛️ Socialistische Partij Nederland

SPnu! is ontwikkeld door en voor de [Socialistische Partij Nederland](https://sp.nl). De SP strijdt voor:

- Eerlijke verdeling van welvaart
- Sterke publieke voorzieningen  
- Democratische controle over de economie
- Internationale solidariteit
- Duurzame toekomst voor iedereen

## 📄 Licentie

© 2025 Socialistische Partij Nederland. Alle rechten voorbehouden.

*"Niet rijk, niet arm, maar samen!"* - SP Nederland

---

**Sluit je aan bij de beweging** → [SPnu! Account Aanmaken](https://spnu.nl/register)