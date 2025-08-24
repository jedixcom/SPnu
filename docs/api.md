# API Documentation - SPnu! Platform

## 📋 Overzicht

SPnu! Platform gebruikt Firebase als backend met Firestore voor data opslag en Authentication voor gebruikersbeheer. Deze documentatie beschrijft de beschikbare API endpoints en data structuren.

## 🔐 Authenticatie

### Firebase Authentication

SPnu! gebruikt Firebase Authentication voor veilige gebruikersauthenticatie.

#### Ondersteunde Providers
- **Email/Password**: Standaard registratie
- **Google**: OAuth2 integratie (toekomstig)
- **Facebook**: Sociale login (toekomstig)

#### Auth Flow

```javascript
// Registratie
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// Login
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Logout
await signOut(auth);

// Auth state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Gebruiker is ingelogd
        console.log('User:', user.uid);
    } else {
        // Gebruiker is uitgelogd
        console.log('User signed out');
    }
});
```

### API Authenticatie

Alle API calls vereisen een geldig Firebase ID token:

```javascript
// Get current user token
const user = auth.currentUser;
if (user) {
    const token = await user.getIdToken();
    // Gebruik token in API calls
}
```

## 📊 Data Structuren

### User Profile

```javascript
// /users/{userId}
{
    "uid": "string",
    "email": "string",
    "displayName": "string",
    "photoURL": "string?",
    "bio": "string?",
    "location": {
        "city": "string",
        "province": "string",
        "country": "string",
        "coordinates": GeoPoint
    },
    "spMember": {
        "isMember": boolean,
        "memberNumber": "string?",
        "memberSince": Timestamp?,
        "localChapter": "string?"
    },
    "preferences": {
        "notifications": {
            "email": boolean,
            "push": boolean,
            "sms": boolean
        },
        "privacy": {
            "profileVisibility": "public" | "members" | "local" | "private",
            "showLocation": boolean,
            "showEmail": boolean
        }
    },
    "stats": {
        "actionsCreated": number,
        "actionsJoined": number,
        "groupsJoined": number,
        "reputation": number
    },
    "createdAt": Timestamp,
    "lastActive": Timestamp
}
```

### Action/Event

```javascript
// /actions/{actionId}
{
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "demonstration" | "petition" | "neighborhood" | "campaign" | "event",
    "status": "planned" | "active" | "completed" | "cancelled",
    "creator": {
        "uid": "string",
        "displayName": "string",
        "photoURL": "string?"
    },
    "organizers": [
        {
            "uid": "string",
            "role": "organizer" | "coordinator" | "volunteer",
            "permissions": ["edit", "invite", "moderate"]
        }
    ],
    "datetime": {
        "start": Timestamp,
        "end": Timestamp?,
        "timezone": "string"
    },
    "location": {
        "name": "string",
        "address": "string",
        "city": "string",
        "coordinates": GeoPoint,
        "meetingPoint": "string?"
    },
    "participants": {
        "registered": number,
        "checkedIn": number,
        "capacity": number?
    },
    "requirements": {
        "minAge": number?,
        "spMemberOnly": boolean,
        "requiresApproval": boolean
    },
    "content": {
        "images": ["string"],
        "documents": ["string"],
        "links": ["string"],
        "hashtags": ["string"]
    },
    "visibility": "public" | "members" | "local" | "private",
    "tags": ["string"],
    "createdAt": Timestamp,
    "updatedAt": Timestamp
}
```

### Group

```javascript
// /groups/{groupId}
{
    "id": "string",
    "name": "string",
    "description": "string",
    "type": "chapter" | "youth" | "thematic" | "working",
    "status": "active" | "inactive" | "archived",
    "location": {
        "city": "string",
        "province": "string",
        "region": "string",
        "coordinates": GeoPoint
    },
    "admins": ["string"],
    "moderators": ["string"],
    "members": {
        "total": number,
        "active": number,
        "pending": number
    },
    "settings": {
        "public": boolean,
        "requireApproval": boolean,
        "spMemberOnly": boolean,
        "allowEvents": boolean
    },
    "stats": {
        "actionsOrganized": number,
        "membersJoined": number,
        "lastActivity": Timestamp
    },
    "contact": {
        "email": "string?",
        "phone": "string?",
        "website": "string?",
        "socialMedia": {
            "facebook": "string?",
            "twitter": "string?",
            "instagram": "string?"
        }
    },
    "createdAt": Timestamp,
    "updatedAt": Timestamp
}
```

### Message

```javascript
// /chats/{chatId}/messages/{messageId}
{
    "id": "string",
    "chatId": "string",
    "sender": {
        "uid": "string",
        "displayName": "string",
        "photoURL": "string?"
    },
    "content": {
        "text": "string?",
        "images": ["string"]?,
        "documents": ["string"]?,
        "location": GeoPoint?
    },
    "type": "text" | "image" | "document" | "location" | "system",
    "replyTo": "string?",
    "reactions": {
        "👍": ["string"],
        "❤️": ["string"],
        "👎": ["string"]
    },
    "edited": boolean,
    "timestamp": Timestamp,
    "readBy": ["string"]
}
```

## 🛠️ Firestore Operations

### Users

#### Get User Profile
```javascript
const getUserProfile = async (userId) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        throw new Error('User not found');
    }
};
```

#### Update User Profile
```javascript
const updateUserProfile = async (userId, updates) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
};
```

#### Create User Profile
```javascript
const createUserProfile = async (userId, profileData) => {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
        uid: userId,
        ...profileData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
    });
};
```

### Actions

#### Create Action
```javascript
const createAction = async (actionData) => {
    const actionsRef = collection(db, 'actions');
    const docRef = await addDoc(actionsRef, {
        ...actionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
};
```

#### Get Actions
```javascript
// Get all public actions
const getPublicActions = async () => {
    const q = query(
        collection(db, 'actions'),
        where('visibility', '==', 'public'),
        where('status', 'in', ['planned', 'active']),
        orderBy('datetime.start')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// Get actions by location
const getActionsByLocation = async (centerLat, centerLng, radiusKm) => {
    // Firebase doesn't support radius queries directly
    // Use geohash or approximate with lat/lng bounds
    const latDelta = radiusKm / 111; // Rough conversion
    const lngDelta = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));
    
    const q = query(
        collection(db, 'actions'),
        where('location.coordinates.latitude', '>=', centerLat - latDelta),
        where('location.coordinates.latitude', '<=', centerLat + latDelta)
    );
    
    const querySnapshot = await getDocs(q);
    // Filter by longitude and exact distance in client
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(action => {
            const actionLat = action.location.coordinates.latitude;
            const actionLng = action.location.coordinates.longitude;
            const distance = calculateDistance(centerLat, centerLng, actionLat, actionLng);
            return distance <= radiusKm;
        });
};
```

#### Join Action
```javascript
const joinAction = async (actionId, userId) => {
    const actionRef = doc(db, 'actions', actionId);
    const participantRef = doc(db, 'actions', actionId, 'participants', userId);
    
    // Use transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
        const actionDoc = await transaction.get(actionRef);
        
        if (!actionDoc.exists()) {
            throw new Error('Action does not exist');
        }
        
        // Add participant
        transaction.set(participantRef, {
            uid: userId,
            joinedAt: serverTimestamp(),
            status: 'registered'
        });
        
        // Update participant count
        transaction.update(actionRef, {
            'participants.registered': increment(1),
            updatedAt: serverTimestamp()
        });
    });
};
```

### Groups

#### Get Groups by Location
```javascript
const getLocalGroups = async (userLocation) => {
    const q = query(
        collection(db, 'groups'),
        where('status', '==', 'active'),
        where('location.province', '==', userLocation.province)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};
```

#### Join Group
```javascript
const requestGroupMembership = async (groupId, userId) => {
    const requestRef = doc(db, 'groups', groupId, 'membershipRequests', userId);
    
    await setDoc(requestRef, {
        uid: userId,
        status: 'pending',
        requestedAt: serverTimestamp()
    });
};
```

### Real-time Subscriptions

#### Listen to Action Updates
```javascript
const subscribeToAction = (actionId, callback) => {
    const actionRef = doc(db, 'actions', actionId);
    
    return onSnapshot(actionRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        }
    });
};
```

#### Listen to Chat Messages
```javascript
const subscribeToChatMessages = (chatId, callback) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));
    
    return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    });
};
```

## 🔍 Search & Filtering

### Full Text Search
Firebase doesn't support full-text search natively. Consider using:

#### Algolia Integration (Recommended)
```javascript
// Initialize Algolia
import algoliasearch from 'algoliasearch';
const client = algoliasearch('APP_ID', 'SEARCH_KEY');
const index = client.initIndex('actions');

// Search actions
const searchActions = async (query, filters = {}) => {
    const searchParams = {
        query,
        filters: Object.entries(filters)
            .map(([key, value]) => `${key}:${value}`)
            .join(' AND ')
    };
    
    const { hits } = await index.search(searchParams);
    return hits;
};
```

#### Client-side Filtering
```javascript
const filterActions = (actions, filters) => {
    return actions.filter(action => {
        // Date filter
        if (filters.dateRange) {
            const actionDate = action.datetime.start.toDate();
            if (actionDate < filters.dateRange.start || actionDate > filters.dateRange.end) {
                return false;
            }
        }
        
        // Type filter
        if (filters.type && action.type !== filters.type) {
            return false;
        }
        
        // Location filter (rough distance)
        if (filters.location && filters.radius) {
            const distance = calculateDistance(
                filters.location.lat, filters.location.lng,
                action.location.coordinates.latitude, action.location.coordinates.longitude
            );
            if (distance > filters.radius) {
                return false;
            }
        }
        
        return true;
    });
};
```

## 📱 Push Notifications

### FCM Setup
```javascript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const messaging = getMessaging();

// Get registration token
const getNotificationToken = async () => {
    try {
        const token = await getToken(messaging, {
            vapidKey: 'YOUR_VAPID_KEY'
        });
        return token;
    } catch (error) {
        console.error('Error getting token:', error);
    }
};

// Listen for foreground messages
onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    // Show notification to user
});
```

### Send Notifications (Server-side)
```javascript
// Using Firebase Admin SDK
const admin = require('firebase-admin');

const sendNotificationToUser = async (userToken, notification) => {
    const message = {
        notification: {
            title: notification.title,
            body: notification.body,
            icon: '/images/SPnu_icon.png'
        },
        data: notification.data,
        token: userToken
    };
    
    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};
```

## 🔒 Security Rules

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && resource.data.privacy.profileVisibility == 'public';
    }
    
    // Actions
    match /actions/{actionId} {
      allow read: if request.auth != null && 
                     (resource.data.visibility == 'public' || 
                      resource.data.visibility == 'members');
      allow write: if request.auth != null && 
                      (request.auth.uid == resource.data.creator.uid ||
                       request.auth.uid in resource.data.organizers[].uid);
      allow create: if request.auth != null;
    }
    
    // Groups
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid in resource.data.admins;
    }
    
    // Messages (only for chat participants)
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}
```

## 📊 Analytics & Metrics

### Custom Analytics Events
```javascript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

// Track action creation
const trackActionCreated = (actionType, actionId) => {
    logEvent(analytics, 'action_created', {
        action_type: actionType,
        action_id: actionId
    });
};

// Track user engagement
const trackPageView = (pageName) => {
    logEvent(analytics, 'page_view', {
        page_title: pageName,
        page_location: window.location.href
    });
};
```

## 🚨 Error Handling

### Common Error Patterns
```javascript
const handleFirebaseError = (error) => {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'Gebruiker niet gevonden';
        case 'auth/wrong-password':
            return 'Onjuist wachtwoord';
        case 'auth/email-already-in-use':
            return 'Email adres is al in gebruik';
        case 'permission-denied':
            return 'Geen toegang tot deze data';
        case 'not-found':
            return 'Document niet gevonden';
        default:
            console.error('Firebase error:', error);
            return 'Er is een onbekende fout opgetreden';
    }
};

// Usage
try {
    await createAction(actionData);
} catch (error) {
    const userMessage = handleFirebaseError(error);
    showErrorToUser(userMessage);
}
```

## 📈 Performance Optimization

### Pagination
```javascript
const getActionsPaginated = async (lastDoc = null, limit = 20) => {
    let q = query(
        collection(db, 'actions'),
        where('visibility', '==', 'public'),
        orderBy('datetime.start'),
        limit(limit)
    );
    
    if (lastDoc) {
        q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const actions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    return {
        actions,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === limit
    };
};
```

### Caching
```javascript
// Cache frequently accessed data
const cache = new Map();

const getCachedUserProfile = async (userId, maxAge = 5 * 60 * 1000) => {
    const cacheKey = `user_${userId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < maxAge) {
        return cached.data;
    }
    
    const userProfile = await getUserProfile(userId);
    cache.set(cacheKey, {
        data: userProfile,
        timestamp: Date.now()
    });
    
    return userProfile;
};
```

---

**Volgende stap**: [Deployment Guide](deployment.md) voor productie setup.