// Replace with your Firebase config
const firebaseConfig = {
apiKey: "AIzaSyANa0kvCZcmiai6wbsgRWMTkHln09i7PcQ",
authDomain: "spnu-nl.firebaseapp.com",
projectId: "spnu-nl",
storageBucket: "spnu-nl.firebasestorage.app",
messagingSenderId: "817817458296",
appId: "1:817817458296:web:a5faf87e37c033ef55ff8d"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);