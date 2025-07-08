import { db } from '../../../firebaseConfig.js';

// Cadastrar cliente (dados pessoais + documentos)
export const criarCliente = async (clienteData) => {
  try {
    const { cpf, dadosPessoais, endereco, contato, documentos } = clienteData;

    // 1. Documento principal na coleção 'clientes'
    await db.collection('clientes').doc(cpf).set({
      id: cpf,
      tipo: 'PF',
      nomeCompleto: dadosPessoais.nome,
      dataNascimento: dadosPessoais.dataNascimento, // Formato: 'YYYY-MM-DD'
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
      telefone: contato.telefone, // Formato: '(XX) XXXXX-XXXX'
      isPrincipal: true,
    });

    // CNH (documento)
    if (documentos?.cnh) {
      batch.set(clienteRef.collection('documentos').doc('cnh'), {
        tipo: 'CNH',
        numero: documentos.cnh.numero,
        categoria: documentos.cnh.categoria,
        dataValidade: documentos.cnh.dataValidade, // 'YYYY-MM-DD'
      });
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return { success: false, error: error.message };
  }
};

// Listar clientes com filtros (para T19.01)
export const listarClientes = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  try {
    let query = db.collection('clientes').orderBy('nomeCompleto').limit(limite);

    // Aplicar filtros
    if (filtros.nome) {
      query = query
        .where('nomeCompleto', '>=', filtros.nome)
        .where('nomeCompleto', '<=', filtros.nome + '\uf8ff');
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
