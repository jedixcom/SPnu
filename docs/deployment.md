# Deployment Guide - SPnu! Platform

## 🎯 Overzicht

SPnu! Platform draait op Firebase Hosting met Firestore als database en Firebase Authentication voor gebruikersbeheer. Deze guide beschrijft het complete deployment proces van development naar production.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   Firebase      │    │   Firebase      │
│   Hosting       │    │   Firestore     │    │   Auth          │
│   (Frontend)    │    │   (Database)    │    │   (Users)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐     │     ┌─────────────────┐
         │   Firebase      │     │     │   External      │
         │   Functions     │     │     │   Services      │
         │   (API Logic)   │     │     │   (Maps, etc)   │
         └─────────────────┘     │     └─────────────────┘
                                 │
                 ┌─────────────────┐
                 │   CDN & Cache   │
                 │   (Global)      │
                 └─────────────────┘
```

## 🛠️ Prerequisites

### Development Tools

```bash
# Node.js & npm
node --version  # 18.0.0+
npm --version   # 9.0.0+

# Firebase CLI
npm install -g firebase-tools
firebase --version  # 12.0.0+

# Git
git --version  # 2.34.0+
```

### Accounts & Access

- **Firebase Project**: Access tot spnu-nl project
- **Google Cloud**: Voor advanced features
- **Domain**: spnu.nl DNS management
- **Monitoring**: Error tracking en analytics

## 🔧 Environment Setup

### 1. Firebase Configuration

```bash
# Login to Firebase
firebase login

# Select project
firebase use spnu-nl

# Verify configuration
firebase projects:list
```

### 2. Environment Variables

Maak `.env` bestanden voor verschillende environments:

#### `.env.development`
```env
# Firebase Development
FIREBASE_API_KEY=AIzaSyDevelopmentKeyHere
FIREBASE_AUTH_DOMAIN=spnu-nl-dev.firebaseapp.com
FIREBASE_PROJECT_ID=spnu-nl-dev
FIREBASE_STORAGE_BUCKET=spnu-nl-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Development settings
NODE_ENV=development
DEBUG_MODE=true
LOG_LEVEL=debug
API_BASE_URL=http://localhost:5000
```

#### `.env.production`
```env
# Firebase Production
FIREBASE_API_KEY=AIzaSyProductionKeyHere
FIREBASE_AUTH_DOMAIN=spnu-nl.firebaseapp.com
FIREBASE_PROJECT_ID=spnu-nl
FIREBASE_STORAGE_BUCKET=spnu-nl.appspot.com
FIREBASE_MESSAGING_SENDER_ID=987654321
FIREBASE_APP_ID=1:987654321:web:fedcba654321

# Production settings
NODE_ENV=production
DEBUG_MODE=false
LOG_LEVEL=error
API_BASE_URL=https://spnu.nl
```

### 3. Build Configuration

#### `firebase.json`
```json
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "**/*.md",
      "**/src/**",
      "**/tests/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ],
    "runtime": "nodejs18"
  }
}
```

## 🚀 Deployment Environments

### Development Environment

Voor lokale development en testing:

```bash
# Start local development
cd public
npm install
npm run dev

# Or use Firebase emulators
firebase emulators:start --only hosting,firestore,auth
```

**URL**: http://localhost:5000

### Staging Environment  

Voor pre-production testing:

```bash
# Deploy to staging channel
firebase hosting:channel:deploy staging --expires 7d

# Custom staging with specific features
firebase hosting:channel:deploy feature-auth --expires 3d
```

**URL**: https://spnu-nl--staging-xyz123.web.app

### Production Environment

Live platform voor gebruikers:

```bash
# Production deployment
firebase deploy --only hosting

# With functions
firebase deploy --only hosting,functions

# Complete deployment
firebase deploy
```

**URL**: https://spnu.nl

## 📦 Build Process

### 1. Pre-build Checks

```bash
#!/bin/bash
# pre-deploy.sh

echo "🔍 Running pre-deployment checks..."

# Check Node.js version
node_version=$(node --version)
echo "Node.js version: $node_version"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm test

# Lint code
echo "🔍 Linting code..."
npm run lint

# Build project
echo "🏗️ Building project..."
npm run build

# Security audit
echo "🔒 Security audit..."
npm audit --audit-level moderate

echo "✅ Pre-deployment checks completed!"
```

### 2. Build Scripts

#### `package.json`
```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "npm run build:prod",
    "build:dev": "webpack --mode development",
    "build:prod": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src/ --ext .js",
    "lint:fix": "eslint src/ --ext .js --fix",
    "audit": "npm audit --audit-level moderate",
    "analyze": "webpack-bundle-analyzer dist/bundle.js"
  }
}
```

### 3. Webpack Configuration

#### `webpack.config.js`
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/app.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          }
        }
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: isProduction
      }),
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css'
      })
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        }
      ]
    }
  };
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions

#### `.github/workflows/deploy.yml`
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: public/package-lock.json
    
    - name: Install dependencies
      run: |
        cd public
        npm ci
    
    - name: Run tests
      run: |
        cd public
        npm test
    
    - name: Lint code
      run: |
        cd public
        npm run lint
    
    - name: Build project
      run: |
        cd public
        npm run build
    
    - name: Security audit
      run: |
        cd public
        npm audit --audit-level moderate

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: public/package-lock.json
    
    - name: Install dependencies and build
      run: |
        cd public
        npm ci
        npm run build
    
    - name: Deploy to Firebase staging
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_SPNU_NL }}'
        projectId: spnu-nl
        expires: 7d

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: public/package-lock.json
    
    - name: Install dependencies and build
      run: |
        cd public
        npm ci
        npm run build:prod
    
    - name: Deploy to Firebase production
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_SPNU_NL }}'
        projectId: spnu-nl
        channelId: live
```

## 🔒 Security & Performance

### Security Headers

```javascript
// firebase.json hosting headers
{
  "source": "**",
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options", 
      "value": "DENY"
    },
    {
      "key": "X-XSS-Protection",
      "value": "1; mode=block"
    },
    {
      "key": "Strict-Transport-Security",
      "value": "max-age=31536000; includeSubDomains"
    },
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com;"
    }
  ]
}
```

### Performance Optimization

```javascript
// Service Worker for caching
// public/sw.js
const CACHE_NAME = 'spnu-v1.0.0';
const urlsToCache = [
  '/',
  '/landing-style.css',
  '/app.js',
  '/images/SPnu_Socialistische_Partij_Logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

## 📊 Monitoring & Analytics

### Firebase Performance

```javascript
// Initialize Performance Monitoring
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);

// Custom traces
const trace = perf.trace('page_load');
trace.start();
// ... load page content
trace.stop();
```

### Error Tracking

```javascript
// Error reporting
window.addEventListener('error', (error) => {
  console.error('Global error:', error);
  
  // Send to monitoring service
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: error.message,
      stack: error.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  });
});
```

### Health Checks

```javascript
// Health check endpoint
// functions/index.js
exports.health = functions.https.onRequest((req, res) => {
  const checks = {
    firebase: true,
    database: true,
    auth: true,
    storage: true
  };
  
  // Perform actual health checks
  
  const isHealthy = Object.values(checks).every(check => check);
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
});
```

## 🔄 Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous version
firebase hosting:clone spnu-nl:live spnu-nl:previous

# Or deploy specific version
firebase deploy --only hosting --message "Rollback to v1.2.3"
```

### Database Rollback

```bash
# Export current state (backup)
gcloud firestore export gs://spnu-nl-backups/$(date +%Y%m%d_%H%M%S)

# Restore from backup
gcloud firestore import gs://spnu-nl-backups/20250115_143000
```

## 📝 Deployment Checklist

### Pre-deployment

- [ ] All tests pass locally and in CI
- [ ] Code review completed and approved
- [ ] Security audit shows no critical issues
- [ ] Performance tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Database migrations prepared (if needed)

### During Deployment

- [ ] Monitor deployment progress
- [ ] Check health endpoints
- [ ] Verify SSL certificates
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check performance metrics

### Post-deployment

- [ ] Smoke tests pass
- [ ] Analytics tracking works
- [ ] Error monitoring active
- [ ] Performance within acceptable range
- [ ] User feedback channels monitored
- [ ] Rollback plan ready if needed

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
nvm use 18
```

#### Deployment Timeouts
```bash
# Increase timeout
firebase deploy --timeout 600s

# Deploy incrementally
firebase deploy --only hosting
firebase deploy --only functions
```

#### SSL Certificate Issues
```bash
# Check certificate status
firebase hosting:channel:list

# Force SSL renewal
firebase hosting:channel:deploy live --only=ssl
```

### Logs & Debugging

```bash
# View deployment logs
firebase hosting:logs

# Function logs
firebase functions:log

# Real-time logs
firebase functions:log --follow
```

## 📞 Support Contacts

### Emergency Contacts

- **Lead Developer**: tech-lead@spnu.nl
- **DevOps**: devops@spnu.nl  
- **Security**: security@spnu.nl
- **SP Nederland IT**: it@sp.nl

### Service Status

- **Firebase Status**: https://status.firebase.google.com/
- **Google Cloud Status**: https://status.cloud.google.com/
- **SPnu Status**: https://status.spnu.nl (future)

---

**Deployment succesvol?** 🎉

Verifieer op:
- [SPnu.nl](https://spnu.nl) - Production
- [Firebase Console](https://console.firebase.google.com/project/spnu-nl) - Monitoring
- [Analytics Dashboard](https://analytics.google.com) - Usage data