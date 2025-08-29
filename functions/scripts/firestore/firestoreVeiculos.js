import { db } from '../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Cadastra um novo veículo com:
 * - ID aleatório (UUID)
 * - Chassi como campo único imutável
 * - Placa como campo normal (atualizável)
 */
export const criarVeiculo = async (veiculoData) => {
  try {
    const id = uuidv4(); // ID aleatório universal
    const { chassi, placa } = veiculoData;

    // 1. Validar chassi único
    const chassiExistente = await db
      .collection('veiculos')
      .where('chassi', '==', chassi)
      .limit(1)
      .get();

    if (!chassiExistente.empty) {
      throw new Error('Chassi já cadastrado no sistema.');
    }

    // 2. Criar documento com estrutura completa
    await db
      .collection('veiculos')
      .doc(id)
      .set({
        // Identificação
        id, // UUID (redundante para facilidade em queries)
        chassi, // Campo único imutável
        placa: placa.replace(/-/g, ''), // Formato sem hífen

        // Dados técnicos (do Figma)
        modelo: veiculoData.modelo,
        cor: veiculoData.cor,
        marca: veiculoData.marca,
        renavam: veiculoData.renavam,
        anoModelo: {
          fabricacao: veiculoData.anoModelo.fabricacao,
          modelo: veiculoData.anoModelo.modelo,
        },

        // Histórico
        quilometragem: parseInt(veiculoData.quilometragem),
        quilometragemNaCompra: parseInt(veiculoData.quilometragemNaCompra || '0'),
        dataCompra: new Date(veiculoData.dataCompra).toISOString(),
        //dataVenda: veiculoData.dataVenda ? new Date(veiculoData.dataVenda).toISOString() : null,

        // Localização
        local: veiculoData.local,
        nome: veiculoData.nome,
        observacoes: veiculoData.observacoes,

        // Controle
        status: 'disponivel',
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      });

    return { success: true, id };
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca um  veículo pelo id
 */
export const buscaVeiculo = async (idVeiculo) => {
  try {
    // 1. Buscar veículo por id (campo único)
    const snapshot = await db.collection('veiculos').where('id', '==', idVeiculo).limit(1).get();

    if (snapshot.empty) {
      throw new Error('Veículo não encontrado.');
    }

    // 2. Localiza ID do veiculo
    const veiculoRef = snapshot.docs[0].ref;
    const veiculoDoc = await veiculoRef.get();
    const veiculoData = veiculoDoc.data();

    return { success: true,  veiculo:veiculoData};
  } catch (error) {
    console.error('Erro ao localizar id:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Atualiza um veículo no Firestore.
 * @param {string} idVeiculo - ID do veículo
 * @param {Object} updates - Campos a serem atualizados
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const atualizarVeiculo = async (idVeiculo, updates) => {
  try {
    if (!idVeiculo || !updates || Object.keys(updates).length === 0) {
      return { success: false, error: 'ID do veículo ou dados de atualização ausentes.' };
    }

    // Clonar o objeto para não alterar o original
    const updateData = { ...updates };

    // Transformações de tipos
    if (updateData.placa) updateData.placa = updateData.placa.replace(/-/g, '');
    if (updateData.quilometragem) updateData.quilometragem = parseInt(updateData.quilometragem);
    if (updateData.quilometragemNaCompra) updateData.quilometragemNaCompra = parseInt(updateData.quilometragemNaCompra);
    if (updateData.anoModelo?.fabricacao) updateData.anoModelo.fabricacao = parseInt(updateData.anoModelo.fabricacao);
    if (updateData.anoModelo?.modelo) updateData.anoModelo.modelo = parseInt(updateData.anoModelo.modelo);
    if (updateData.dataCompra) updateData.dataCompra = new Date(updateData.dataCompra).toISOString();


    await db.collection('veiculos').doc(idVeiculo).update({
      ...updateData,
      dataAtualizacao: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error(`Erro ao atualizar veículo ${idVeiculo}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca veículo por id (campo único)
 */
export const buscarPorId = async (idVeiculo) => {
  const snapshot = await db.collection('veiculos').where('id', '==', idVeiculo).limit(1).get();

  return snapshot.empty ? null : snapshot.docs[0].data();
};

/**
 * Lista veículos com paginação (startAfter)
 */
export const listarVeiculos = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  try {
    let query = db.collection('veiculos').limit(limite);

    if (!filtros.status && !filtros.placa && !filtros.marca && !filtros.modelo) {
      query = query.orderBy('placa');
    }

    // Aplicar filtros
    if (filtros.placa) {
      query = query.where('placa', '==', filtros.placa.replace(/-/g, ''));
    }

    if (filtros.status) {
      query = query.where('status', '==', filtros.status);
    }

    if (filtros.marca) {
      query = query.where('marca', '==', filtros.marca);
    }

    if (filtros.modelo) {
      query = query.where('modelo', '==', filtros.modelo);
    }

    // Paginação
    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();
    const veiculos = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    return {
      veiculos,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    throw error;
  }
};