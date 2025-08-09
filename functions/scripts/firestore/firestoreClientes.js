import { db } from '../../firebaseConfig.js';

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
 * @param {Object} [clienteData.dadosBancarios] - Dados bancários opcionais
 * @param {string} clienteData.dadosBancarios.banco - Nome do banco
 * @param {string} clienteData.dadosBancarios.agencia - Número da agência
 * @param {string} clienteData.dadosBancarios.agenciaDigito - Dígito da agência
 * @param {string} clienteData.dadosBancarios.conta - Número da conta
 * @param {string} clienteData.dadosBancarios.contaDigito - Dígito da conta
 * @returns {Promise<{success: boolean, error?: string}>}
 * @throws {Error} Em caso de erro no Firestore
 */
export const criarCliente = async (clienteData) => {
  try {
    const { cpf, dadosPessoais, endereco, contato, documentos, dadosBancarios } = clienteData;

    const cpfFormatado = cpf.replace(/[-.]/g, '');

    const cpfExistente = await db
      .collection('clientes')
      .where('id', '==', cpfFormatado)
      .limit(1)
      .get();

    if (!cpfExistente.empty) {
      throw new Error('CPF já cadastrado no sistema.');
    }

    // 1. Documento principal na coleção 'clientes'
    await db.collection('clientes').doc(cpfFormatado).set({
      id: cpfFormatado,
      tipo: 'PF',
      nomeCompleto: dadosPessoais.nome,
      dataNascimento: dadosPessoais.dataNascimento,
      status: 'ativo',
    });

    // 2. Subcoleções (endereco, contato, documentos)
    const batch = db.batch();
    const clienteRef = db.collection('clientes').doc(cpfFormatado);

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

    // Dados bancários
    if (dadosBancarios) {
      batch.set(clienteRef.collection('dados-bancarios').doc('principal'), {
        banco: dadosBancarios.banco,
        agencia: dadosBancarios.agencia,
        agenciaDigito: dadosBancarios.agenciaDigito,
        conta: dadosBancarios.conta,
        contaDigito: dadosBancarios.contaDigito,
        isPrincipal: true,
        dataCriacao: new Date().toISOString(),
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
    
    // Para cada cliente, buscar dados adicionais das subcoleções
    const clientes = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const clienteData = { id: doc.id, ...doc.data() };
        const clienteRef = doc.ref;
        
        // Adicionar CPF formatado
        const cpf = doc.id;
        clienteData.cpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9, 11)}`;
        
        // Buscar dados bancários (se existir)
        try {
          const dadosBancariosSnapshot = await clienteRef.collection('dados-bancarios').doc('principal').get();
          if (dadosBancariosSnapshot.exists) {
            const dadosBancarios = dadosBancariosSnapshot.data();
            clienteData.dadosBancarios = {
              banco: dadosBancarios.banco,
              agencia: `${dadosBancarios.agencia}-${dadosBancarios.agenciaDigito}`,
              conta: `${dadosBancarios.conta}-${dadosBancarios.contaDigito}`
            };
          }
        } catch (error) {
          // Se houver erro ao buscar dados bancários, não interrompe a listagem
          console.warn(`Erro ao buscar dados bancários para cliente ${doc.id}:`, error);
        }
        
        // Buscar contato principal (email)
        try {
          const contatoSnapshot = await clienteRef.collection('contatos').doc('principal').get();
          if (contatoSnapshot.exists) {
            const contato = contatoSnapshot.data();
            clienteData.email = contato.email;
            clienteData.telefone = contato.telefone;
          }
        } catch (error) {
          console.warn(`Erro ao buscar contato para cliente ${doc.id}:`, error);
        }
        
        return clienteData;
      })
    );

    return {
      clientes,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    throw error;
  }
};

/**
 * Atualiza um cliente existente no Firestore.
 * Os dados são mesclados com os existentes, permitindo atualização parcial.
 * @param {string} cpf - CPF do cliente a ser atualizado.
 * @param {Object} updates - Objeto com os campos a serem atualizados.
 * @param {Object} [updates.dadosPessoais] - Dados pessoais a serem atualizados.
 * @param {string} [updates.dadosPessoais.nome] - Novo nome completo.
 * @param {string} [updates.dadosPessoais.dataNascimento] - Nova data de nascimento.
 * @param {Object} [updates.endereco] - Endereço a ser atualizado (atualiza o endereço 'principal').
 * @param {string} [updates.endereco.cep] - Novo CEP.
 * @param {string} [updates.endereco.rua] - Nova rua.
 * @param {string} [updates.endereco.numero] - Novo número.
 * @param {string} [updates.endereco.bairro] - Novo bairro.
 * @param {string} [updates.endereco.cidade] - Nova cidade.
 * @param {string} [updates.endereco.estado] - Novo estado.
 * @param {Object} [updates.contato] - Contato a ser atualizado (atualiza o contato 'principal').
 * @param {string} [updates.contato.email] - Novo email.
 * @param {string} [updates.contato.telefone] - Novo telefone.
 * @param {Object} [updates.documentos] - Documentos a serem atualizados.
 * @param {Object} [updates.documentos.cnh] - Dados da CNH a serem atualizados.
 * @param {string} [updates.documentos.cnh.numero] - Novo número da CNH.
 * @param {string} [updates.documentos.cnh.categoria] - Nova categoria da CNH.
 * @param {string} [updates.documentos.cnh.dataValidade] - Nova data de validade da CNH.
 * @param {Object} [updates.dadosBancarios] - Dados bancários a serem atualizados.
 * @param {string} [updates.dadosBancarios.banco] - Nome do banco.
 * @param {string} [updates.dadosBancarios.agencia] - Número da agência.
 * @param {string} [updates.dadosBancarios.agenciaDigito] - Dígito da agência.
 * @param {string} [updates.dadosBancarios.conta] - Número da conta.
 * @param {string} [updates.dadosBancarios.contaDigito] - Dígito da conta.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const atualizarCliente = async (cpf, updates) => {
  try {
    const clienteRef = db.collection('clientes').doc(cpf);
    const batch = db.batch();

    // Verifica se o cliente existe antes de tentar atualizar
    const doc = await clienteRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Cliente não encontrado.' };
    }

    // Atualiza campos diretos do documento principal (clientes)
    const mainDocUpdates = {};
    if (updates.dadosPessoais?.nome) {
      mainDocUpdates.nomeCompleto = updates.dadosPessoais.nome;
    }
    if (updates.dadosPessoais?.dataNascimento) {
      mainDocUpdates.dataNascimento = updates.dadosPessoais.dataNascimento;
    }
    // Adicione outros campos diretos se necessário (ex: tipo, status)
    if (Object.keys(mainDocUpdates).length > 0) {
      batch.update(clienteRef, mainDocUpdates);
    }

    // Atualiza subcoleções
    if (updates.endereco) {
      batch.set(clienteRef.collection('enderecos').doc('principal'), updates.endereco, {
        merge: true,
      });
    }

    if (updates.contato) {
      batch.set(clienteRef.collection('contatos').doc('principal'), updates.contato, {
        merge: true,
      });
    }

    if (updates.documentos?.cnh) {
      batch.set(clienteRef.collection('documentos').doc('cnh'), updates.documentos.cnh, {
        merge: true,
      });
    }

    // Atualiza dados bancários
    if (updates.dadosBancarios) {
      const dadosBancariosData = {
        ...updates.dadosBancarios,
        dataAtualizacao: new Date().toISOString(),
      };
      
      batch.set(clienteRef.collection('dados-bancarios').doc('principal'), dadosBancariosData, {
        merge: true,
      });
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${cpf}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca um cliente específico por CPF, incluindo todas as suas subcoleções
 * @param {string} cpf - CPF do cliente (pode estar formatado ou não)
 * @returns {Promise<{success: boolean, cliente?: Object, error?: string}>}
 */
export const buscarClientePorCPF = async (cpf) => {
  try {
    const cpfFormatado = cpf.replace(/[-.]/g, '');
    const clienteRef = db.collection('clientes').doc(cpfFormatado);
    
    // Busca o documento principal
    const doc = await clienteRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Cliente não encontrado.' };
    }

    const clienteData = { id: doc.id, ...doc.data() };

    // Adicionar CPF formatado
    const cpfFormatadoDisplay = cpfFormatado;
    clienteData.cpf = `${cpfFormatadoDisplay.substring(0, 3)}.${cpfFormatadoDisplay.substring(3, 6)}.${cpfFormatadoDisplay.substring(6, 9)}-${cpfFormatadoDisplay.substring(9, 11)}`;

    // Busca todas as subcoleções
    const subcollections = ['enderecos', 'contatos', 'documentos', 'dados-bancarios'];
    
    for (const subcollectionName of subcollections) {
      const snapshot = await clienteRef.collection(subcollectionName).get();
      if (!snapshot.empty) {
        clienteData[subcollectionName] = {};
        snapshot.docs.forEach((subDoc) => {
          clienteData[subcollectionName][subDoc.id] = subDoc.data();
        });
      }
    }

    // Formatar dados bancários para exibição mais amigável
    if (clienteData['dados-bancarios']?.principal) {
      const dadosBancarios = clienteData['dados-bancarios'].principal;
      clienteData.dadosBancarios = {
        banco: dadosBancarios.banco,
        agencia: `${dadosBancarios.agencia}-${dadosBancarios.agenciaDigito}`,
        conta: `${dadosBancarios.conta}-${dadosBancarios.contaDigito}`,
        dataCriacao: dadosBancarios.dataCriacao,
        dataAtualizacao: dadosBancarios.dataAtualizacao
      };
      // Remover a estrutura original para evitar duplicação
      delete clienteData['dados-bancarios'];
    }

    // Adicionar dados de contato no nível principal para facilitar acesso
    if (clienteData.contatos?.principal) {
      clienteData.email = clienteData.contatos.principal.email;
      clienteData.telefone = clienteData.contatos.principal.telefone;
    }

    return { success: true, cliente: clienteData };
  } catch (error) {
    console.error(`Erro ao buscar cliente ${cpf}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Deleta um cliente e suas subcoleções associadas do Firestore.
 * @param {string} cpf - CPF do cliente a ser deletado.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deletarCliente = async (cpf) => {
  try {
    const clienteRef = db.collection('clientes').doc(cpf);

    // Verifica se o cliente existe
    const doc = await clienteRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Cliente não encontrado.' };
    }

    // Deleta subcoleções (Firestore não deleta subcoleções automaticamente com o documento pai)
    const subcollections = ['enderecos', 'contatos', 'documentos', 'dados-bancarios'];
    for (const subcollectionName of subcollections) {
      const snapshot = await clienteRef.collection(subcollectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach((subDoc) => {
        batch.delete(subDoc.ref);
      });
      await batch.commit();
    }

    // Deleta o documento principal do cliente
    await clienteRef.delete();

    return { success: true };
  } catch (error) {
    console.error(`Erro ao deletar cliente ${cpf}:`, error);
    return { success: false, error: error.message };
  }
};
