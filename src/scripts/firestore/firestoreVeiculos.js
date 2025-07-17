import { db } from '../../../firebaseConfig.js';
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
        marca: veiculoData.marca,
        renavam: veiculoData.renavam,
        numeroDocumento: veiculoData.numeroDocumento,
        anoModelo: {
          fabricacao: parseInt(veiculoData.anoFabricacao),
          modelo: parseInt(veiculoData.anoModelo),
        },

        // Histórico
        quilometragem: parseInt(veiculoData.quilometragem),
        quilometragemNaCompra: parseInt(veiculoData.quilometragemNaCompra || '0'),
        dataCompra: new Date(veiculoData.dataCompra).toISOString(),
        dataVenda: veiculoData.dataVenda ? new Date(veiculoData.dataVenda).toISOString() : null,

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
 * Atualiza a placa de um veículo (via chassi)
 */
export const atualizarPlaca = async (chassi, novaPlaca) => {
  try {
    // 1. Buscar veículo por chassi (campo único)
    const snapshot = await db.collection('veiculos').where('chassi', '==', chassi).limit(1).get();

    if (snapshot.empty) {
      throw new Error('Veículo não encontrado.');
    }

    // 2. Atualizar apenas a placa (ID do documento permanece o mesmo)
    const veiculoRef = snapshot.docs[0].ref;
    await veiculoRef.update({
      placa: novaPlaca.replace(/-/g, ''),
      dataAtualizacao: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar placa:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Registra venda de veículo (atualiza status e dataVenda)
 */
export const registrarVenda = async (chassi, dataVenda) => {
  try {
    const snapshot = await db.collection('veiculos').where('chassi', '==', chassi).limit(1).get();

    if (snapshot.empty) throw new Error('Veículo não encontrado.');

    await snapshot.docs[0].ref.update({
      status: 'vendido',
      dataVenda: new Date(dataVenda).toISOString(),
      dataAtualizacao: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca veículo por chassi (campo único)
 */
export const buscarPorChassi = async (chassi) => {
  const snapshot = await db.collection('veiculos').where('chassi', '==', chassi).limit(1).get();

  return snapshot.empty ? null : snapshot.docs[0].data();
};

/**
 * Lista veículos com paginação (startAfter)
 */
export const listarVeiculos = async ({ limite = 10, ultimoDoc = null, filtros = {} }) => {
  try {
    let query = db.collection('veiculos').orderBy('placa').limit(limite);

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

    // Paginação
    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();
    const veiculos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Garantir que datas sejam formatadas como strings ISO
      dataCadastro: doc.data().dataCadastro?.toISOString(),
      dataAtualizacao: doc.data().dataAtualizacao?.toISOString()
    }));

    return {
      veiculos,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };

  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    throw error;
  }
};
