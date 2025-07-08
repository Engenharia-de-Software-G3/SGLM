import { db } from '../../firebaseConfig';

/**
 * Cadastra um novo veículo no Firestore.
 * Valida chassi único e formata dados.
 */
export const criarVeiculo = async (veiculoData) => {
  try {
    const { placa, chassi } = veiculoData;
    const placaSemHifen = placa.replace(/-/g, '');

    // 1. Validar chassi único
    const chassiExistente = await db.collection('veiculos')
      .where('chassi', '==', chassi)
      .limit(1)
      .get();

    if (!chassiExistente.empty) {
      throw new Error('Chassi já cadastrado no sistema.');
    }

    // 2. Criar documento com estrutura completa
    await db.collection('veiculos').doc(placaSemHifen).set({
      // Identificação
      placa: placaSemHifen,
      chassi, // PK imutável
      renavam: veiculoData.renavam,
      numeroDocumento: veiculoData.numeroDocumento,

      // Dados técnicos
      modelo: veiculoData.modelo,
      marca: veiculoData.marca,
      anoModelo: {
        fabricacao: parseInt(veiculoData.anoFabricacao),
        modelo: parseInt(veiculoData.anoModelo)
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
      dataCadastro: new Date().toISOString()
    });

    return { success: true, id: placaSemHifen };

  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Atualiza a placa de um veículo (mantendo chassi imutável).
 * Cria novo documento e deleta o antigo.
 */
export const atualizarPlaca = async (chassi, novaPlaca) => {
  try {
    const novaPlacaSemHifen = novaPlaca.replace(/-/g, '');

    // 1. Buscar veículo por chassi
    const snapshot = await db.collection('veiculos')
      .where('chassi', '==', chassi)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error('Veículo não encontrado.');
    }

    // 2. Transação em lote para garantir atomicidade
    const batch = db.batch();
    const veiculoAntigo = snapshot.docs[0];
    const veiculoRefNovo = db.collection('veiculos').doc(novaPlacaSemHifen);

    // Copia todos os campos, atualiza placa e mantém chassi
    batch.set(veiculoRefNovo, {
      ...veiculoAntigo.data(),
      placa: novaPlacaSemHifen,
      dataAtualizacao: new Date().toISOString() // Novo campo de auditoria
    });

    // Remove documento antigo
    batch.delete(veiculoAntigo.ref);

    await batch.commit();
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
    const snapshot = await db.collection('veiculos')
      .where('chassi', '==', chassi)
      .limit(1)
      .get();

    if (snapshot.empty) throw new Error('Veículo não encontrado.');

    await snapshot.docs[0].ref.update({
      status: 'vendido',
      dataVenda: new Date(dataVenda).toISOString()
    });

    return { success: true };

  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca veículo por chassi (PK imutável)
 */
export const buscarPorChassi = async (chassi) => {
  const snapshot = await db.collection('veiculos')
    .where('chassi', '==', chassi)
    .limit(1)
    .get();

  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};