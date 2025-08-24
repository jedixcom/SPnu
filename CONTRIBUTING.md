# Contributing Guidelines - SPnu! Platform

Welkom bij SPnu! We zijn blij dat je wilt bijdragen aan ons socialistische actieplatform. Deze handleiding helpt je om effectief bij te dragen aan het project.

## 🎯 Onze Missie

SPnu! strijdt voor sociale rechtvaardigheid door technologie democratisch en toegankelijk te maken. We bouwen tools die werkende mensen empoweren om actie te ondernemen en verandering te realiseren.

## 🤝 Hoe kun je bijdragen?

### Voor Niet-Developers

- **🐛 Bug Reports**: Meld problemen die je tegenkomt
- **💡 Feature Requests**: Stel nieuwe functionaliteiten voor
- **📝 Documentatie**: Verbeter handleidingen en tutorials
- **🌍 Vertalingen**: Help met internationalisatie
- **🎨 Design**: UI/UX verbeteringen en feedback
- **📊 Testing**: Test nieuwe features en rapporteer bevindingen

### Voor Developers

- **💻 Code Contributions**: Bug fixes en nieuwe features
- **🏗️ Architecture**: Technische verbeteringen en optimalisaties
- **🔒 Security**: Beveiligingsaudits en verbeteringen
- **⚡ Performance**: Optimalisatie en caching
- **🧪 Testing**: Unit tests en integration tests
- **📱 Mobile**: PWA verbeteringen en native apps

## 🚀 Development Setup

### Vereisten

- **Node.js**: 18+ (aanbevolen: LTS versie)
- **Git**: Voor version control
- **Browser**: Chrome/Firefox met developer tools
- **Editor**: VSCode aanbevolen met extensions

### Quick Start

```bash
# 1. Fork en clone
git clone https://github.com/yourusername/SPnu.git
cd SPnu

# 2. Install dependencies
cd public
npm install

# 3. Start development server
npm run dev
# Of:
firebase serve

# 4. Open browser
open http://localhost:5000
```

### Recommended VSCode Extensions

```json
{
    "recommendations": [
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-json",
        "ms-vscode-remote.remote-containers",
        "streetsidesoftware.code-spell-checker",
        "esbenp.prettier-vscode",
        "ms-vscode.live-server"
    ]
}
```

## 📋 Code Standards

### JavaScript/ES6+

```javascript
// ✅ Good
const getUserActions = async (userId) => {
    try {
        const actions = await fetchUserActions(userId);
        return actions.filter(action => action.isActive);
    } catch (error) {
        console.error('Error fetching user actions:', error);
        throw new Error('Failed to load user actions');
    }
};

// ❌ Bad
function getUserActions(userId, callback) {
    fetchUserActions(userId, function(error, actions) {
        if (error) {
            callback(error);
        } else {
            var activeActions = [];
            for (var i = 0; i < actions.length; i++) {
                if (actions[i].isActive) {
                    activeActions.push(actions[i]);
                }
            }
            callback(null, activeActions);
        }
    });
}
```

### CSS/Styling

```css
/* ✅ Good - BEM methodology */
.action-card {
    border: 1px solid var(--sp-gray-200);
    border-radius: 8px;
    padding: var(--space-md);
}

.action-card__title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--sp-red);
}

.action-card__title--urgent {
    color: var(--sp-red-dark);
    animation: pulse 2s infinite;
}

/* ❌ Bad */
.card {
    border: 1px solid #ccc;
    padding: 16px;
}

.title {
    font-size: 18px;
    font-weight: bold;
}
```

### HTML Semantics

```html
<!-- ✅ Good -->
<article class="action-card" itemscope itemtype="https://schema.org/Event">
    <header class="action-card__header">
        <h2 class="action-card__title" itemprop="name">Demonstratie voor Eerlijke Lonen</h2>
        <time class="action-card__date" itemprop="startDate" datetime="2025-01-15T14:00:00">
            15 januari 2025, 14:00
        </time>
    </header>
    
    <div class="action-card__content">
        <p class="action-card__description" itemprop="description">
            Protest tegen lage lonen in de zorg...
        </p>
    </div>
    
    <footer class="action-card__actions">
        <button class="btn btn-primary" aria-label="Aanmelden voor demonstratie">
            Doe mee
        </button>
    </footer>
</article>

<!-- ❌ Bad -->
<div class="card">
    <div class="title">Demonstratie voor Eerlijke Lonen</div>
    <div class="date">15 januari 2025, 14:00</div>
    <div class="description">Protest tegen lage lonen in de zorg...</div>
    <div class="button">Doe mee</div>
</div>
```

## 🔄 Git Workflow

### Branch Strategy

```bash
# Main branches
main                    # Production-ready code
develop                 # Integration branch for features

# Feature branches
feature/user-profiles   # New functionality
bugfix/login-error     # Bug fixes
hotfix/security-patch  # Critical fixes
docs/api-documentation # Documentation updates
```

### Commit Messages

We gebruiken [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Examples
feat(auth): add Google OAuth integration
fix(map): resolve marker clustering issue
docs(api): update authentication endpoints
style(ui): improve button hover animations
refactor(firebase): extract auth service into separate module
test(actions): add unit tests for action creation
perf(map): optimize marker rendering for large datasets
```

### Types

- **feat**: Nieuwe feature
- **fix**: Bug fix
- **docs**: Documentatie wijzigingen
- **style**: Code formatting (geen functionaliteit wijziging)
- **refactor**: Code restructuring (geen nieuwe features of bug fixes)
- **test**: Tests toevoegen of wijzigen
- **perf**: Performance verbeteringen
- **build**: Build systeem wijzigingen
- **ci**: CI/CD configuratie
- **chore**: Onderhoud taken

## 🧪 Testing

### Unit Tests

```javascript
// test/utils/distance.test.js
import { calculateDistance } from '../../src/utils/geo.js';

describe('calculateDistance', () => {
    test('should calculate distance between Amsterdam and Rotterdam', () => {
        const amsterdam = { lat: 52.3676, lng: 4.9041 };
        const rotterdam = { lat: 51.9244, lng: 4.4777 };
        
        const distance = calculateDistance(
            amsterdam.lat, amsterdam.lng,
            rotterdam.lat, rotterdam.lng
        );
        
        expect(distance).toBeCloseTo(57.3, 1); // ~57.3 km
    });
    
    test('should return 0 for same coordinates', () => {
        const distance = calculateDistance(52.3676, 4.9041, 52.3676, 4.9041);
        expect(distance).toBe(0);
    });
});
```

### Integration Tests

```javascript
// test/integration/auth.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';
import { LoginForm } from '../../src/components/LoginForm.js';

describe('Login Integration', () => {
    test('should login user with valid credentials', async () => {
        render(LoginForm);
        
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Wachtwoord');
        const submitButton = screen.getByRole('button', { name: 'Inloggen' });
        
        fireEvent.change(emailInput, { target: { value: 'test@sp.nl' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText('Welkom terug!')).toBeInTheDocument();
        });
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.js

# Run integration tests
npm run test:integration
```

## 🐛 Bug Reports

### Template

```markdown
**Bug Beschrijving**
Korte beschrijving van het probleem.

**Reproductie Stappen**
1. Ga naar '...'
2. Klik op '....'
3. Scroll naar beneden '....'
4. Zie fout

**Verwacht Gedrag**
Wat er zou moeten gebeuren.

**Screenshots**
Voeg screenshots toe indien mogelijk.

**Omgeving:**
 - OS: [bijv. Windows 10, macOS 11.6]
 - Browser [bijv. Chrome 96, Firefox 95]
 - Versie [bijv. 1.2.3]
 - Device: [bijv. Desktop, iPhone 12, Samsung Galaxy]

**Aanvullende Context**
Andere relevante informatie.
```

## 💡 Feature Requests

### Template

```markdown
**Is your feature request related to a problem?**
Beschrijf het probleem dat je wilt oplossen.

**Describe the solution you'd like**
Duidelijke beschrijving van wat je wilt.

**Describe alternatives you've considered**
Alternatieve oplossingen die je hebt overwogen.

**Additional context**
Screenshots, mockups, of andere context.

**Impact Assessment**
- User benefit: High/Medium/Low
- Implementation complexity: High/Medium/Low  
- Breaking changes: Yes/No
```

## 🔍 Code Review Process

### Voor Reviewers

#### Checklist

- [ ] **Functionaliteit**: Werkt de code zoals verwacht?
- [ ] **Performance**: Zijn er performance problemen?
- [ ] **Security**: Zijn er beveiligingsrisico's?
- [ ] **Accessibility**: Is de code toegankelijk?
- [ ] **Tests**: Zijn er adequate tests?
- [ ] **Documentation**: Is de documentatie bijgewerkt?
- [ ] **Code Style**: Volgt de code onze standards?

#### Review Criteria

```markdown
**Approval Criteria:**
- ✅ Code compiles without warnings
- ✅ All tests pass
- ✅ No security vulnerabilities introduced
- ✅ Performance impact is acceptable
- ✅ Code follows project conventions
- ✅ Documentation is updated where needed

**Feedback Types:**
- **Must Fix**: Blocking issues that prevent merge
- **Should Fix**: Important improvements
- **Consider**: Suggestions for improvement
- **Nitpick**: Minor style/preference issues
```

### Voor Contributors

#### Preparing PR

```bash
# Before submitting PR:
# 1. Rebase on latest main
git fetch origin main
git rebase origin/main

# 2. Run tests
npm test

# 3. Lint code
npm run lint

# 4. Build successfully
npm run build

# 5. Self-review changes
git diff origin/main...HEAD
```

#### PR Template

```markdown
## Changes
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Description
Brief description of the changes.

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## Screenshots
Before/after screenshots for UI changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass locally
```

## 🔒 Security Guidelines

### Secure Coding Practices

```javascript
// ✅ Input validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
};

// ✅ Sanitize user input
const sanitizeInput = (input) => {
    return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .trim()
        .substring(0, 1000); // Limit length
};

// ✅ Secure API calls
const apiCall = async (endpoint, data) => {
    const token = await getAuthToken();
    
    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getCsrfToken()
        },
        body: JSON.stringify(data)
    });
};

// ❌ Never expose sensitive data
// Don't commit API keys, passwords, or tokens to git
```

### Privacy Considerations

- **Data Minimization**: Verzamel alleen noodzakelijke data
- **Consent**: Vraag expliciete toestemming voor data gebruik
- **Encryption**: Gebruik HTTPS en encrypt gevoelige data
- **Access Control**: Implementeer role-based access
- **Audit Logs**: Log belangrijke acties voor security monitoring

## 📱 Mobile & Accessibility

### PWA Standards

```javascript
// Service Worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('SW registered:', registration);
        })
        .catch(error => {
            console.log('SW registration failed:', error);
        });
}

// Responsive design testing
@media (max-width: 768px) {
    .action-card {
        padding: var(--space-sm);
        font-size: var(--text-sm);
    }
}
```

### Accessibility (A11Y)

```html
<!-- Semantic HTML -->
<button 
    aria-label="Aanmelden voor demonstratie op 15 januari"
    aria-describedby="action-description"
    class="btn btn-primary">
    Doe mee
</button>

<div id="action-description" class="sr-only">
    Deze actie vindt plaats in Amsterdam en duurt ongeveer 2 uur
</div>
```

```css
/* Screen reader only content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Focus indicators */
.btn:focus {
    outline: 2px solid var(--sp-red);
    outline-offset: 2px;
}
```

## 🌍 Internationalization

### Dutch First

SPnu! is primair Nederlands, maar we bereiden voor op uitbreiding:

```javascript
// i18n structure
const translations = {
    nl: {
        'action.join': 'Doe mee',
        'action.created': 'Actie aangemaakt',
        'user.welcome': 'Welkom, {name}!'
    },
    en: {
        'action.join': 'Join',
        'action.created': 'Action created',  
        'user.welcome': 'Welcome, {name}!'
    }
};

// Usage
const t = (key, params = {}) => {
    let text = translations[currentLang][key] || key;
    
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
};
```

## 🚀 Release Process

### Versioning

We gebruiken [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features, backward compatible (1.1.0)
- **PATCH**: Bug fixes, backward compatible (1.0.1)

### Release Checklist

```markdown
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Security scan completed
- [ ] Performance regression test passed
- [ ] Deployment tested on staging
- [ ] Rollback plan prepared
```

## 💬 Community

### Communication Channels

- **GitHub Issues**: Bug reports en feature requests
- **GitHub Discussions**: Algemene discussies
- **SP Nederland**: Politieke vragen via sp.nl
- **Email**: tech@spnu.nl voor gevoelige onderwerpen

### Code of Conduct

We volgen de [SP Nederland gedragscode](https://sp.nl/gedragscode):

- **Respectvol**: Behandel iedereen met respect
- **Inclusief**: Verwelkom alle achtergronden
- **Constructief**: Focus op oplossingen, niet problemen
- **Solidair**: Help elkaar groeien en leren

### Recognition

Contributors worden erkend in:

- README.md contributors sectie
- Release notes voor belangrijke bijdragen
- Jaarlijkse SP Tech awards
- Credits in de app "Over" sectie

---

**Klaar om te beginnen?**

1. 📋 [Bekijk open issues](https://github.com/jedixcom/SPnu/issues)
2. 🍴 Fork het project
3. 🌟 Maak je eerste contribution
4. 🎉 Word onderdeel van de beweging!

**Questions?** Open een [discussion](https://github.com/jedixcom/SPnu/discussions) of email naar tech@spnu.nl.