/**
 * @file Define as rotas da API relacionadas a veículos.
 * Inclui endpoints para criar, listar, atualizar e deletar veículos.
 */

import express from 'express';
const router = express.Router();
import { db } from '../firebaseConfig.js';
import {
  criarVeiculo,
  listarVeiculos,
  buscarPorChassi,
  buscarPorPlaca,
  atualizarPlaca,
  atualizarQuilometragemVeiculo,
  listarQuilometragemVeiculo,
  alterarStatusVeiculo,
  registrarVenda,
  atualizarVeiculo,
  listarVeiculosDisponiveis,
  gerarRelatorioFrota,
} from '../src/scripts/firestore/firestoreVeiculos.js';

/**
 * Middleware para validação básica de dados do veículo
 */
const validarDadosVeiculo = (req, res, next) => {
  const { chassi, placa, modelo, marca, renavam, quilometragem, dataCompra } = req.body;

  const camposFaltantes = [];
  if (!chassi) camposFaltantes.push('chassi');
  if (!placa) camposFaltantes.push('placa');
  if (!modelo) camposFaltantes.push('modelo');
  if (!marca) camposFaltantes.push('marca');
  if (!renavam) camposFaltantes.push('renavam');
  if (quilometragem === undefined) camposFaltantes.push('quilometragem');
  if (!dataCompra) camposFaltantes.push('dataCompra');

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Campos obrigatórios faltantes: ${camposFaltantes.join(', ')}`,
      fields: camposFaltantes,
    });
  }

  next();
};

/**
 * Middleware para tratamento de erros padronizado
 */
const tratarErros = (error, req, res, next) => {
  console.error(`Erro na rota ${req.method} ${req.path}:`, error);

  // Se o erro já tem um formato específico, usar esse formato
  if (error.success === false) {
    const statusCode = getStatusCodeFromError(error);
    return res.status(statusCode).json(error);
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
  });
};

/**
 * Mapeia códigos de erro para status HTTP
 */
const getStatusCodeFromError = (error) => {
  const errorCodeMap = {
    VALIDATION_ERROR: 400,
    CHASSI_JA_EXISTE: 409,
    PLACA_JA_EXISTE: 409,
    VEICULO_NAO_ENCONTRADO: 404,
    VEICULO_ALUGADO: 409,
    VEICULO_JA_VENDIDO: 409,
    PERMISSION_DENIED: 403,
    SERVICE_UNAVAILABLE: 503,
    INTERNAL_ERROR: 500,
  };

  return errorCodeMap[error.code] || 400;
};

/**
 * POST / - Criar novo veículo
 */
router.post('/', validarDadosVeiculo, async (req, res, next) => {
  try {
    const veiculoData = req.body;
    const resultado = await criarVeiculo(veiculoData);

    res.status(201).json({
      success: true,
      message: 'Veículo criado com sucesso!',
      data: {
        id: resultado.id,
        chassi: veiculoData.chassi,
        placa: veiculoData.placa,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET / - Listar veículos com paginação e filtros
 */
router.get('/', async (req, res, next) => {
  try {
    const { limite = '10', ultimoDocId, filtros = '{}', incluirEstatisticas = 'false' } = req.query;

    // Converter e validar parâmetros
    const limiteNum = Math.min(Math.max(1, parseInt(limite) || 10), 100);
    const incluirEstatisticasBoolean = incluirEstatisticas === 'true';

    let filtrosParsed;
    try {
      filtrosParsed = JSON.parse(filtros);
    } catch {
      filtrosParsed = {};
    }

    // Obter documento de referência para paginação
    let ultimoDoc = null;
    if (ultimoDocId) {
      try {
        const lastDocSnapshot = await db.collection('veiculos').doc(ultimoDocId).get();
        if (!lastDocSnapshot.exists) {
          return res.status(400).json({
            success: false,
            error: 'ID do último documento inválido',
            field: 'ultimoDocId',
          });
        }
        ultimoDoc = lastDocSnapshot;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Erro ao processar ultimoDocId',
          field: 'ultimoDocId',
        });
      }
    }

    // Chamar função de listagem
    const resultado = await listarVeiculos({
      limite: limiteNum,
      ultimoDoc,
      filtros: filtrosParsed,
      incluirEstatisticas: incluirEstatisticasBoolean,
    });

    res.status(200).json({
      success: true,
      data: {
        veiculos: resultado.veiculos,
        total: resultado.total,
        paginacao: {
          possuiMais: !!resultado.ultimoDoc,
          ultimoDocId: resultado.ultimoDoc?.id || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /disponiveis - Listar apenas veículos disponíveis
 */
router.get('/disponiveis', async (req, res, next) => {
  try {
    const { filtros = '{}' } = req.query;

    let filtrosParsed;
    try {
      filtrosParsed = JSON.parse(filtros);
    } catch {
      filtrosParsed = {};
    }

    const resultado = await listarVeiculosDisponiveis(filtrosParsed);

    res.status(200).json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /relatorio - Gerar relatório da frota
 */
router.get('/relatorio', async (req, res, next) => {
  try {
    const relatorio = await gerarRelatorioFrota();

    res.status(200).json({
      success: true,
      data: relatorio,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /chassi/:chassi - Buscar veículo por chassi (versão corrigida)
 */
router.get('/chassi/:chassi', async (req, res) => {
  try {
    const { chassi } = req.params;
    console.log(`🔍 Buscando veículo por chassi: ${chassi}`);

    const veiculo = await buscarPorChassi(chassi);

    res.status(200).json({
      success: true,
      data: veiculo,
    });
  } catch (error) {
    console.error(`Erro ao buscar veículo por chassi ${req.params.chassi}:`, error);

    // Verificar diferentes tipos de erro "não encontrado"
    if (
      error.code === 'VEICULO_NAO_ENCONTRADO' ||
      error.message?.includes('não encontrado') ||
      error.message?.includes('not found') ||
      (error.success === false && error.code === 'VEICULO_NAO_ENCONTRADO')
    ) {
      return res.status(404).json({
        success: false,
        error: 'Veículo não encontrado',
        code: 'VEICULO_NAO_ENCONTRADO',
      });
    }

    // Erro de validação (chassi inválido, etc.)
    if (error.message?.includes('inválido') || error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
      });
    }

    // Erro genérico
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /placa/:placa - Buscar veículo por placa
 */
router.get('/placa/:placa', async (req, res, next) => {
  try {
    const { placa } = req.params;
    const veiculo = await buscarPorPlaca(placa);

    res.status(200).json({
      success: true,
      data: veiculo,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /:chassi/quilometragem - Listar quilometragem de um veículo
 */
router.get('/:chassi/quilometragem', async (req, res, next) => {
  try {
    const { chassi } = req.params;
    const dadosQuilometragem = await listarQuilometragemVeiculo(chassi);

    res.status(200).json({
      success: true,
      data: dadosQuilometragem,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /:chassi - Atualizar veículo
 */
router.put('/:chassi', async (req, res, next) => {
  try {
    const { chassi } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização',
      });
    }

    await atualizarVeiculo(chassi, updates);

    res.status(200).json({
      success: true,
      message: `Veículo ${chassi} atualizado com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /:chassi/placa - Atualizar apenas a placa do veículo
 */
router.patch('/:chassi/placa', async (req, res, next) => {
  try {
    const { chassi } = req.params;
    const { placa } = req.body;

    if (!placa) {
      return res.status(400).json({
        success: false,
        error: 'Nova placa é obrigatória',
        field: 'placa',
      });
    }

    await atualizarPlaca(chassi, placa);

    res.status(200).json({
      success: true,
      message: `Placa do veículo ${chassi} atualizada com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /:chassi/quilometragem - Atualizar quilometragem do veículo
 */
router.patch('/:chassi/quilometragem', async (req, res, next) => {
  try {
    const { chassi } = req.params;
    const { quilometragem } = req.body;

    if (quilometragem === undefined || quilometragem === null) {
      return res.status(400).json({
        success: false,
        error: 'Quilometragem é obrigatória',
        field: 'quilometragem',
      });
    }

    await atualizarQuilometragemVeiculo(chassi, quilometragem);

    res.status(200).json({
      success: true,
      message: `Quilometragem do veículo ${chassi} atualizada com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /:chassi/status - Alterar status do veículo
 */
router.patch('/:chassi/status', async (req, res, next) => {
  try {
    const { chassi } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório',
        field: 'status',
      });
    }

    await alterarStatusVeiculo(chassi, status);

    res.status(200).json({
      success: true,
      message: `Status do veículo ${chassi} alterado para ${status} com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /:chassi/venda - Registrar venda do veículo
 */
router.post('/:chassi/venda', async (req, res, next) => {
  try {
    const { chassi } = req.params;
    const { dataVenda, observacoes } = req.body;

    if (!dataVenda) {
      return res.status(400).json({
        success: false,
        error: 'Data da venda é obrigatória',
        field: 'dataVenda',
      });
    }

    await registrarVenda(chassi, dataVenda, observacoes);

    res.status(200).json({
      success: true,
      message: `Venda do veículo ${chassi} registrada com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /:chassi - Deletar veículo (soft delete recomendado)
 */
router.delete('/:chassi', async (req, res, next) => {
  try {
    const { chassi } = req.params;
    const { exclusaoFisica = 'false' } = req.query;

    if (exclusaoFisica === 'true') {
      // Exclusão física - deletar documento
      const snapshot = await db
        .collection('veiculos')
        .where('chassi', '==', chassi.toUpperCase().trim())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({
          success: false,
          error: 'Veículo não encontrado',
          code: 'VEICULO_NAO_ENCONTRADO',
        });
      }

      const veiculoDoc = snapshot.docs[0];
      const veiculoData = veiculoDoc.data();

      // Verificar se veículo está alugado
      if (veiculoData.status === 'alugado') {
        return res.status(409).json({
          success: false,
          error: 'Não é possível excluir veículo que está alugado',
          code: 'VEICULO_ALUGADO',
        });
      }

      await veiculoDoc.ref.delete();

      res.status(200).json({
        success: true,
        message: `Veículo ${chassi} excluído permanentemente com sucesso!`,
      });
    } else {
      // Soft delete - alterar status para inativo/excluído
      await alterarStatusVeiculo(chassi, 'vendido');

      res.status(200).json({
        success: true,
        message: `Veículo ${chassi} marcado como vendido com sucesso!`,
      });
    }
  } catch (error) {
    next(error);
  }
});

// Aplicar middleware de tratamento de erros
router.use(tratarErros);

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal
 */
export default router;
