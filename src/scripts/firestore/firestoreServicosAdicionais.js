// src/scripts/firestore/firestoreServicosAdicionais.js
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import app from '../../../firebaseConfig';

const db = getFirestore(app);

// Adicionar um serviço
export async function adicionarServicoAdicional(dadosServico) {
  await addDoc(collection(db, 'servicosAdicionais'), dadosServico);
}

// Listar servicos
export async function listarServicos() {
  const querySnapshot = await getDocs(collection(db, 'servicosAdicionais'));
  const lista = [];
  querySnapshot.forEach((doc) => {
    lista.push({ id: doc.id, ...doc.data() });
  });
  return lista;
}
