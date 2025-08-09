import { db } from '../firebaseConfig.js';

/**
 * Adiciona um novo registro de manutenção para um veículo
 * @param {string} veiculoId - ID do veículo (UUID usado no doc de veículo)
 * @param {Object} manutencaoData - Dados da manutenção
 * @param {string} manutencaoData.nomeServico
 * @param {string} manutencaoData.descricao
 * @param {string} manutencaoData.data - formato ISO ('YYYY-MM-DD')
 * @param {number} manutencaoData.valor
 * @param {number} manutencaoData.quilometragem
 * @param {string} manutencaoData.fornecedorId
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const adicionarManutencao = async (veiculoId, manutencaoData) => {
  try {
    const docRef = db.collection('veiculos').doc(veiculoId).collection('manutencoes').doc(); // ID automático

    await docRef.set({
      ...manutencaoData,
      veiculoId,
      data: new Date(manutencaoData.data).toISOString(),
      dataCadastro: new Date().toISOString(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao adicionar manutenção:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Lista registros de manutenção de um veículo com paginação
 * @param {string} veiculoId - ID do veículo
 * @param {Object} [params]
 * @param {number} [params.limite=10]
 * @param {firebase.firestore.DocumentSnapshot} [params.ultimoDoc]
 * @returns {Promise<{manutencoes: Array<Object>, ultimoDoc: any}>}
 */
export const listarManutencoes = async (veiculoId, { limite = 10, ultimoDoc = null } = {}) => {
  try {
    let query = db
      .collection('veiculos')
      .doc(veiculoId)
      .collection('manutencoes')
      .orderBy('data', 'desc')
      .limit(limite);

    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();

    const manutencoes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      manutencoes,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Erro ao listar manutenções:', error);
    throw error;
  }
};
