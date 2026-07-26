import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAATwn3EJL0G2FGZ7EYcskHs4_N1kEqNGY",
  authDomain: "credit-cardii.firebaseapp.com",
  projectId: "credit-cardii",
  storageBucket: "credit-cardii.firebasestorage.app",
  messagingSenderId: "704109725697",
  appId: "1:704109725697:web:953ecfef2e55fd0f241800",
  measurementId: "G-C7Q0VEN61Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;