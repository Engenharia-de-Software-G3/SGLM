import { db } from '../../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { validadores, formatadores } from './validators.js';
import { tratadorDeErros, ErroDeNegocio } from './errorHandler.js';
import { buscarPorChassi } from './firestoreVeiculos.js';

const COLLECTION_NAME = 'locacoes';
const VALID_STATUSES = ['ativa', 'concluida', 'cancelada'];

class LocacaoService {
  /**
   * Valida dados da locação.
   *
   * @param {Object} data - Dados da locação.
   * @param {string} data.cpfLocatario - CPF do locatário.
   * @param {string} data.placaVeiculo - Placa do veículo.
   * @param {string|Date} data.dataInicio - Data de início da locação.
   * @param {string|Date} data.dataFim - Data de fim da locação.
   * @param {number|string} data.valor - Valor da locação.
   * @returns {Object} Dados validados e normalizados.
   * @throws {ValidationError} Se algum campo obrigatório estiver ausente ou inválido.
   */
  static validateLocacaoData(data) {
    const { cpfLocatario, placaVeiculo, dataInicio, dataFim, valor } = data;

    if (!cpfLocatario || !placaVeiculo || !dataInicio || !dataFim || valor === undefined) {
      throw new ValidationError('Todos os campos obrigatórios devem ser preenchidos');
    }

    const cpfValidado = validadores.cpf(cpfLocatario);
    const placaValidada = validadores.placa(placaVeiculo);
    const { startDate, endDate } = validadores.dateRange(dataInicio, dataFim);

    if (Number(valor) <= 0) {
      throw new ValidationError('Valor deve ser maior que zero', 'valor');
    }

    return {
      cpfLocatario: cpfValidado,
      placaVeiculo: placaValidada,
      dataInicio: startDate,
      dataFim: endDate,
      valor: Number(valor),
    };
  }

  /**
   * Verifica disponibilidade do cliente.
   *
   * @param {string} cpf - CPF do cliente.
   * @returns {Promise<Object>} Dados do cliente.
   * @throws {ErroDeNegocio} Se o cliente não for encontrado ou não estiver ativo.
   */
  static async verificarCliente(cpf) {
    const clienteDoc = await db.collection('clientes').doc(cpf).get();

    if (!clienteDoc.exists) {
      throw new ErroDeNegocio('Cliente não encontrado', 'CLIENTE_NAO_ENCONTRADO');
    }

    const clienteData = clienteDoc.data();
    if (clienteData.status !== 'ativo') {
      throw new ErroDeNegocio('Cliente não está ativo', 'CLIENTE_INATIVO');
    }

    return clienteData;
  }

  /**
   * Verifica disponibilidade do veículo.
   *
   * @param {string} placa - Placa do veículo.
   * @returns {Promise<{doc: import('firebase').firestore.DocumentSnapshot, data: Object}>}
   *   Documento e dados do veículo.
   * @throws {ErroDeNegocio} Se o veículo não for encontrado ou não estiver disponível.
   */
  static async verificarVeiculo(placa) {
    const veiculosSnapshot = await db
      .collection('veiculos')
      .where('placa', '==', placa)
      .limit(1)
      .get();

    if (veiculosSnapshot.empty) {
      throw new ErroDeNegocio('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
    }

    const veiculoDoc = veiculosSnapshot.docs[0];
    const veiculoData = veiculoDoc.data();

    if (veiculoData.status !== 'disponivel') {
      throw new ErroDeNegocio('Veículo não está disponível para locação', 'VEICULO_INDISPONIVEL');
    }

    return { doc: veiculoDoc, data: veiculoData };
  }

  /**
   * Atualiza status do veículo.
   *
   * @param {import('firebase').firestore.DocumentSnapshot} veiculoDoc - Documento do veículo.
   * @param {string} novoStatus - Novo status do veículo.
   * @returns {Promise<void>}
   */
  static async atualizarStatusVeiculo(veiculoDoc, novoStatus) {
    await veiculoDoc.ref.update({
      status: novoStatus,
      dataAtualizacao: formatadores.dataIso(new Date()),
    });
  }

  /**
   * Formata locação para resposta.
   *
   * @param {import('firebase').firestore.DocumentSnapshot} doc - Documento da locação.
   * @returns {Object} Locação formatada.
   */
  static formatarLocacao(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      dataInicio: formatadores.dataExibicao(data.dataInicio),
      dataFim: formatadores.dataExibicao(data.dataFim),
      dataCadastro: formatadores.dataExibicao(data.dataCadastro),
      dataAtualizacao: formatadores.dataExibicao(data.dataAtualizacao),
    };
  }
}

/**
 * Cadastra uma nova locação com validações aprimoradas.
 *
 * @param {Object} locacaoData - Dados da locação.
 * @returns {Promise<Object>} Objeto de sucesso e id da locação.
 * @throws {ErroDeNegocio|ValidationError} Se houver erro de negócio ou validação.
 */
export const criarLocacao = async (locacaoData) => {
  return tratadorDeErros
    .executarOperacaoFirestore(async () => {
      // 1. Validar dados de entrada
      const dadosValidados = LocacaoService.validateLocacaoData(locacaoData);

      // 2. Verificar cliente e veículo em paralelo
      const [cliente, veiculo] = await Promise.all([
        LocacaoService.verificarCliente(dadosValidados.cpfLocatario),
        LocacaoService.verificarVeiculo(dadosValidados.placaVeiculo),
      ]);

      // 3. Criar locação usando transação
      const id = uuidv4();
      const agora = new Date();

      await db.runTransaction(async (transaction) => {
        // Criar documento da locação
        const locacaoRef = db.collection(COLLECTION_NAME).doc(id);
        transaction.set(locacaoRef, {
          id,
          clienteId: dadosValidados.cpfLocatario,
          veiculoId: veiculo.doc.id,
          placaVeiculo: dadosValidados.placaVeiculo,
          dataInicio: formatadores.dataIso(dadosValidados.dataInicio),
          dataFim: formatadores.dataIso(dadosValidados.dataFim),
          valor: dadosValidados.valor,
          servicosAdicionaisIds: locacaoData.servicosAdicionaisIds || [],
          status: 'ativa',
          dataCadastro: formatadores.dataIso(agora),
          dataAtualizacao: formatadores.dataIso(agora),
        });

        // Atualizar status do veículo
        transaction.update(veiculo.doc.ref, {
          status: 'alugado',
          dataAtualizacao: formatadores.dataIso(agora),
        });
      });

      return { success: true, id };
    }, 'criar locação')
    .catch((error) => tratadorDeErros.formatarRespostaDeErro(error));
};

/**
 * Lista locações com filtros aprimorados.
 *
 * @param {Object} params - Parâmetros de listagem.
 * @param {number} [params.limite=10] - Limite de locações.
 * @param {Object} [params.ultimoDoc=null] - Último documento para paginação.
 * @param {Object} [params.filtros={}] - Filtros de busca.
 * @returns {Promise<Object>} Lista de locações e paginação.
 */
export const listarLocacoes = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  return tratadorDeErros.executarOperacaoFirestore(async () => {
    let query = db.collection(COLLECTION_NAME).orderBy('dataCadastro', 'desc').limit(limite);

    // Aplicar filtros
    if (filtros.status) {
      validadores.status(filtros.status, VALID_STATUSES);
      query = query.where('status', '==', filtros.status);
    }

    if (filtros.clienteId) {
      query = query.where('clienteId', '==', validadores.cpf(filtros.clienteId));
    }

    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();
    const locacoes = snapshot.docs.map(LocacaoService.formatarLocacao);

    return {
      locacoes,
      ultimoDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
    };
  }, 'listar locações');
};

/**
 * Busca locação por ID.
 *
 * @param {string} id - ID da locação.
 * @returns {Promise<Object>} Locação encontrada.
 * @throws {ErroDeNegocio} Se a locação não for encontrada.
 */
export const buscarLocacaoPorId = async (id) => {
  return tratadorDeErros.executarOperacaoFirestore(async () => {
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();

    if (!doc.exists) {
      throw new ErroDeNegocio('Locação não encontrada', 'LOCACAO_NAO_ENCONTRADA');
    }

    return LocacaoService.formatarLocacao(doc);
  }, `buscar locação ${id}`);
};

/**
 * Atualiza locação com validações.
 *
 * @param {string} id - ID da locação.
 * @param {Object} updates - Campos a serem atualizados.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {ErroDeNegocio|ValidationError} Se houver erro de negócio ou validação.
 */
export const atualizarLocacao = async (id, updates) => {
  return tratadorDeErros
    .executarOperacaoFirestore(async () => {
      const locacaoRef = db.collection(COLLECTION_NAME).doc(id);

      return db.runTransaction(async (transaction) => {
        const locacaoDoc = await transaction.get(locacaoRef);

        if (!locacaoDoc.exists) {
          throw new ErroDeNegocio('Locação não encontrada', 'LOCACAO_NAO_ENCONTRADA');
        }

        const locacaoData = locacaoDoc.data();
        const updateData = { dataAtualizacao: formatadores.dataIso(new Date()) };

        // Validar e aplicar atualizações
        if (updates.dataFim !== undefined) {
          const dataFim = validadores.date(updates.dataFim, 'dataFim');
          updateData.dataFim = formatadores.dataIso(dataFim);
        }

        if (updates.valor !== undefined) {
          if (Number(updates.valor) <= 0) {
            throw new ValidationError('Valor deve ser maior que zero', 'valor');
          }
          updateData.valor = Number(updates.valor);
        }

        if (updates.status !== undefined) {
          const novoStatus = validadores.status(updates.status, VALID_STATUSES);
          updateData.status = novoStatus;

          // Atualizar status do veículo se necessário
          if (locacaoData.status === 'ativa' && ['concluida', 'cancelada'].includes(novoStatus)) {
            const veiculoRef = db.collection('veiculos').doc(locacaoData.veiculoId);
            transaction.update(veiculoRef, {
              status: 'disponivel',
              dataAtualizacao: formatadores.dataIso(new Date()),
            });
          }
        }

        if (updates.servicosAdicionaisIds !== undefined) {
          if (!Array.isArray(updates.servicosAdicionaisIds)) {
            throw new ValidationError(
              'Serviços adicionais devem ser um array de IDs',
              'servicosAdicionaisIds',
            );
          }
          updateData.servicosAdicionaisIds = updates.servicosAdicionaisIds;
        }

        // Verificar se há campos para atualizar
        const hasUpdates = Object.keys(updateData).length > 1;
        if (!hasUpdates) {
          throw new ValidationError('Nenhum campo válido fornecido para atualização');
        }

        transaction.update(locacaoRef, updateData);
      });

      return { success: true };
    }, `atualizar locação ${id}`)
    .catch((error) => tratadorDeErros.formatarRespostaDeErro(error));
};

/**
 * Exclui locação com verificações.
 *
 * @param {string} id - ID da locação.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {ErroDeNegocio} Se a locação não for encontrada.
 */
export const excluirLocacao = async (id) => {
  return tratadorDeErros
    .executarOperacaoFirestore(async () => {
      return db.runTransaction(async (transaction) => {
        const locacaoRef = db.collection(COLLECTION_NAME).doc(id);
        const locacaoDoc = await transaction.get(locacaoRef);

        if (!locacaoDoc.exists) {
          throw new ErroDeNegocio('Locação não encontrada', 'LOCACAO_NAO_ENCONTRADA');
        }

        const locacaoData = locacaoDoc.data();

        // Atualizar status do veículo se necessário
        if (['ativa', 'cancelada'].includes(locacaoData.status) && locacaoData.veiculoId) {
          const veiculoRef = db.collection('veiculos').doc(locacaoData.veiculoId);
          transaction.update(veiculoRef, {
            status: 'disponivel',
            dataAtualizacao: formatadores.dataIso(new Date()),
          });
        }

        transaction.delete(locacaoRef);
      });

      return { success: true };
    }, `excluir locação ${id}`)
    .catch((error) => tratadorDeErros.formatarRespostaDeErro(error));
};

/**
 * Histórico de locações por CPF do cliente.
 *
 * @param {string} cpf - CPF do cliente.
 * @returns {Promise<Object[]>} Lista de locações do cliente.
 */
export const historicoLocacoesCliente = async (cpf) => {
  return tratadorDeErros.executarOperacaoFirestore(async () => {
    const cpfValidado = validadores.cpf(cpf);

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('clienteId', '==', cpfValidado)
      .orderBy('dataInicio', 'desc')
      .get();

    return snapshot.docs.map(LocacaoService.formatarLocacao);
  }, `buscar histórico do cliente ${cpf}`);
};

/**
 * Histórico de locações por chassi do veículo.
 *
 * @param {string} chassi - Chassi do veículo.
 * @returns {Promise<Object[]>} Lista de locações do veículo.
 * @throws {ErroDeNegocio} Se o veículo não for encontrado.
 */
export const historicoLocacoesVeiculo = async (chassi) => {
  return tratadorDeErros.executarOperacaoFirestore(async () => {
    const veiculo = await buscarPorChassi(chassi);

    if (!veiculo) {
      throw new ErroDeNegocio('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
    }

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('veiculoId', '==', veiculo.id)
      .orderBy('dataInicio', 'desc')
      .get();

    return snapshot.docs.map(LocacaoService.formatarLocacao);
  }, `buscar histórico do veículo ${chassi}`);
};
