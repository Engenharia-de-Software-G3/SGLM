import { db } from '../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

export const criarVeiculo = async (veiculoData) => {
  try {
    const id = uuidv4(); 
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
        id, 
        chassi,
        placa: placa.replace(/-/g, ''), 

        modelo: veiculoData.modelo,
        cor: veiculoData.cor,
        marca: veiculoData.marca,
        renavam: veiculoData.renavam,
        anoModelo: {
          fabricacao: veiculoData.anoModelo.fabricacao,
          modelo: veiculoData.anoModelo.modelo,
        },

        quilometragem: parseInt(veiculoData.quilometragem),
        quilometragemNaCompra: parseInt(veiculoData.quilometragemNaCompra || '0'),
        dataCompra: new Date(veiculoData.dataCompra).toISOString(),
        //dataVenda: veiculoData.dataVenda ? new Date(veiculoData.dataVenda).toISOString() : null,

        local: veiculoData.local,
        nome: veiculoData.nome,
        observacoes: veiculoData.observacoes,

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

    // 1. Buscar veículo pelo campo 'id' (igual à função buscarPorId)
    const snapshot = await db.collection('veiculos').where('id', '==', idVeiculo).limit(1).get();

    if (snapshot.empty) {
      return { success: false, error: 'Veículo não encontrado.' };
    }

    // 2. Obter a referência do documento encontrado
    const veiculoDocRef = snapshot.docs[0].ref;

    // Clonar o objeto para não alterar o original
    const updateData = { ...updates };

    // Transformações de tipos
    if (updateData.placa) updateData.placa = updateData.placa.replace(/-/g, '');
    if (updateData.quilometragem) updateData.quilometragem = parseInt(updateData.quilometragem);
    if (updateData.quilometragemNaCompra) updateData.quilometragemNaCompra = parseInt(updateData.quilometragemNaCompra);
    if (updateData.anoModelo?.fabricacao) updateData.anoModelo.fabricacao = parseInt(updateData.anoModelo.fabricacao);
    if (updateData.anoModelo?.modelo) updateData.anoModelo.modelo = parseInt(updateData.anoModelo.modelo);
    if (updateData.dataCompra) updateData.dataCompra = new Date(updateData.dataCompra).toISOString();

    // 3. Atualizar usando a referência do documento correto
    await veiculoDocRef.update({
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

/**
 * Listar quilometragem de um veículo específico
 * @param {string} chassi - Chassi do veículo
 * @returns {Promise<number|null>} - Retorna a quilometragem do veículo ou null se não encontrado
 * @throws {Error} Em caso de erro no Firestore
 */
export const listarQuilometragemVeiculo = async (chassi) => {
  try {
    const veiculo = await buscarPorChassi(chassi);

    if (!veiculo) return null;

    return veiculo.quilometragem;
  } catch (error) {
    console.error('Erro ao buscar quilometragem:', error);
    throw error;
  }
};

/**
 * Atualizar a quilometragem do veículo pelo chassi
 * @param {string} chassi - Chassi do veículo
 * @param {number} quilometragem - Nova quilometragem do veículo
 * @returns {Promise<{success: boolean, error?: string}>}
 * @throws {Error} Em caso de erro no Firestore
 */
export const atualizarQuilometragemVeiculo = async (chassi, quilometragem) => {
  try {
    const snapshot = await db.collection('veiculos').where('chassi', '==', chassi).limit(1).get();

    if (snapshot.empty) {
      return { success: false, error: 'Veículo não encontrado.' };
    }

    const docId = snapshot.docs[0].id;

    await db.collection('veiculos').doc(docId).update({ quilometragem });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro ao atualizar quilometragem:', error);
    return { success: false, error: error.message };
  }
};
