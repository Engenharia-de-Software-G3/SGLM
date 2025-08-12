// rent.js
import { db } from '../../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Cadastra uma nova locação
 * @param {Object} locacaoData - Dados da locação
 * @param {string} locacaoData.cpfLocatario - CPF do cliente (formato: 'XXX.XXX.XXX-XX')
 * @param {string} locacaoData.nomeLocatario - Nome do locatário
 * @param {string} locacaoData.placaVeiculo - Placa do veículo (formato: 'XXXX-XXXX')
 * @param {string} locacaoData.dataInicio - Data de início (formato: 'DD/MM/YYYY')
 * @param {string} locacaoData.dataFim - Data de término (formato: 'DD/MM/YYYY')
 * @param {number} locacaoData.valor - Valor da locação em reais
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const criarLocacao = async (locacaoData) => {
  try {
    console.log('Iniciando criação de locação com dados:', locacaoData);
    const { cpfLocatario, nomeLocatario, placaVeiculo, dataInicio, dataFim, valor } = locacaoData;

    // 1. Validar cliente e verificar se o nome corresponde ao CPF
    console.log('Buscando cliente com CPF:', cpfLocatario);
    const clienteRef = db.collection('clientes').doc(cpfLocatario);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      console.log('Cliente não encontrado para CPF:', cpfLocatario);
      throw new Error('CPF inválido');
    }

    const clienteData = clienteDoc.data();
    console.log('Cliente encontrado:', clienteData);
    
    // Verificar se o nome fornecido corresponde ao nome cadastrado
    console.log('Comparando nomes:', {
      nomeCadastrado: clienteData.nomeCompleto.toLowerCase(),
      nomeFornecido: nomeLocatario.toLowerCase()
    });
    
    if (clienteData.nomeCompleto.toLowerCase() !== nomeLocatario.toLowerCase()) {
      throw new Error('Nome não corresponde ao CPF informado');
    }

    // 2. Validar veículo
    const placaFormatada = placaVeiculo.replace(/-/g, '');
    console.log('Buscando veículo com placa:', placaFormatada);
    
    const veiculosSnapshot = await db
      .collection('veiculos')
      .where('placa', '==', placaFormatada)
      .limit(1)
      .get();

    console.log('Resultado da busca:', veiculosSnapshot.empty ? 'Nenhum veículo encontrado' : 'Veículo encontrado');

    if (veiculosSnapshot.empty) {
      // Vamos listar todos os veículos para debug
      const todosVeiculos = await db.collection('veiculos').get();
      console.log('Veículos cadastrados no sistema:');
      todosVeiculos.docs.forEach(doc => {
        const veiculo = doc.data();
        console.log(`- Placa: "${veiculo.placa}", Status: ${veiculo.status}`);
      });
      throw new Error('Veículo não encontrado');
    }

    const veiculoDoc = veiculosSnapshot.docs[0];
    const veiculoData = veiculoDoc.data();

    if (veiculoData.status !== 'disponivel') {
      throw new Error('Veículo não está disponível para locação');
    }

    // 3. Converter datas
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    // 4. Criar ID da locação
    const id = uuidv4();

    // 5. Criar documento de locação
    await db
      .collection('locacoes')
      .doc(id)
      .set({
        id,
        clienteId: cpfLocatario,
        nomeLocatario: nomeLocatario,
        veiculoId: veiculoDoc.id,
        placaVeiculo: placaFormatada,
        dataInicio: parseDate(dataInicio).toISOString(),
        dataFim: parseDate(dataFim).toISOString(),
        valor: Number(valor),
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
 * @param {string} [params.ultimoDoc] - ID do último documento para paginação
 * @returns {Promise<{locacoes: Array<Object>, ultimoDoc: string|null}>}
 */
export const listarLocacoes = async ({ limite = 10, ultimoDoc = null }) => {
  try {
    let query = db.collection('locacoes').orderBy('dataCadastro', 'desc').limit(limite);

    if (ultimoDoc) {
      const lastDoc = await db.collection('locacoes').doc(ultimoDoc).get();
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    const locacoes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dataInicio: formatDate(doc.data().dataInicio),
      dataFim: formatDate(doc.data().dataFim),
    }));

    return {
      locacoes,
      ultimoDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1].id : null,
    };
  } catch (error) {
    console.error('Erro ao listar locações:', error);
    throw error;
  }
};

/**
 * Atualiza uma locação existente
 * @param {string} id - ID da locação
 * @param {Object} locacaoData - Dados da locação para atualização
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const atualizarLocacao = async (id, locacaoData) => {
  try {
    const locacaoRef = db.collection('locacoes').doc(id);
    const locacaoDoc = await locacaoRef.get();

    if (!locacaoDoc.exists) {
      throw new Error('Locação não encontrada');
    }

    const updateData = { ...locacaoData, dataAtualizacao: new Date().toISOString() };

    // Handle date formatting if provided
    if (updateData.dataInicio) {
      updateData.dataInicio = parseDate(updateData.dataInicio).toISOString();
    }
    if (updateData.dataFim) {
      updateData.dataFim = parseDate(updateData.dataFim).toISOString();
    }

    await locacaoRef.update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar locação:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Exclui uma locação
 * @param {string} id - ID da locação
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const excluirLocacao = async (id) => {
  try {
    const locacaoRef = db.collection('locacoes').doc(id);
    const locacaoDoc = await locacaoRef.get();

    if (!locacaoDoc.exists) {
      throw new Error('Locação não encontrada');
    }

    const locacaoData = locacaoDoc.data();

    // Update the vehicle status back to 'disponivel' if the rental was active
    if (locacaoData.status === 'ativa' && locacaoData.veiculoId) {
      const veiculoRef = db.collection('veiculos').doc(locacaoData.veiculoId);
      await veiculoRef.update({
        status: 'disponivel',
        dataAtualizacao: new Date().toISOString(),
      });
    }

    // Delete the rental document
    await locacaoRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir locação:', error);
    return { success: false, error: error.message };
  }
};

// Função auxiliar para formatar data (DD/MM/YYYY)
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return [
    date.getDate().toString().padStart(2, '0'),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getFullYear(),
  ].join('/');
};

// Helper function to parse DD/MM/YYYY string to Date object
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`);
};
