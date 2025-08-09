import { db } from '../../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Cadastrar uma nova vistoria no Firestore
 * @param {Object} vistoriaData - Dados da vistoria
 * @param {string} vistoriaData.chassiVeiculo - Chassi do veículo
 * @param {string} vistoriaData.placaVeiculo - Placa do veículo
 * @param {string} vistoriaData.nomeEmpresa - Nome da empresa da vistoria
 * @param {string} vistoriaData.nomeFuncionario - Nome do funcionário responsável pela vistoria
 * @param {number} vistoriaData.quilometragem - Quilometragem do veículo no momento da vistoria
 * @param {string} vistoriaData.data - Data da vistoria do veículo (formato: 'YYYY-MM-DD')
 * @returns {Promise<{success: boolean, error?: string}>}
 * @throws {Error} Em caso de erro no Firestore
 */
export const criarVistoria = async (vistoriaData) => {
  try {
    const id = uuidv4();
    const { chassiVeiculo, placaVeiculo, nomeEmpresa, nomeFuncionario, quilometragem, data } =
      vistoriaData;

    if (!placaVeiculo || !chassiVeiculo || !nomeEmpresa || isNaN(quilometragem) || !data) {
      return { success: false, error: 'Dados da vistoria inválidos.' };
    }

    // 1. Criar documento com estrutura completa
    await db
      .collection('vistorias')
      .doc(id)
      .set({
        // Identificação
        id,
        chassi: chassiVeiculo,
        placa: placaVeiculo.replace(/-/g, ''), // Formato sem hífen
        nomeEmpresa: nomeEmpresa,
        nomeFuncionario: nomeFuncionario,
        quilometragem: quilometragem,
        data: data,
      });

    return { success: true };
  } catch (error) {
    console.error('Erro ao criar vistoria:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listar vistorias por veículo
 * @param {Object} params
 * @param {number} [params.limite=10] - Número máximo de resultados
 * @param {firebase.firestore.DocumentSnapshot} [params.ultimoDoc] - Último documento da página anterior (para startAfter)
 * @param {Object} [params.filtros] - Filtros de busca
 * @param {string} [params.filtros.chassi] - Filtro por chassi (filtragem inicial)
 * @returns {Promise<{success: true, vistorias: Array<Object>, ultimoDoc: firebase.firestore.DocumentSnapshot|null} | {success: false, error: string}>}
 * @throws {Error} Em caso de erro no Firestore
 */
export const listarVistoriasVeiculo = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  try {
    let query = db.collection('vistorias');

    if (filtros.chassi) {
      const chassi = filtros.chassi;
      query = query.where('chassi', '==', chassi);
    }

    // Paginação eficiente
    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();
    const vistorias = snapshot.docs.map((doc) => doc.data());

    return {
      success: true,
      vistorias,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Erro ao listar vistorias:', error);
    return { success: false, error: error.message };
  }
};
