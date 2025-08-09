import admin from 'firebase-admin';

// Inicialize o Firebase Admin SDK se ainda não estiver inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export { db };
