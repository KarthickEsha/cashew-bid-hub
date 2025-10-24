import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: "AIzaSyCioSkmiej6_C4veGC4sgBuSd07ACdq40o",
  authDomain: "cashew-marketplace.firebaseapp.com",
  projectId: "cashew-marketplace",
  storageBucket: "cashew-marketplace.firebasestorage.app",
  messagingSenderId: "221424155521",
  appId: "1:221424155521:web:38a2b75c7a6136f4958680",
  measurementId: "G-GQP6XYJ1TF"
};

export const app = initializeApp(firebaseConfig);

export const messagingPromise: Promise<Messaging | null> = isSupported().then((supported) =>
  supported ? getMessaging(app) : null
);
