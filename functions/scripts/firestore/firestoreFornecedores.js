import { db } from '../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Cadastra um novo fornecedor no Firestore
 * @param {Object} fornecedorData - Dados do fornecedor
 * @param {string} fornecedorData.nome - Nome do fornecedor
 * @param {string} fornecedorData.cnpj - CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 * @param {Array<string>} fornecedorData.servicos - Lista de serviços oferecidos
 * @param {Object} fornecedorData.contato - Informações de contato
 * @param {Object} fornecedorData.endereco - Endereço principal
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const criarFornecedor = async (fornecedorData) => {
  try {
    const id = uuidv4();
    const { cnpj } = fornecedorData;

    // Validar CNPJ único
    const cnpjExistente = await db
      .collection('fornecedores')
      .where('cnpj', '==', cnpj)
      .limit(1)
      .get();

    if (!cnpjExistente.empty) {
      throw new Error('CNPJ já cadastrado no sistema.');
    }

    // Criar documento principal
    await db.collection('fornecedores').doc(id).set({
      id,
      nome: fornecedorData.nome,
      cnpj,
      tipo: 'PJ',
      status: 'ativo',
      dataCadastro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    });

    // Subcoleções em batch
    const batch = db.batch();
    const fornecedorRef = db.collection('fornecedores').doc(id);

    // Serviços (como subcoleção)
    fornecedorData.servicos.forEach((servico) => {
      const servicoRef = fornecedorRef.collection('servicos').doc(uuidv4());
      batch.set(servicoRef, {
        nome: servico,
        dataCadastro: new Date().toISOString(),
      });
    });

    // Contato principal
    if (fornecedorData.contato) {
      batch.set(fornecedorRef.collection('contatos').doc('principal'), {
        ...fornecedorData.contato,
        isPrincipal: true,
      });
    }

    // Endereço principal
    if (fornecedorData.endereco) {
      batch.set(fornecedorRef.collection('enderecos').doc('principal'), {
        ...fornecedorData.endereco,
        isPrincipal: true,
      });
    }

    await batch.commit();
    return { success: true, id };
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Lista fornecedores com paginação
 * @param {Object} params
 * @param {number} params.limite - Número de resultados por página
 * @param {Object|null} params.ultimoDoc - Último documento da página anterior
 * @param {Object} params.filtros - Filtros de busca
 * @returns {Promise<{fornecedores: Array<Object>, ultimoDoc: Object|null}>}
 */
export const listarFornecedores = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  try {
    let query = db.collection('fornecedores').orderBy('nome').limit(limite);

    // Aplicar filtros
    if (filtros.nome) {
      query = query.where('nome', '>=', filtros.nome).where('nome', '<=', filtros.nome + '\uf8ff');
    }

    if (filtros.cnpj) {
      query = query.where('cnpj', '==', filtros.cnpj);
    }

    // Paginação
    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();
    const fornecedores = snapshot.docs.map((doc) => doc.data());

    return {
      fornecedores,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    throw error;
  }
};

/**
 * Busca fornecedor por CNPJ
 * @param {string} cnpj - CNPJ formatado
 * @returns {Promise<Object|null>}
 */
export const buscarPorCnpj = async (cnpj) => {
  const snapshot = await db.collection('fornecedores').where('cnpj', '==', cnpj).limit(1).get();

  return snapshot.empty ? null : snapshot.docs[0].data();
};
