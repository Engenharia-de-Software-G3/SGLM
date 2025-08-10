// Import Firebase Admin SDK for Cloud Functions
import admin from 'firebase-admin';

// Inicialize o Firebase Admin SDK se ainda não estiver inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Get Firestore instance
const db = admin.firestore();

export { db };
