import { db } from '../../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { buscarPorChassi } from './firestoreVeiculos.js'; // Assuming you have this function to find vehicle by chassi

/**
 * Cadastra uma nova locação
 * @param {Object} locacaoData - Dados da locação
 * @param {string} locacaoData.cpfLocatario - CPF do cliente (obrigatório, formato: 'XXX.XXX.XXX-XX')
 * @param {string} locacaoData.placaVeiculo - Placa do veículo (obrigatório, formato: 'XXXX-XXXX')
 * @param {string} locacaoData.dataInicio - Data de início (obrigatório, formato: 'DD/MM/YYYY')
 * @param {string} locacaoData.dataFim - Data de término (obrigatório, formato: 'DD/MM/YYYY')
 * @param {number} locacaoData.valor - Valor da locação em reais (obrigatório)
 * @param {Array<string>} [locacaoData.servicosAdicionaisIds] - IDs de serviços adicionais (opcional)
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const criarLocacao = async (locacaoData) => {
  try {
    const { cpfLocatario, placaVeiculo, dataInicio, dataFim, valor, servicosAdicionaisIds } =
      locacaoData;

    // 1. Validar cliente
    const clienteRef = db.collection('clientes').doc(cpfLocatario);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      throw new Error('Cliente não encontrado');
    }

    // 2. Validar veículo
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

    if (veiculoData.status !== 'disponivel') {
      throw new Error('Veículo não está disponível para locação');
    }

    // 3. Converter datas
    const parsedDataInicio = parseDate(dataInicio);
    const parsedDataFim = parseDate(dataFim);

    if (isNaN(parsedDataInicio.getTime()) || isNaN(parsedDataFim.getTime())) {
      throw new Error('Formato de data inválido. Use DD/MM/YYYY.');
    }
    if (parsedDataInicio > parsedDataFim) {
      throw new Error('Data de início não pode ser após a data de término.');
    }

    // 4. Criar ID da locação
    const id = uuidv4();

    // 5. Criar documento de locação
    await db
      .collection('locacoes')
      .doc(id)
      .set({
        id,
        clienteId: cpfLocatario,
        veiculoId: veiculoDoc.id,
        placaVeiculo: placaFormatada,
        dataInicio: parsedDataInicio.toISOString(),
        dataFim: parsedDataFim.toISOString(),
        valor: Number(valor), // Ensure value is stored as a number
        servicosAdicionaisIds: servicosAdicionaisIds || [], // Add optional services
        status: 'ativa',
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      });

    // 6. Atualizar status do veículo
    await veiculoDoc.ref.update({
      status: 'alugado',
      dataAtualizacao: new Date().toISOString(),
    });

    return { success: true, id };
  } catch (error) {
    console.error('Erro ao criar locação:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Lista locações com paginação
 * @param {Object} params
 * @param {number} [params.limite=10] - Limite de resultados
 * @param {firebase.firestore.DocumentSnapshot} [params.ultimoDoc] - Último documento para paginação (para startAfter)
 * @param {Object} [params.filtros] - Filtros opcionais (ex: { status: 'ativa' })
 * @returns {Promise<{locacoes: Array<Object>, ultimoDoc: firebase.firestore.DocumentSnapshot|null}>}
 */
export const listarLocacoes = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  try {
    let query = db.collection('locacoes').orderBy('dataCadastro', 'desc').limit(limite);

    if (filtros.status) {
      query = query.where('status', '==', filtros.status);
    }

    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();
    const locacoes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataInicio: formatDate(doc.data().dataInicio),
      dataFim: formatDate(doc.data().dataFim),
      dataCadastro: formatDate(doc.data().dataCadastro),
      dataAtualizacao: formatDate(doc.data().dataAtualizacao),
    }));

    return {
      locacoes,
      ultimoDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
    };
  } catch (error) {
    console.error('Erro ao listar locações:', error);
    throw error;
  }
};

/**
 * Busca uma locação por ID.
 * @param {string} id - ID da locação
 * @returns {Promise<Object|null>} - Retorna o objeto da locação ou null se não encontrada
 */
export const buscarLocacaoPorId = async (id) => {
  try {
    const doc = await db.collection('locacoes').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      dataInicio: formatDate(data.dataInicio),
      dataFim: formatDate(data.dataFim),
      dataCadastro: formatDate(data.dataCadastro),
      dataAtualizacao: formatDate(data.dataAtualizacao),
    };
  } catch (error) {
    console.error(`Erro ao buscar locação ${id}:`, error);
    throw error;
  }
};

/**
 * Atualiza uma locação existente.
 * Permite atualizar dataFim, valor, status, e servicosAdicionaisIds.
 * Se o status for alterado para 'concluida', atualiza o status do veículo para 'disponivel'.
 * @param {string} id - ID da locação a ser atualizada
 * @param {Object} updates - Objeto com os campos a serem atualizados
 * @param {string} [updates.dataFim] - Nova data de término (formato: 'DD/MM/YYYY')
 * @param {number} [updates.valor] - Novo valor da locação
 * @param {'ativa'|'concluida'|'cancelada'} [updates.status] - Novo status da locação
 * @param {Array<string>} [updates.servicosAdicionaisIds] - IDs atualizados de serviços adicionais
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const atualizarLocacao = async (id, updates) => {
  try {
    const locacaoRef = db.collection('locacoes').doc(id);
    const locacaoDoc = await locacaoRef.get();

    if (!locacaoDoc.exists) {
      return { success: false, error: 'Locação não encontrada' };
    }

    const locacaoData = locacaoDoc.data();
    const updateData = {};

    if (updates.dataFim !== undefined) {
      const parsedDataFim = parseDate(updates.dataFim);
      if (isNaN(parsedDataFim.getTime())) {
        return { success: false, error: 'Formato de data de término inválido. Use DD/MM/YYYY.' };
      }
      updateData.dataFim = parsedDataFim.toISOString();
    }

    if (updates.valor !== undefined) {
      if (isNaN(Number(updates.valor))) {
        return { success: false, error: 'Valor inválido.' };
      }
      updateData.valor = Number(updates.valor);
    }

    if (updates.status !== undefined) {
      const validStatuses = ['ativa', 'concluida', 'cancelada'];
      if (!validStatuses.includes(updates.status)) {
        return {
          success: false,
          error: `Status inválido. Use um dos seguintes: ${validStatuses.join(', ')}.`,
        };
      }
      updateData.status = updates.status;

      if (
        locacaoData.status === 'ativa' &&
        updates.status === 'concluida' &&
        locacaoData.veiculoId
      ) {
        const veiculoRef = db.collection('veiculos').doc(locacaoData.veiculoId);
        await veiculoRef.update({
          status: 'disponivel',
          dataAtualizacao: new Date().toISOString(),
        });
      }

      if (
        locacaoData.status === 'ativa' &&
        updates.status === 'cancelada' &&
        locacaoData.veiculoId
      ) {
        const veiculoRef = db.collection('veiculos').doc(locacaoData.veiculoId);
        await veiculoRef.update({
          status: 'disponivel',
          dataAtualizacao: new Date().toISOString(),
        });
      }
    }

    if (updates.servicosAdicionaisIds !== undefined) {
      if (!Array.isArray(updates.servicosAdicionaisIds)) {
        return { success: false, error: 'Serviços adicionais devem ser um array de IDs.' };
      }
      updateData.servicosAdicionaisIds = updates.servicosAdicionaisIds;
    }

    updateData.dataAtualizacao = new Date().toISOString();

    if (
      Object.keys(updateData).length > 1 ||
      (Object.keys(updateData).length === 1 && !updateData.hasOwnProperty('dataAtualizacao'))
    ) {
      await locacaoRef.update(updateData);
    } else {
      return { success: false, error: 'Nenhum campo válido fornecido para atualização.' };
    }

    return { success: true };
  } catch (error) {
    console.error(`Erro ao atualizar locação ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Exclui uma locação
 * Se a locação for ativa, atualiza o status do veículo de volta para 'disponivel'.
 * @param {string} id - ID da locação
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const excluirLocacao = async (id) => {
  try {
    const locacaoRef = db.collection('locacoes').doc(id);
    const locacaoDoc = await locacaoRef.get();

    if (!locacaoDoc.exists) {
      return { success: false, error: 'Locação não encontrada' };
    }

    const locacaoData = locacaoDoc.data();

    // Update the vehicle status back to 'disponivel' if the rental was active or cancelled
    if (['ativa', 'cancelada'].includes(locacaoData.status) && locacaoData.veiculoId) {
      const veiculoRef = db.collection('veiculos').doc(locacaoData.veiculoId);
      await veiculoRef.update({
        status: 'disponivel',
        dataAtualizacao: new Date().toISOString(),
      });
    }

    await locacaoRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir locação:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém o histórico de locações de um veículo pelo seu chassi.
 * @param {string} chassi - O chassi do veículo
 * @returns {Promise<Array<Object>>} Uma Promessa que resolve com um array de locações.
 */
export const historicoLocacoesVeiculo = async (chassi) => {
  try {
    const veiculo = await buscarPorChassi(chassi);

    if (!veiculo) {
      console.warn(`Veículo com chassi ${chassi} não encontrado.`);
      return [];
    }

    const veiculoId = veiculo.id;

    const snapshot = await db
      .collection('locacoes')
      .where('veiculoId', '==', veiculoId)
      .orderBy('dataInicio', 'desc')
      .get();

    const locacoes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dataInicio: formatDate(data.dataInicio),
        dataFim: formatDate(data.dataFim),
        dataCadastro: formatDate(data.dataCadastro),
        dataAtualizacao: formatDate(data.dataAtualizacao),
      };
    });

    return locacoes;
  } catch (error) {
    console.error(`Erro ao obter histórico de locações para o veículo ${chassi}:`, error);
    throw error;
  }
};

/**
 * Obtém o histórico de locações de um cliente pelo seu CPF.
 * @param {string} cpf - O CPF do cliente
 * @returns {Promise<Array<Object>>} Uma Promessa que resolve com um array de locações.
 */
export const historicoLocacoesCliente = async (cpf) => {
  try {
    const snapshot = await db
      .collection('locacoes')
      .where('clienteId', '==', cpf)
      .orderBy('dataInicio', 'desc')
      .get();

    const locacoes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Format dates for the response
        dataInicio: formatDate(data.dataInicio),
        dataFim: formatDate(data.dataFim),
        dataCadastro: formatDate(data.dataCadastro),
        dataAtualizacao: formatDate(data.dataAtualizacao),
      };
    });

    return locacoes;
  } catch (error) {
    console.error(`Erro ao obter histórico de locações para o cliente ${cpf}:`, error);
    throw error;
  }
};

const formatDate = (isoString) => {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string provided to formatDate: ${isoString}`);
      return isoString;
    }
    return [
      date.getDate().toString().padStart(2, '0'),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getFullYear(),
    ].join('/');
  } catch (e) {
    console.error(`Error formatting date ${isoString}:`, e);
    return isoString;
  }
};

const parseDate = (dateStr) => {
  if (!dateStr) return new Date('Invalid Date');
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    return new Date('Invalid Date');
  }
  const [day, month, year] = parts;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date;
};
