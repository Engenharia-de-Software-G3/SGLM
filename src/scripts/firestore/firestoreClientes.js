import { db } from '../../../firebaseConfig.js';

/**
 * Cadastra um novo cliente no Firestore
 * @param {Object} clienteData - Dados do cliente
 * @param {string} clienteData.cpf - CPF do cliente (formato: 'XXX.XXX.XXX-XX')
 * @param {Object} clienteData.dadosPessoais - Dados pessoais
 * @param {string} clienteData.dadosPessoais.nome - Nome completo
 * @param {string} clienteData.dadosPessoais.dataNascimento - Data (formato: 'YYYY-MM-DD')
 * @param {Object} clienteData.endereco - Endereço principal
 * @param {string} clienteData.endereco.cep - CEP (formato: 'XXXXX-XXX')
 * @param {string} clienteData.endereco.rua - Logradouro
 * @param {string} clienteData.endereco.numero - Número
 * @param {string} clienteData.endereco.bairro - Bairro
 * @param {string} clienteData.endereco.cidade - Cidade
 * @param {string} clienteData.endereco.estado - Sigla do estado (ex: 'SP')
 * @param {Object} clienteData.contato - Contato principal
 * @param {string} clienteData.contato.email - E-mail válido
 * @param {string} clienteData.contato.telefone - Telefone (formato: '(XX) XXXXX-XXXX')
 * @param {Object} [clienteData.documentos] - Documentos opcionais
 * @param {Object} [clienteData.documentos.cnh] - Dados da CNH
 * @param {string} clienteData.documentos.cnh.numero - Número da CNH
 * @param {string} clienteData.documentos.cnh.categoria - Categoria (ex: 'AB')
 * @param {string} clienteData.documentos.cnh.dataValidade - Data (formato: 'YYYY-MM-DD')
 * @returns {Promise<{success: boolean, error?: string}>} 
 * @throws {Error} Em caso de erro no Firestore
 */
export const criarCliente = async (clienteData) => {
  try {
    const { cpf, dadosPessoais, endereco, contato, documentos } = clienteData;

    // 1. Documento principal na coleção 'clientes'
    await db.collection('clientes').doc(cpf).set({
      id: cpf,
      tipo: 'PF',
      nomeCompleto: dadosPessoais.nome,
      dataNascimento: dadosPessoais.dataNascimento,
      status: 'ativo',
    });

    // 2. Subcoleções (endereco, contato, documentos)
    const batch = db.batch();
    const clienteRef = db.collection('clientes').doc(cpf);

    // Endereço
    batch.set(clienteRef.collection('enderecos').doc('principal'), {
      cep: endereco.cep,
      rua: endereco.rua,
      numero: endereco.numero,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      isPrincipal: true,
    });

    // Contato
    batch.set(clienteRef.collection('contatos').doc('principal'), {
      email: contato.email,
      telefone: contato.telefone,
      isPrincipal: true,
    });

    // CNH (documento)
    if (documentos?.cnh) {
      batch.set(clienteRef.collection('documentos').doc('cnh'), {
        tipo: 'CNH',
        numero: documentos.cnh.numero,
        categoria: documentos.cnh.categoria,
        dataValidade: documentos.cnh.dataValidade,
      });
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Lista clientes com paginação e filtros
 * @param {Object} params
 * @param {number} [params.limite=10] - Número máximo de resultados
 * @param {firebase.firestore.DocumentSnapshot} [params.ultimoDoc] - Último documento da página anterior (para startAfter)
 * @param {Object} [params.filtros] - Filtros de busca
 * @param {string} [params.filtros.nome] - Filtro por nome (busca parcial case-insensitive)
 * @param {'PF'|'PJ'} [params.filtros.tipo] - Filtro por tipo de cliente
 * @returns {Promise<{clientes: Array<Object>, ultimoDoc: firebase.firestore.DocumentSnapshot|null}>}
 * @throws {Error} Em caso de erro no Firestore
 */
export const listarClientes = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  try {
    let query = db.collection('clientes').orderBy('nomeCompleto').limit(limite);

    // Aplicar filtros
    if (filtros.nome) {
      query = query
        .where('nomeCompleto', '>=', filtros.nome)
        .where('nomeCompleto', '<=', filtros.nome + '\uf8ff');
    }

    if (filtros.tipo) {
      query = query.where('tipo', '==', filtros.tipo);
    }

    // Paginação (startAfter)
    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();
    const clientes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return {
      clientes,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    throw error;
  }
};