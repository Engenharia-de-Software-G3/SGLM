import { db } from '../../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { validators, formatters } from './validators.js';
import { errorHandler, BusinessError } from './errorHandler.js';
import { COLLECTIONS, STATUS, PAGINATION } from './constants.js';

const COLLECTION_NAME = COLLECTIONS.VEICULOS;
const VALID_STATUSES = Object.values(STATUS.VEICULO);

class VeiculoService {
  /**
   * Valida dados básicos do veículo.
   *
   * @param {Object} veiculoData - Dados do veículo.
   * @returns {Object} Dados do veículo validados e normalizados.
   * @throws {ValidationError} Se algum campo obrigatório estiver ausente ou inválido.
   */
  static validateVeiculoData(veiculoData) {
    const campos = ['chassi', 'placa', 'modelo', 'marca', 'renavam', 'quilometragem'];
    const camposFaltantes = campos.filter((campo) => !veiculoData[campo]);

    if (camposFaltantes.length > 0) {
      throw new ValidationError(`Campos obrigatórios: ${camposFaltantes.join(', ')}`);
    }

    // Validar chassi (17 caracteres alfanuméricos)
    const chassi = veiculoData.chassi.toUpperCase().trim();
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(chassi)) {
      throw new ValidationError('Chassi deve ter 17 caracteres alfanuméricos válidos', 'chassi');
    }

    // Validar placa
    const placaValidada = validators.placa(veiculoData.placa);

    // Validar RENAVAM (11 dígitos)
    const renavam = veiculoData.renavam.replace(/[^\d]/g, '');
    if (renavam.length !== 11) {
      throw new ValidationError('RENAVAM deve ter 11 dígitos', 'renavam');
    }

    // Validar quilometragem
    const quilometragem = Number(veiculoData.quilometragem);
    if (isNaN(quilometragem) || quilometragem < 0) {
      throw new ValidationError('Quilometragem deve ser um número positivo', 'quilometragem');
    }

    // Validar anos
    const anoAtual = new Date().getFullYear();
    const anoFabricacao = Number(veiculoData.anoFabricacao);
    const anoModelo = Number(veiculoData.anoModelo);

    if (anoFabricacao < 1950 || anoFabricacao > anoAtual + 1) {
      throw new ValidationError('Ano de fabricação inválido', 'anoFabricacao');
    }

    if (anoModelo < anoFabricacao || anoModelo > anoAtual + 1) {
      throw new ValidationError('Ano do modelo inválido', 'anoModelo');
    }

    return {
      chassi,
      placa: placaValidada,
      modelo: veiculoData.modelo.trim(),
      marca: veiculoData.marca.trim(),
      renavam,
      quilometragem,
      anoFabricacao,
      anoModelo,
      numeroDocumento: veiculoData.numeroDocumento?.trim() || '',
      quilometragemNaCompra: Number(veiculoData.quilometragemNaCompra || 0),
      local: veiculoData.local?.trim() || '',
      nome: veiculoData.nome?.trim() || '',
      observacoes: veiculoData.observacoes?.trim() || '',
    };
  }

  /**
   * Valida data de compra.
   *
   * @param {string|Date} dataCompra - Data de compra do veículo.
   * @returns {Date} Data de compra validada.
   * @throws {ValidationError} Se a data for inválida ou futura.
   */
  static validateDataCompra(dataCompra) {
    if (!dataCompra) {
      throw new ValidationError('Data de compra é obrigatória', 'dataCompra');
    }

    const data = new Date(dataCompra);
    if (isNaN(data.getTime())) {
      throw new ValidationError('Data de compra inválida', 'dataCompra');
    }

    const hoje = new Date();
    if (data > hoje) {
      throw new ValidationError('Data de compra não pode ser futura', 'dataCompra');
    }

    return data;
  }

  /**
   * Verifica se chassi já existe.
   *
   * @param {string} chassi - Chassi do veículo.
   * @returns {Promise<boolean>} True se já existe, False caso contrário.
   */
  static async verificarChassiExistente(chassi) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('chassi', '==', chassi)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  /**
   * Verifica se placa já existe em outro veículo.
   *
   * @param {string} placa - Placa do veículo.
   * @param {string|null} [excluirChassi=null] - Chassi a ser excluído da verificação (para update).
   * @returns {Promise<boolean>} True se já existe, False caso contrário.
   */
  static async verificarPlacaExistente(placa, excluirChassi = null) {
    let query = db
      .collection(COLLECTION_NAME)
      .where('placa', '==', placa)
      .where('status', '!=', STATUS.VEICULO.VENDIDO);

    const snapshot = await query.get();

    // Se está excluindo um chassi específico (para atualização)
    if (excluirChassi) {
      return snapshot.docs.some((doc) => doc.data().chassi !== excluirChassi);
    }

    return !snapshot.empty;
  }

  /**
   * Formata veículo para resposta.
   *
   * @param {import('firebase').firestore.DocumentSnapshot} doc - Documento do veículo.
   * @returns {Object} Veículo formatado.
   */
  static formatarVeiculo(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      placa: formatters.placaToDisplay(data.placa),
      dataCompra: data.dataCompra ? formatters.dateToDisplay(data.dataCompra) : null,
      dataVenda: data.dataVenda ? formatters.dateToDisplay(data.dataVenda) : null,
      dataCadastro: formatters.dateToDisplay(data.dataCadastro),
      dataAtualizacao: formatters.dateToDisplay(data.dataAtualizacao),
    };
  }

  /**
   * Busca veículo por campo específico.
   *
   * @param {string} campo - Nome do campo.
   * @param {string} valor - Valor do campo.
   * @returns {Promise<{doc: import('firebase').firestore.DocumentSnapshot, data: Object}|null>}
   *   Documento e dados do veículo, ou null se não encontrado.
   */
  static async buscarPorCampo(campo, valor) {
    const snapshot = await db.collection(COLLECTION_NAME).where(campo, '==', valor).limit(1).get();

    return snapshot.empty
      ? null
      : {
          doc: snapshot.docs[0],
          data: snapshot.docs[0].data(),
        };
  }

  /**
   * Calcula depreciação estimada.
   *
   * @param {number} anoFabricacao - Ano de fabricação.
   * @param {number} quilometragem - Quilometragem atual.
   * @param {number|null} [valorCompra=null] - Valor de compra.
   * @returns {Object} Estatísticas de depreciação.
   */
  static calcularDepreciacao(anoFabricacao, quilometragem, valorCompra = null) {
    const anoAtual = new Date().getFullYear();
    const idade = anoAtual - anoFabricacao;

    // Fórmula simplificada de depreciação
    let fatorIdade = Math.max(0, 1 - idade * 0.1); // 10% ao ano
    let fatorKm = Math.max(0, 1 - quilometragem / 1000000); // Fator baseado em 1M km

    const depreciacao = 1 - fatorIdade * fatorKm;

    return {
      idade,
      fatorIdade: Math.round(fatorIdade * 100),
      fatorKm: Math.round(fatorKm * 100),
      depreciacaoPercentual: Math.round(depreciacao * 100),
      valorEstimado: valorCompra ? Math.round(valorCompra * (1 - depreciacao)) : null,
    };
  }
}

/**
 * Cadastra um novo veículo com validações aprimoradas.
 *
 * @param {Object} veiculoData - Dados do veículo a ser cadastrado.
 * @returns {Promise<Object>} Objeto com sucesso e id do veículo.
 * @throws {BusinessError|ValidationError} Se houver erro de negócio ou validação.
 */
export const criarVeiculo = async (veiculoData) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      // 1. Validar dados de entrada
      const dadosValidados = VeiculoService.validateVeiculoData(veiculoData);
      const dataCompraValidada = VeiculoService.validateDataCompra(veiculoData.dataCompra);

      // 2. Verificar unicidade do chassi
      const chassiExiste = await VeiculoService.verificarChassiExistente(dadosValidados.chassi);
      if (chassiExiste) {
        throw new BusinessError('Chassi já cadastrado no sistema', 'CHASSI_JA_EXISTE');
      }

      // 3. Verificar se placa já está em uso
      const placaExiste = await VeiculoService.verificarPlacaExistente(dadosValidados.placa);
      if (placaExiste) {
        throw new BusinessError('Placa já está em uso por outro veículo', 'PLACA_JA_EXISTE');
      }

      // 4. Criar veículo
      const id = uuidv4();
      const agora = new Date();

      await db
        .collection(COLLECTION_NAME)
        .doc(id)
        .set({
          // Identificação
          id,
          chassi: dadosValidados.chassi,
          placa: dadosValidados.placa,

          // Dados técnicos
          modelo: dadosValidados.modelo,
          marca: dadosValidados.marca,
          renavam: dadosValidados.renavam,
          numeroDocumento: dadosValidados.numeroDocumento,
          anoModelo: {
            fabricacao: dadosValidados.anoFabricacao,
            modelo: dadosValidados.anoModelo,
          },

          // Histórico
          quilometragem: dadosValidados.quilometragem,
          quilometragemNaCompra: dadosValidados.quilometragemNaCompra,
          dataCompra: formatters.dateToISO(dataCompraValidada),
          dataVenda: null,

          // Localização e observações
          local: dadosValidados.local,
          nome: dadosValidados.nome,
          observacoes: dadosValidados.observacoes,

          // Controle
          status: STATUS.VEICULO.DISPONIVEL,
          dataCadastro: formatters.dateToISO(agora),
          dataAtualizacao: formatters.dateToISO(agora),
        });

      return { success: true, id };
    }, 'criar veículo')
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Lista veículos com filtros e paginação aprimorados.
 *
 * @param {Object} params - Parâmetros de listagem.
 * @param {number} [params.limite] - Limite de veículos.
 * @param {Object} [params.ultimoDoc] - Último documento para paginação.
 * @param {Object} [params.filtros] - Filtros de busca.
 * @param {boolean} [params.incluirEstatisticas] - Se deve incluir estatísticas de depreciação.
 * @returns {Promise<Object>} Lista de veículos e paginação.
 */
export const listarVeiculos = async ({
  limite = PAGINATION.DEFAULT_LIMIT,
  ultimoDoc = null,
  filtros = {},
  incluirEstatisticas = false,
}) => {
  return errorHandler.handleFirestoreOperation(async () => {
    // Validar limite
    const limiteValidado = Math.min(Math.max(1, Number(limite)), PAGINATION.MAX_LIMIT);

    let query = db
      .collection(COLLECTION_NAME)
      .orderBy('marca')
      .orderBy('modelo')
      .limit(limiteValidado);

    // Aplicar filtros
    if (filtros.placa) {
      const placaValidada = validators.placa(filtros.placa);
      query = query.where('placa', '==', placaValidada);
    }

    if (filtros.status) {
      validators.status(filtros.status, VALID_STATUSES);
      query = query.where('status', '==', filtros.status);
    }

    if (filtros.marca) {
      query = query.where('marca', '==', filtros.marca.trim());
    }

    if (filtros.modelo) {
      query = query.where('modelo', '==', filtros.modelo.trim());
    }

    if (filtros.anoFabricacao) {
      const ano = Number(filtros.anoFabricacao);
      query = query.where('anoModelo.fabricacao', '==', ano);
    }

    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snapshot = await query.get();

    let veiculos = snapshot.docs.map(VeiculoService.formatarVeiculo);

    // Incluir estatísticas se solicitado
    if (incluirEstatisticas && veiculos.length > 0) {
      veiculos = veiculos.map((veiculo) => {
        const estatisticas = VeiculoService.calcularDepreciacao(
          veiculo.anoModelo.fabricacao,
          veiculo.quilometragem,
        );
        return { ...veiculo, estatisticas };
      });
    }

    return {
      veiculos,
      total: snapshot.size,
      ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }, 'listar veículos');
};

/**
 * Busca veículo por chassi.
 *
 * @param {string} chassi - Chassi do veículo.
 * @returns {Promise<Object>} Veículo encontrado.
 * @throws {BusinessError|ValidationError} Se não encontrado ou inválido.
 */
export const buscarPorChassi = async (chassi) => {
  return errorHandler.handleFirestoreOperation(async () => {
    if (!chassi) {
      throw new ValidationError('Chassi é obrigatório', 'chassi');
    }

    const chassiValidado = chassi.toUpperCase().trim();
    const resultado = await VeiculoService.buscarPorCampo('chassi', chassiValidado);

    if (!resultado) {
      throw new BusinessError('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
    }

    return VeiculoService.formatarVeiculo(resultado.doc);
  }, `buscar veículo por chassi ${chassi}`);
};

/**
 * Busca veículo por placa.
 *
 * @param {string} placa - Placa do veículo.
 * @returns {Promise<Object>} Veículo encontrado.
 * @throws {BusinessError|ValidationError} Se não encontrado ou inválido.
 */
export const buscarPorPlaca = async (placa) => {
  return errorHandler.handleFirestoreOperation(async () => {
    const placaValidada = validators.placa(placa);
    const resultado = await VeiculoService.buscarPorCampo('placa', placaValidada);

    if (!resultado) {
      throw new BusinessError('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
    }

    return VeiculoService.formatarVeiculo(resultado.doc);
  }, `buscar veículo por placa ${placa}`);
};

/**
 * Atualiza placa do veículo.
 *
 * @param {string} chassi - Chassi do veículo.
 * @param {string} novaPlaca - Nova placa.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {BusinessError|ValidationError} Se houver erro de negócio ou validação.
 */
export const atualizarPlaca = async (chassi, novaPlaca) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      const chassiValidado = chassi.toUpperCase().trim();
      const placaValidada = validators.placa(novaPlaca);

      // Verificar se a nova placa já está em uso
      const placaEmUso = await VeiculoService.verificarPlacaExistente(
        placaValidada,
        chassiValidado,
      );
      if (placaEmUso) {
        throw new BusinessError('Nova placa já está em uso por outro veículo', 'PLACA_JA_EXISTE');
      }

      const resultado = await VeiculoService.buscarPorCampo('chassi', chassiValidado);
      if (!resultado) {
        throw new BusinessError('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
      }

      await resultado.doc.ref.update({
        placa: placaValidada,
        dataAtualizacao: formatters.dateToISO(new Date()),
      });

      return { success: true };
    }, `atualizar placa do veículo ${chassi}`)
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Atualiza quilometragem do veículo.
 *
 * @param {string} chassi - Chassi do veículo.
 * @param {number} novaQuilometragem - Nova quilometragem.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {BusinessError|ValidationError} Se houver erro de negócio ou validação.
 */
export const atualizarQuilometragemVeiculo = async (chassi, novaQuilometragem) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      const chassiValidado = chassi.toUpperCase().trim();
      const quilometragem = Number(novaQuilometragem);

      if (isNaN(quilometragem) || quilometragem < 0) {
        throw new ValidationError('Quilometragem deve ser um número positivo', 'quilometragem');
      }

      const resultado = await VeiculoService.buscarPorCampo('chassi', chassiValidado);
      if (!resultado) {
        throw new BusinessError('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
      }

      const quilometragemAtual = resultado.data.quilometragem || 0;
      if (quilometragem < quilometragemAtual) {
        throw new ValidationError(
          'Nova quilometragem não pode ser menor que a atual',
          'quilometragem',
        );
      }

      await resultado.doc.ref.update({
        quilometragem,
        dataAtualizacao: formatters.dateToISO(new Date()),
      });

      return { success: true };
    }, `atualizar quilometragem do veículo ${chassi}`)
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Lista quilometragem de um veículo específico.
 *
 * @param {string} chassi - Chassi do veículo.
 * @returns {Promise<Object>} Dados de quilometragem do veículo.
 */
export const listarQuilometragemVeiculo = async (chassi) => {
  return errorHandler.handleFirestoreOperation(async () => {
    const veiculo = await buscarPorChassi(chassi);
    return {
      chassi: veiculo.chassi,
      placa: veiculo.placa,
      quilometragem: veiculo.quilometragem,
      quilometragemNaCompra: veiculo.quilometragemNaCompra,
      diferencaDesdeCompra: veiculo.quilometragem - veiculo.quilometragemNaCompra,
      dataAtualizacao: veiculo.dataAtualizacao,
    };
  }, `listar quilometragem do veículo ${chassi}`);
};

/**
 * Altera status do veículo.
 *
 * @param {string} chassi - Chassi do veículo.
 * @param {string} novoStatus - Novo status.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {BusinessError|ValidationError} Se houver erro de negócio ou validação.
 */
export const alterarStatusVeiculo = async (chassi, novoStatus) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      const chassiValidado = chassi.toUpperCase().trim();
      const statusValidado = validators.status(novoStatus, VALID_STATUSES);

      const resultado = await VeiculoService.buscarPorCampo('chassi', chassiValidado);
      if (!resultado) {
        throw new BusinessError('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
      }

      const statusAtual = resultado.data.status;

      // Validações de negócio para mudança de status
      if (statusAtual === STATUS.VEICULO.ALUGADO && statusValidado === STATUS.VEICULO.VENDIDO) {
        throw new BusinessError(
          'Não é possível vender veículo que está alugado',
          'VEICULO_ALUGADO',
        );
      }

      if (statusAtual === STATUS.VEICULO.VENDIDO) {
        throw new BusinessError(
          'Não é possível alterar status de veículo vendido',
          'VEICULO_JA_VENDIDO',
        );
      }

      const updateData = {
        status: statusValidado,
        dataAtualizacao: formatters.dateToISO(new Date()),
      };

      // Se mudando para vendido, registrar data da venda
      if (statusValidado === STATUS.VEICULO.VENDIDO) {
        updateData.dataVenda = formatters.dateToISO(new Date());
      }

      await resultado.doc.ref.update(updateData);

      return { success: true };
    }, `alterar status do veículo ${chassi}`)
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Registra venda de veículo.
 *
 * @param {string} chassi - Chassi do veículo.
 * @param {string|Date} dataVenda - Data da venda.
 * @param {string} [observacoes=''] - Observações da venda.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {BusinessError|ValidationError} Se houver erro de negócio ou validação.
 */
export const registrarVenda = async (chassi, dataVenda, observacoes = '') => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      const chassiValidado = chassi.toUpperCase().trim();

      let dataVendaValidada;
      if (typeof dataVenda === 'string') {
        dataVendaValidada = VeiculoService.validateDataCompra(dataVenda);
      } else {
        dataVendaValidada = new Date(dataVenda);
      }

      const resultado = await VeiculoService.buscarPorCampo('chassi', chassiValidado);
      if (!resultado) {
        throw new BusinessError('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
      }

      if (resultado.data.status === STATUS.VEICULO.ALUGADO) {
        throw new BusinessError(
          'Não é possível vender veículo que está alugado',
          'VEICULO_ALUGADO',
        );
      }

      if (resultado.data.status === STATUS.VEICULO.VENDIDO) {
        throw new BusinessError('Veículo já foi vendido', 'VEICULO_JA_VENDIDO');
      }

      const updateData = {
        status: STATUS.VEICULO.VENDIDO,
        dataVenda: formatters.dateToISO(dataVendaValidada),
        dataAtualizacao: formatters.dateToISO(new Date()),
      };

      if (observacoes.trim()) {
        updateData.observacoesVenda = observacoes.trim();
      }

      await resultado.doc.ref.update(updateData);

      return { success: true };
    }, `registrar venda do veículo ${chassi}`)
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Atualiza informações gerais do veículo.
 *
 * @param {string} chassi - Chassi do veículo.
 * @param {Object} updates - Campos a serem atualizados.
 * @returns {Promise<Object>} Objeto de sucesso.
 * @throws {BusinessError|ValidationError} Se houver erro de negócio ou validação.
 */
export const atualizarVeiculo = async (chassi, updates) => {
  return errorHandler
    .handleFirestoreOperation(async () => {
      const chassiValidado = chassi.toUpperCase().trim();

      const resultado = await VeiculoService.buscarPorCampo('chassi', chassiValidado);
      if (!resultado) {
        throw new BusinessError('Veículo não encontrado', 'VEICULO_NAO_ENCONTRADO');
      }

      const updateData = { dataAtualizacao: formatters.dateToISO(new Date()) };

      // Validar e aplicar atualizações permitidas
      const camposPermitidos = ['local', 'nome', 'observacoes', 'numeroDocumento'];

      camposPermitidos.forEach((campo) => {
        if (updates[campo] !== undefined) {
          updateData[campo] = String(updates[campo]).trim();
        }
      });

      // Atualização especial para placa
      if (updates.placa) {
        const placaValidada = validators.placa(updates.placa);
        const placaEmUso = await VeiculoService.verificarPlacaExistente(
          placaValidada,
          chassiValidado,
        );
        if (placaEmUso) {
          throw new BusinessError('Nova placa já está em uso por outro veículo', 'PLACA_JA_EXISTE');
        }
        updateData.placa = placaValidada;
      }

      // Atualização especial para quilometragem
      if (updates.quilometragem !== undefined) {
        const quilometragem = Number(updates.quilometragem);
        if (isNaN(quilometragem) || quilometragem < 0) {
          throw new ValidationError('Quilometragem deve ser um número positivo', 'quilometragem');
        }

        const quilometragemAtual = resultado.data.quilometragem || 0;
        if (quilometragem < quilometragemAtual) {
          throw new ValidationError(
            'Nova quilometragem não pode ser menor que a atual',
            'quilometragem',
          );
        }

        updateData.quilometragem = quilometragem;
      }

      // Verificar se há campos para atualizar
      const hasUpdates = Object.keys(updateData).length > 1;
      if (!hasUpdates) {
        throw new ValidationError('Nenhum campo válido fornecido para atualização');
      }

      await resultado.doc.ref.update(updateData);

      return { success: true };
    }, `atualizar veículo ${chassi}`)
    .catch((error) => errorHandler.formatErrorResponse(error));
};

/**
 * Busca veículos disponíveis para locação.
 *
 * @param {Object} [filtros={}] - Filtros de busca.
 * @returns {Promise<Object>} Lista de veículos disponíveis e resumo.
 */
export const listarVeiculosDisponiveis = async (filtros = {}) => {
  return errorHandler.handleFirestoreOperation(async () => {
    let query = db
      .collection(COLLECTION_NAME)
      .where('status', '==', STATUS.VEICULO.DISPONIVEL)
      .orderBy('marca')
      .orderBy('modelo');

    // Aplicar filtros adicionais
    if (filtros.marca) {
      query = query.where('marca', '==', filtros.marca.trim());
    }

    if (filtros.anoMinimo) {
      const ano = Number(filtros.anoMinimo);
      query = query.where('anoModelo.fabricacao', '>=', ano);
    }

    const snapshot = await query.get();

    const veiculos = snapshot.docs.map((doc) => {
      const veiculo = VeiculoService.formatarVeiculo(doc);
      const estatisticas = VeiculoService.calcularDepreciacao(
        veiculo.anoModelo.fabricacao,
        veiculo.quilometragem,
      );
      return { ...veiculo, estatisticas };
    });

    return {
      veiculos,
      total: veiculos.length,
      resumo: {
        totalDisponiveis: veiculos.length,
        marcas: [...new Set(veiculos.map((v) => v.marca))].sort(),
        quilometragemMedia:
          veiculos.length > 0
            ? Math.round(veiculos.reduce((sum, v) => sum + v.quilometragem, 0) / veiculos.length)
            : 0,
      },
    };
  }, 'listar veículos disponíveis');
};

/**
 * Gera relatório de frota.
 *
 * @returns {Promise<Object>} Relatório da frota.
 */
export const gerarRelatorioFrota = async () => {
  return errorHandler.handleFirestoreOperation(async () => {
    const snapshot = await db.collection(COLLECTION_NAME).get();

    const veiculos = snapshot.docs.map((doc) => doc.data());

    const relatorio = {
      totalVeiculos: veiculos.length,
      porStatus: {},
      porMarca: {},
      porAnoFabricacao: {},
      quilometragemTotal: 0,
      quilometragemMedia: 0,
      veiculoMaisAntigo: null,
      veiculoMaisNovo: null,
      veiculoMaiorKm: null,
      veiculoMenorKm: null,
    };

    // Calcular estatísticas
    VALID_STATUSES.forEach((status) => {
      relatorio.porStatus[status] = veiculos.filter((v) => v.status === status).length;
    });

    veiculos.forEach((veiculo) => {
      // Por marca
      relatorio.porMarca[veiculo.marca] = (relatorio.porMarca[veiculo.marca] || 0) + 1;

      // Por ano
      const ano = veiculo.anoModelo?.fabricacao;
      if (ano) {
        relatorio.porAnoFabricacao[ano] = (relatorio.porAnoFabricacao[ano] || 0) + 1;
      }

      // Quilometragem
      const km = veiculo.quilometragem || 0;
      relatorio.quilometragemTotal += km;

      // Extremos
      if (!relatorio.veiculoMaisAntigo || ano < relatorio.veiculoMaisAntigo.ano) {
        relatorio.veiculoMaisAntigo = {
          chassi: veiculo.chassi,
          ano,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
        };
      }

      if (!relatorio.veiculoMaisNovo || ano > relatorio.veiculoMaisNovo.ano) {
        relatorio.veiculoMaisNovo = {
          chassi: veiculo.chassi,
          ano,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
        };
      }

      if (!relatorio.veiculoMaiorKm || km > relatorio.veiculoMaiorKm.quilometragem) {
        relatorio.veiculoMaiorKm = {
          chassi: veiculo.chassi,
          quilometragem: km,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
        };
      }

      if (!relatorio.veiculoMenorKm || km < relatorio.veiculoMenorKm.quilometragem) {
        relatorio.veiculoMenorKm = {
          chassi: veiculo.chassi,
          quilometragem: km,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
        };
      }
    });

    relatorio.quilometragemMedia =
      veiculos.length > 0 ? Math.round(relatorio.quilometragemTotal / veiculos.length) : 0;

    relatorio.dataGeracao = formatters.dateToDisplay(new Date().toISOString());

    return relatorio;
  }, 'gerar relatório de frota');
};
