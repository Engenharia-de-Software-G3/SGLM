import { db } from '../../firebaseConfig';

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
      status: 'ativo'
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
      isPrincipal: true
    });

    // Contato
    batch.set(clienteRef.collection('contatos').doc('principal'), {
      email: contato.email,
      telefone: contato.telefone, // Formato: '(XX) XXXXX-XXXX'
      isPrincipal: true
    });

    // CNH (documento)
    if (documentos?.cnh) {
      batch.set(clienteRef.collection('documentos').doc('cnh'), {
        tipo: 'CNH',
        numero: documentos.cnh.numero,
        categoria: documentos.cnh.categoria,
        dataValidade: documentos.cnh.dataValidade // 'YYYY-MM-DD'
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
export const listarClientes = async ({ pagina = 1, limite = 10, filtros = {} }) => {
  try {
    let query = db.collection('clientes');

    // Aplicar filtros
    if (filtros.nome) {
      query = query.where('nomeCompleto', '>=', filtros.nome)
                  .where('nomeCompleto', '<=', filtros.nome + '\uf8ff');
    }

    // Paginação
    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;
    const snapshot = await query.limit(limite).offset((pagina - 1) * limite).get();

    return {
      clientes: snapshot.docs.map(doc => doc.data()),
      total,
      paginas: Math.ceil(total / limite)
    };
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    throw error;
  }
};