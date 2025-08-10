import { db } from '../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @param {Object} servicoAdicionalData - Dados do serviço adicional
 * @param {string} servicoAdicionalData.chassiVeiculo - Chassi do veículo
 * @param {string} servicoAdicionalData.nome - Nome do serviço adicional
 * @param {string} servicoAdicionalData.data - Data de cadastro do serviço (formato: 'YYYY-MM-DD')
 * @param {number} servicoAdicionalData.valor - Valor do serviço
 * @returns {Promise<{success: boolean, error?: string}>}
 * @throws {Error} Em caso de erro no Firestore
 */
export const criarServicoAdicional = async (servicoAdicionalData) => {
  try {
    const { chassiVeiculo, nome, data, valor } = servicoAdicionalData;

    const id = uuidv4();

    // 1. Documento principal na coleção "servicosAdicionais"
    await db.collection('servicosAdicionais').doc(id).set({
      id: id,
      chassiVeiculo: chassiVeiculo,
      nome: nome,
      data: data,
      valor: valor,
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao criar serviço adicional:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Lista serviços adicionais com paginação e filtros
 * @param {Object} params
 * @param {number} [params.limite=10] - Número máximo de resultados
 * @param {firebase.firestore.DocumentSnapshot} [params.ultimoDoc] - Último documento da página anterior (para startAfter)
 * @param {Object} [params.filtros] - Filtros de busca
 * @param {string} [params.filtros.chassiVeiculo] - Filtro por placa de veículo
 * @param {string} [params.filtros.nome] - Filtro por nome do serviço
 * @param {string} [params.filtros.data] - Filtro por data do serviço
 * @param {string} [params.filtros.valor] - Filtro por valor do serviço
 * @returns {Promise<{servicosAdicionais: Array<Object>, ultimoDoc: firebase.firestore.DocumentSnapshot|null}>}
 * @throws {Error} Em caso de erro no Firestore
 */
export const listarServicosAdicionais = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  try {
    let query = db.collection('servicosAdicionais').orderBy('id').limit(limite);

    //Aplicar filtros
    if (filtros.chassiVeiculo) {
      query = query.where('chassiVeiculo', '==', filtros.chassiVeiculo);
    }

    if (filtros.nome) {
      query = query.where('nome', '==', filtros.nome);
    }

    if (filtros.data) {
      query = query.where('data', '==', filtros.data);
    }

    if (filtros.valor) {
      query = query.where('valor', '==', filtros.valor);
    }

    // Paginação
    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();
    const servicosAdicionais = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return {
      servicosAdicionais,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Erro ao listar servicos adicionais:', error);
    throw error;
  }
};
