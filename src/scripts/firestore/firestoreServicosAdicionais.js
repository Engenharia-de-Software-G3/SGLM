// src/scripts/firestore/firestoreServicosAdicionais.js
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import db from '../../../firebaseConfig.js';
import app from '../../../firebaseConfig.js';

export async function adicionarServicoAdicional(dadosServico) {
  // Use db.collection().add() do Admin SDK
  await db.collection('servicosAdicionais').add(dadosServico);
}

// Listar servicos
export async function listarServicos() {
  const querySnapshot = await db.collection('servicosAdicionais').get();
  const lista = [];
  querySnapshot.forEach((doc) => {
    lista.push({ id: doc.id, ...doc.data() });
  });
  return lista;
}
