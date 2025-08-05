/**
 * @file Define as rotas da API RESTful relacionadas a locações.
 * Gerencia operações como criação, listagem, atualização e exclusão de locações.
 */

import express from 'express';
import cors from 'cors';
import { db } from '../firebaseConfig.js';
import {
  criarLocacao,
  listarLocacoes,
  buscarLocacaoPorId,
  atualizarLocacao,
  excluirLocacao,
  historicoLocacoesCliente,
  historicoLocacoesVeiculo,
} from '../src/scripts/firestore/firestoreLocacoes.js';

const app = express();

// Configurar CORS
app.use(cors({ origin: true }));

// Middleware para parsing JSON
app.use(express.json());

/**
 * Middleware para validação básica de dados de locação
 */
const validarDadosLocacao = (req, res, next) => {
  const { cpfLocatario, placaVeiculo, dataInicio, dataFim, valor } = req.body;

  const camposFaltantes = [];
  if (!cpfLocatario) camposFaltantes.push('cpfLocatario');
  if (!placaVeiculo) camposFaltantes.push('placaVeiculo');
  if (!dataInicio) camposFaltantes.push('dataInicio');
  if (!dataFim) camposFaltantes.push('dataFim');
  if (valor === undefined || valor === null) camposFaltantes.push('valor');

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
    CLIENTE_NAO_ENCONTRADO: 404,
    VEICULO_NAO_ENCONTRADO: 404,
    VEICULO_INDISPONIVEL: 409,
    LOCACAO_NAO_ENCONTRADA: 404,
    CLIENTE_INATIVO: 400,
    PERMISSION_DENIED: 403,
    SERVICE_UNAVAILABLE: 503,
    INTERNAL_ERROR: 500,
  };

  return errorCodeMap[error.code] || 400;
};

/**
 * POST / - Criar nova locação
 */
app.post('/', validarDadosLocacao, async (req, res, next) => {
  try {
    const locacaoData = req.body;
    const resultado = await criarLocacao(locacaoData);

    res.status(201).json({
      success: true,
      message: 'Locação criada com sucesso!',
      data: {
        id: resultado.id,
        locacao: locacaoData,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET / - Listar locações com paginação e filtros
 */
app.get('/', async (req, res, next) => {
  try {
    const { limite = '10', ultimoDocId, filtros = '{}' } = req.query;

    // Validar e parsear parâmetros
    const limiteNum = Math.min(Math.max(1, parseInt(limite) || 10), 100);

    let filtrosParsed;
    try {
      filtrosParsed = JSON.parse(filtros);
    } catch {
      filtrosParsed = {};
    }

    // Recuperar último documento para paginação
    let ultimoDocSnapshot = null;
    if (ultimoDocId) {
      try {
        ultimoDocSnapshot = await db.collection('locacoes').doc(ultimoDocId).get();
        if (!ultimoDocSnapshot.exists) {
          return res.status(400).json({
            success: false,
            error: 'ultimoDocId inválido',
            field: 'ultimoDocId',
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Erro ao processar ultimoDocId',
          field: 'ultimoDocId',
        });
      }
    }

    // Chamar função de listagem
    const resultado = await listarLocacoes({
      limite: limiteNum,
      ultimoDoc: ultimoDocSnapshot,
      filtros: filtrosParsed,
    });

    res.status(200).json({
      success: true,
      data: {
        locacoes: resultado.locacoes,
        total: resultado.locacoes.length,
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
 * GET /cliente/:cpf - Histórico de locações de um cliente
 */
app.get('/cliente/:cpf', async (req, res, next) => {
  try {
    const { cpf } = req.params;
    const locacoes = await historicoLocacoesCliente(cpf);

    res.status(200).json({
      success: true,
      data: {
        cpf,
        locacoes,
        total: locacoes.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /veiculo/:chassi - Histórico de locações de um veículo
 */
app.get('/veiculo/:chassi', async (req, res, next) => {
  try {
    const { chassi } = req.params;
    const locacoes = await historicoLocacoesVeiculo(chassi);

    res.status(200).json({
      success: true,
      data: {
        chassi,
        locacoes,
        total: locacoes.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /:id - Buscar locação por ID (versão corrigida)
 */
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando locação por ID: ${id}`);

    const locacao = await buscarLocacaoPorId(id);

    res.status(200).json({
      success: true,
      data: locacao,
    });
  } catch (error) {
    console.error(`Erro ao buscar locação ${req.params.id}:`, error);

    // Verificar diferentes tipos de erro "não encontrada"
    if (
      error.code === 'LOCACAO_NAO_ENCONTRADA' ||
      error.message?.includes('não encontrada') ||
      error.message?.includes('not found') ||
      (error.success === false && error.code === 'LOCACAO_NAO_ENCONTRADA')
    ) {
      return res.status(404).json({
        success: false,
        error: 'Locação não encontrada',
        code: 'LOCACAO_NAO_ENCONTRADA',
      });
    }

    // Erro de validação (ID inválido, etc.)
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
 * PUT /:id - Atualizar locação
 */
app.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validação básica
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização',
      });
    }

    await atualizarLocacao(id, updates);

    res.status(200).json({
      success: true,
      message: `Locação ${id} atualizada com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /:id/status - Atualizar apenas o status da locação
 */
app.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório',
        field: 'status',
      });
    }

    await atualizarLocacao(id, { status });

    res.status(200).json({
      success: true,
      message: `Status da locação ${id} alterado para ${status} com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /:id - Excluir locação
 */
app.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await excluirLocacao(id);

    res.status(200).json({
      success: true,
      message: `Locação ${id} excluída com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

// Aplicar middleware de tratamento de erros
app.use(tratarErros);

export default app;
