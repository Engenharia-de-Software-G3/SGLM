import { db } from '../../../firebaseConfig.js';
import { validators, formatters } from './validators.js';
import { errorHandler, BusinessError } from './errorHandler.js';
import { COLLECTIONS, STATUS, PAGINATION } from './constants.js';

const COLLECTION_NAME = COLLECTIONS.CLIENTES;
const VALID_STATUSES = Object.values(STATUS.CLIENTE);

class ClienteService {
  /**
   * Valida dados básicos do cliente.
   *
   * @param {Object} clienteData - Objeto contendo os dados do cliente.
   * @param {string} clienteData.cpf - CPF do cliente.
   * @param {Object} clienteData.dadosPessoais - Dados pessoais do cliente.
   * @param {Object} clienteData.endereco - Endereço do cliente.
   * @param {Object} clienteData.contato - Contato do cliente.
   * @returns {Object} Dados do cliente validados e normalizados.
   * @throws {ValidationError} Se algum campo obrigatório estiver ausente ou inválido.
   */
  static validateClienteData(clienteData) {
    const { cpf, dadosPessoais, endereco, contato } = clienteData;

    if (!cpf || !dadosPessoais?.nome || !endereco || !contato?.email) {
      throw new ValidationError('Campos obrigatórios não preenchidos');
    }

    const cpfValidado = validators.cpf(cpf);
    const emailValidado = validators.email(contato.email);

    // Validar data de nascimento se fornecida
    if (dadosPessoais.dataNascimento) {
      const dataNasc = validators.date(dadosPessoais.dataNascimento, 'dataNascimento');
      const idade = this.calcularIdade(dataNasc);

      if (idade < 18) {
        throw new ValidationError('Cliente deve ser maior de idade', 'dataNascimento');
      }
    }

    return {
      cpf: cpfValidado,
      dadosPessoais: {
        ...dadosPessoais,
        nome: dadosPessoais.nome.trim(),
      },
      endereco: this.validateEndereco(endereco),
      contato: {
        ...contato,
        email: emailValidado,
      },
    };
  }

  /**
   * Valida dados de endereço.
   *
   * @param {Object} endereco - Objeto contendo os dados do endereço.
   * @param {string} endereco.cep - CEP.
   * @param {string} endereco.rua - Rua.
   * @param {string} endereco.numero - Número.
   * @param {string} endereco.bairro - Bairro.
   * @param {string} endereco.cidade - Cidade.
   * @param {string} endereco.estado - Estado (UF).
   * @returns {Object} Endereço validado e normalizado.
   * @throws {ValidationError} Se algum campo obrigatório estiver ausente ou inválido.
   */
  static validateEndereco(endereco) {
    const { cep, rua, numero, bairro, cidade, estado } = endereco;

    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      throw new ValidationError('Todos os campos do endereço são obrigatórios');
    }

    // Validar CEP (formato básico)
    const cepLimpo = cep.replace(/[^\d]/g, '');
    if (cepLimpo.length !== 8) {
      throw new ValidationError('CEP deve ter 8 dígitos', 'cep');
    }

    // Validar estado (2 caracteres)
    if (estado.length !== 2) {
      throw new ValidationError('Estado deve ter 2 caracteres', 'estado');
    }

    return {
      cep: cepLimpo,
      rua: rua.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      estado: estado.toUpperCase().trim(),
    };
  }

  /**
   * Valida dados da CNH.
   *
   * @param {Object} cnh - Objeto contendo os dados da CNH.
   * @param {string} cnh.numero - Número da CNH.
   * @param {string} cnh.categoria - Categoria da CNH.
   * @param {string|Date} cnh.dataValidade - Data de validade da CNH.
   * @returns {Object} CNH validada e normalizada.
   * @throws {ValidationError} Se algum campo obrigatório estiver ausente ou inválido.
   */
  static validateCNH(cnh) {
    if (!cnh.numero || !cnh.categoria || !cnh.dataValidade) {
      throw new ValidationError('Todos os campos da CNH são obrigatórios');
    }

    const dataValidade = validators.date(cnh.dataValidade, 'dataValidade');

    if (dataValidade <= new Date()) {
      throw new ValidationError('CNH está vencida', 'dataValidade');
    }

    return {
      numero: cnh.numero.trim(),
      categoria: cnh.categoria.toUpperCase().trim(),
      dataValidade: formatters.dateToISO(dataValidade),
    };
  }

  /**
   * Calcula idade baseada na data de nascimento.
   *
   * @param {Date|string} dataNascimento - Data de nascimento do cliente.
   * @returns {number} Idade em anos.
   */
  static calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  /**
   * Verifica se CPF já existe no sistema.
   *
   * @param {string} cpf - CPF do cliente.
   * @returns {Promise<boolean>} True se o CPF já existe, False caso contrário.
   */
  static async verificarCPFExistente(cpf) {
    const snapshot = await db.collection(COLLECTION_NAME).where('id', '==', cpf).limit(1).get();

    return !snapshot.empty;
  }

  /**
   * Formata cliente para resposta.
   *
   * @param {import('firebase').firestore.DocumentSnapshot} doc - Documento do cliente.
   * @param {boolean} [incluirSubcolecoes=false] - Se deve incluir subcoleções.
   * @returns {Object} Cliente formatado.
   */
  static formatarCliente(doc, incluirSubcolecoes = false) {
    const data = doc.data();
    const cliente = {
      id: doc.id,
      ...data,
      cpf: formatters.cpfToDisplay(data.id || doc.id),
    };

    if (incluirSubcolecoes) {
      // Placeholder para incluir subcoleções se necessário
      cliente._incluirSubcolecoes = true;
    }

    return cliente;
  }

  /**
   * Busca e formata subcoleções do cliente.
   *
   * @param {import('firebase').firestore.DocumentReference} clienteRef - Referência do documento do cliente.
   * @returns {Promise<Object>} Subcoleções do cliente.
   */
  static async buscarSubcolecoes(clienteRef) {
    const [enderecosSnap, contatosSnap, documentosSnap] = await Promise.all([
      clienteRef.collection('enderecos').get(),
      clienteRef.collection('contatos').get(),
      clienteRef.collection('documentos').get(),
    ]);

    return {
      enderecos: enderecosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      contatos: contatosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      documentos: documentosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  }
}

/**
 * Cadastra um novo cliente com validações aprimoradas.
 *
 * @param {Object} clienteData - Dados do cliente a ser cadastrado.
 * @returns {Promise<Object>} Objeto com sucesso e id do cliente.
 * @throws {BusinessError} Se o CPF já estiver cadastrado.
 * @throws {ValidationError} Se algum campo obrigatório estiver ausente ou inválido.
 */
export const criarCliente = async (clienteData) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      // 1. Validar dados de entrada
      const dadosValidados = ClienteService.validateClienteData(clienteData);

      // 2. Verificar se CPF já existe
      const cpfExiste = await ClienteService.verificarCPFExistente(dadosValidados.cpf);
      if (cpfExiste) {
        throw new BusinessError('CPF já cadastrado no sistema', 'CPF_JA_EXISTE');
      }

      // 3. Validar CNH se fornecida
      let cnhValidada = null;
      if (clienteData.documentos?.cnh) {
        cnhValidada = ClienteService.validateCNH(clienteData.documentos.cnh);
      }

      // 4. Criar cliente usando transação
      return db.runTransaction(async (transaction) => {
        const clienteRef = db.collection(COLLECTION_NAME).doc(dadosValidados.cpf);

        // Documento principal
        transaction.set(clienteRef, {
          id: dadosValidados.cpf,
          tipo: 'PF',
          nomeCompleto: dadosValidados.dadosPessoais.nome,
          dataNascimento: dadosValidados.dadosPessoais.dataNascimento || null,
          status: STATUS.CLIENTE.ATIVO,
          dataCadastro: formatters.dateToISO(new Date()),
          dataAtualizacao: formatters.dateToISO(new Date()),
        });

        // Subcoleções
        transaction.set(clienteRef.collection('enderecos').doc('principal'), {
          ...dadosValidados.endereco,
          isPrincipal: true,
          dataCadastro: formatters.dateToISO(new Date()),
        });

        transaction.set(clienteRef.collection('contatos').doc('principal'), {
          ...dadosValidados.contato,
          isPrincipal: true,
          dataCadastro: formatters.dateToISO(new Date()),
        });

        if (cnhValidada) {
          transaction.set(clienteRef.collection('documentos').doc('cnh'), {
            tipo: 'CNH',
            ...cnhValidada,
            dataCadastro: formatters.dateToISO(new Date()),
          });
        }
      });

      return { success: true, id: dadosValidados.cpf };
    }, 'criar cliente')
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Lista clientes com filtros e paginação aprimorados.
 *
 * @param {Object} params - Parâmetros de listagem.
 * @param {number} [params.limite] - Limite de clientes.
 * @param {Object} [params.ultimoDoc] - Último documento para paginação.
 * @param {Object} [params.filtros] - Filtros de busca.
 * @param {boolean} [params.incluirSubcolecoes] - Se deve incluir subcoleções.
 * @returns {Promise<Object>} Lista de clientes e paginação.
 */
export const listarClientes = async ({
  limite = PAGINATION.DEFAULT_LIMIT,
  ultimoDoc = null,
  filtros = {},
  incluirSubcolecoes = false,
}) => {
  return errorHandler.handleFirestoreOperation(async () => {
    // Validar limite
    const limiteValidado = Math.min(Math.max(1, Number(limite)), PAGINATION.MAX_LIMIT);

    let query = db.collection(COLLECTION_NAME).orderBy('nomeCompleto').limit(limiteValidado);

    // Aplicar filtros
    if (filtros.nome) {
      const nomeNormalizado = filtros.nome.trim().toLowerCase();
      query = query
        .where('nomeCompleto', '>=', nomeNormalizado)
        .where('nomeCompleto', '<=', nomeNormalizado + '\uf8ff');
    }

    if (filtros.tipo) {
      query = query.where('tipo', '==', filtros.tipo);
    }

    if (filtros.status) {
      validators.status(filtros.status, VALID_STATUSES);
      query = query.where('status', '==', filtros.status);
    }

    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();

    let clientes = snapshot.docs.map((doc) =>
      ClienteService.formatarCliente(doc, incluirSubcolecoes),
    );

    // Buscar subcoleções se solicitado
    if (incluirSubcolecoes && clientes.length > 0) {
      clientes = await Promise.all(
        clientes.map(async (cliente) => {
          const clienteRef = db.collection(COLLECTION_NAME).doc(cliente.id);
          const subcolecoes = await ClienteService.buscarSubcolecoes(clienteRef);
          return { ...cliente, ...subcolecoes };
        }),
      );
    }

    return {
      clientes,
      total: snapshot.size,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }, 'listar clientes');
};

/**
 * Busca cliente por CPF com subcoleções.
 *
 * @param {string} cpf - CPF do cliente.
 * @param {boolean} [incluirSubcolecoes=true] - Se deve incluir subcoleções.
 * @returns {Promise<Object>} Cliente encontrado.
 * @throws {BusinessError} Se o cliente não for encontrado.
 */
export const buscarClientePorCPF = async (cpf, incluirSubcolecoes = true) => {
  return errorHandler.handleFirestoreOperation(async () => {
    const cpfValidado = validators.cpf(cpf);
    const clienteRef = db.collection(COLLECTION_NAME).doc(cpfValidado);
    const doc = await clienteRef.get();

    if (!doc.exists) {
      throw new BusinessError('Cliente não encontrado', 'CLIENTE_NAO_ENCONTRADO');
    }

    let cliente = ClienteService.formatarCliente(doc);

    if (incluirSubcolecoes) {
      const subcolecoes = await ClienteService.buscarSubcolecoes(clienteRef);
      cliente = { ...cliente, ...subcolecoes };
    }

    return cliente;
  }, `buscar cliente ${cpf}`);
};

/**
 * Atualiza cliente com validações.
 *
 * @param {string} cpf - CPF do cliente.
 * @param {Object} updates - Campos a serem atualizados.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {BusinessError} Se o cliente não for encontrado.
 * @throws {ValidationError} Se algum campo for inválido.
 */
export const atualizarCliente = async (cpf, updates) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      const cpfValidado = validators.cpf(cpf);
      const clienteRef = db.collection(COLLECTION_NAME).doc(cpfValidado);

      return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(clienteRef);

        if (!doc.exists) {
          throw new BusinessError('Cliente não encontrado', 'CLIENTE_NAO_ENCONTRADO');
        }

        const updateData = {
          dataAtualizacao: formatters.dateToISO(new Date()),
        };

        // Validar e aplicar atualizações no documento principal
        if (updates.dadosPessoais?.nome) {
          updateData.nomeCompleto = updates.dadosPessoais.nome.trim();
        }

        if (updates.dadosPessoais?.dataNascimento) {
          const dataNasc = validators.date(updates.dadosPessoais.dataNascimento, 'dataNascimento');
          updateData.dataNascimento = formatters.dateToISO(dataNasc);
        }

        if (updates.status) {
          updateData.status = validators.status(updates.status, VALID_STATUSES);
        }

        // Atualizar documento principal se há mudanças
        if (Object.keys(updateData).length > 1) {
          transaction.update(clienteRef, updateData);
        }

        // Atualizar subcoleções
        if (updates.endereco) {
          const enderecoValidado = ClienteService.validateEndereco(updates.endereco);
          transaction.set(
            clienteRef.collection('enderecos').doc('principal'),
            {
              ...enderecoValidado,
              isPrincipal: true,
              dataAtualizacao: formatters.dateToISO(new Date()),
            },
            { merge: true },
          );
        }

        if (updates.contato) {
          const contatoData = { ...updates.contato };
          if (contatoData.email) {
            contatoData.email = validators.email(contatoData.email);
          }

          transaction.set(
            clienteRef.collection('contatos').doc('principal'),
            {
              ...contatoData,
              isPrincipal: true,
              dataAtualizacao: formatters.dateToISO(new Date()),
            },
            { merge: true },
          );
        }

        if (updates.documentos?.cnh) {
          const cnhValidada = ClienteService.validateCNH(updates.documentos.cnh);
          transaction.set(
            clienteRef.collection('documentos').doc('cnh'),
            {
              tipo: 'CNH',
              ...cnhValidada,
              dataAtualizacao: formatters.dateToISO(new Date()),
            },
            { merge: true },
          );
        }
      });

      return { success: true };
    }, `atualizar cliente ${cpf}`)
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Altera status do cliente (ativar/desativar/bloquear).
 *
 * @param {string} cpf - CPF do cliente.
 * @param {string} novoStatus - Novo status do cliente.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {BusinessError} Se o cliente não for encontrado.
 * @throws {ValidationError} Se o status for inválido.
 */
export const alterarStatusCliente = async (cpf, novoStatus) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      const cpfValidado = validators.cpf(cpf);
      const statusValidado = validators.status(novoStatus, VALID_STATUSES);

      const clienteRef = db.collection(COLLECTION_NAME).doc(cpfValidado);
      const doc = await clienteRef.get();

      if (!doc.exists) {
        throw new BusinessError('Cliente não encontrado', 'CLIENTE_NAO_ENCONTRADO');
      }

      await clienteRef.update({
        status: statusValidado,
        dataAtualizacao: formatters.dateToISO(new Date()),
      });

      return { success: true };
    }, `alterar status do cliente ${cpf}`)
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Exclui cliente e suas subcoleções (soft delete ou exclusão completa).
 *
 * @param {string} cpf - CPF do cliente.
 * @param {boolean} [exclusaoCompleta=false] - Se deve excluir fisicamente o cliente e subcoleções.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {BusinessError} Se o cliente não for encontrado.
 */
export const excluirCliente = async (cpf, exclusaoCompleta = false) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      const cpfValidado = validators.cpf(cpf);
      const clienteRef = db.collection(COLLECTION_NAME).doc(cpfValidado);

      return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(clienteRef);

        if (!doc.exists) {
          throw new BusinessError('Cliente não encontrado', 'CLIENTE_NAO_ENCONTRADO');
        }

        if (exclusaoCompleta) {
          // Exclusão física - deletar subcoleções primeiro
          const subcollections = ['enderecos', 'contatos', 'documentos'];

          for (const subcollectionName of subcollections) {
            const snapshot = await clienteRef.collection(subcollectionName).get();
            snapshot.docs.forEach((subDoc) => {
              transaction.delete(subDoc.ref);
            });
          }

          // Deletar documento principal
          transaction.delete(clienteRef);
        } else {
          // Soft delete - apenas alterar status
          transaction.update(clienteRef, {
            status: STATUS.CLIENTE.INATIVO,
            dataExclusao: formatters.dateToISO(new Date()),
            dataAtualizacao: formatters.dateToISO(new Date()),
          });
        }
      });

      return { success: true };
    }, `excluir cliente ${cpf}`)
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Busca clientes por nome (busca flexível).
 *
 * @param {string} nome - Nome do cliente para busca.
 * @param {number} [limite=PAGINATION.DEFAULT_LIMIT] - Limite de resultados.
 * @returns {Promise<Object[]>} Lista de clientes encontrados.
 * @throws {ValidationError} Se o nome for muito curto.
 */
export const buscarClientesPorNome = async (nome, limite = PAGINATION.DEFAULT_LIMIT) => {
  return errorHandler.handleFirestoreOperation(async () => {
    if (!nome || nome.trim().length < 2) {
      throw new ValidationError('Nome deve ter pelo menos 2 caracteres', 'nome');
    }

    const nomeNormalizado = nome.trim().toLowerCase();
    const limiteValidado = Math.min(Number(limite), PAGINATION.MAX_LIMIT);

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('nomeCompleto', '>=', nomeNormalizado)
      .where('nomeCompleto', '<=', nomeNormalizado + '\uf8ff')
      .where('status', '==', STATUS.CLIENTE.ATIVO)
      .limit(limiteValidado)
      .get();

    return snapshot.docs.map(ClienteService.formatarCliente);
  }, `buscar clientes por nome: ${nome}`);
};

/**
 * Verifica se cliente pode alugar (validações de negócio).
 *
 * @param {string} cpf - CPF do cliente.
 * @returns {Promise<Object>} Objeto com elegibilidade, problemas e dados do cliente.
 */
export const verificarElegibilidadeLocacao = async (cpf) => {
  return errorHandler.handleFirestoreOperation(async () => {
    const cliente = await buscarClientePorCPF(cpf, true);

    const problemas = [];

    // Verificar status
    if (cliente.status !== STATUS.CLIENTE.ATIVO) {
      problemas.push('Cliente não está ativo no sistema');
    }

    // Verificar CNH
    const cnh = cliente.documentos?.find((doc) => doc.tipo === 'CNH');
    if (!cnh) {
      problemas.push('Cliente não possui CNH cadastrada');
    } else {
      const dataValidade = new Date(cnh.dataValidade);
      if (dataValidade <= new Date()) {
        problemas.push('CNH está vencida');
      }
    }

    // Verificar idade (se data de nascimento disponível)
    if (cliente.dataNascimento) {
      const idade = ClienteService.calcularIdade(new Date(cliente.dataNascimento));
      if (idade < 21) {
        problemas.push('Cliente deve ter pelo menos 21 anos para locação');
      }
    }

    return {
      elegivel: problemas.length === 0,
      problemas,
      cliente: {
        nome: cliente.nomeCompleto,
        cpf: cliente.cpf,
        status: cliente.status,
      },
    };
  }, `verificar elegibilidade do cliente ${cpf}`);
};
