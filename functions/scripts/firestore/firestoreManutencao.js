import { db } from '../../firebaseConfig.js';
import {v4 as uuidv4} from "uuid";

/**
 * Adiciona um novo registro de manutenção para um veículo
 * @param {string} veiculoId - ID do veículo (UUID usado no doc de veículo)
 * @param {Object} manutencaoData - Dados da manutenção
 * @param {string} manutencaoData.nomeServico
 * @param {string} manutencaoData.data - formato ISO ('YYYY-MM-DD')
 * @param {number} manutencaoData.valor
 * @param {number} manutencaoData.quilometragem
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const adicionarManutencao = async (manutencaoData) => {
  try {
    const {placaVeiculo, nomeServico, valor} = manutencaoData;

    // 1. Validar veículo
    const placaFormatada = placaVeiculo.replace(/-/g, '');
    const veiculosSnapshot = await db
        .collection('veiculos')
        .where('placa', '==', placaFormatada)
        .limit(1)
        .get();

    if (veiculosSnapshot.empty) {
      throw new Error('Veículo não encontrado');
    }

    const veiculoDoc = veiculosSnapshot.docs[0];
    const veiculoData = veiculoDoc.data();

    // 2. Criar ID da manutenção
    const id = uuidv4();

    // 3. Criar documento de manutenção
    await db
        .collection('manutencoes')
        .doc(id)
        .set({
          id,
          nomeServico: nomeServico,
          placaVeiculo: placaFormatada,
          valor: Number(valor),
          quilometragem: veiculoData.quilometragem,
          data: new Date().toISOString()
        });

    // 4. Atualizar status do veículo
    await veiculoDoc.ref.update({
      status: 'manutencao',
      dataAtualizacao: new Date().toISOString(),
    });


    return { success: true, id};
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
export const listarManutencoes = async ({ limite = 10, ultimoDoc = null } = {}) => {
  try {
    let query = db
      .collection('manutencoes')
      .orderBy('data', 'desc')
      .limit(limite);

    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();

    const manutencoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      manutencoes
    };
  } catch (error) {
    console.error('Erro ao listar manutenções:', error);
    throw error;
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
export const listarManutencao = async (veiculoId, { limite = 10, ultimoDoc = null } = {}) => {
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

    const manutencoes = snapshot.docs.map(doc => ({
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

/**
 * Deleta uma manutenção e suas subcoleções associadas do Firestore.
 * @param {string} id - id da manutenção a ser deletada.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deletarManutencao = async (id) => {
  try {
    const manutencaoRef = db.collection('manutencoes').doc(id);

    // Verifica se a manutenção existe
    const doc = await manutencaoRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Manutenção não encontrada.' };
    }

    // Deleta o documento principal da manutenção
    await manutencaoRef.delete();

    return { success: true };
  } catch (error) {
    console.error(`Erro ao deletar manutenção ${id}:`, error);
    return { success: false, error: error.message };
  }
};
