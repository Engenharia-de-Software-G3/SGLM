import { db } from '../../../firebaseConfig.js';

// Validar CPF/CNPJ duplicado
export const verificarDocumentoExistente = async (tipo, valor) => {
  const snapshot = await db
    .collection('clientes')
    .where(tipo === 'CPF' ? 'cpf' : 'cnpj', '==', valor)
    .get();
  return !snapshot.empty;
};

// Formatar dados para o Firestore
export const formatarDataFirestore = (dataString) => {
  return new Date(dataString).toISOString();
};
