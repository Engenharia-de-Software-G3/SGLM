import { db } from '../../firebaseConfig.js';

export const verificarDocumentoExistente = async (tipo, valor) => {
  const snapshot = await db
    .collection('clientes')
    .where(tipo === 'CPF' ? 'cpf' : 'cnpj', '==', valor)
    .get();
  return !snapshot.empty;
};

export const formatarDataFirestore = (dataString) => {
  return new Date(dataString).toISOString();
};
