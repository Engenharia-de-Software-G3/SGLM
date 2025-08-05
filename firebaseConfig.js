// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import admin from 'firebase-admin';
//import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAMe9iUIIGMj2SC_zFWQ-HnnrXEcOogrqg',
  authDomain: 'slmg-es.firebaseapp.com',
  projectId: 'slmg-es',
  storageBucket: 'slmg-es.firebasestorage.app',
  messagingSenderId: '1064863338708',
  appId: '1:1064863338708:web:aeb3b3dfff9bee83ee6b41',
  measurementId: 'G-B2D95MWEJD',
};

// Inicialize o Firebase Admin SDK se ainda não estiver inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = admin.firestore();
//const analytics = getAnalytics(app);

export { app, db };
