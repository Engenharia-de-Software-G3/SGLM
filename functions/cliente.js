/**
 * @file Define as rotas da API RESTful relacionadas a clientes.
 * Gerencia operações como criação e listagem de clientes.
 */

import express from 'express';
const router = express.Router();
import { db } from '../firebaseConfig.js';
import {
  criarCliente,
  listarClientes,
  buscarClientePorCPF,
  atualizarCliente,
  excluirCliente,
  alterarStatusCliente,
  buscarClientesPorNome,
  verificarElegibilidadeLocacao,
} from '../src/scripts/firestore/firestoreClientes.js';

/**
 * Middleware para validação básica de dados do cliente
 */
const validarDadosCliente = (req, res, next) => {
  const { cpf, dadosPessoais, endereco, contato } = req.body;

  if (!cpf) {
    return res.status(400).json({
      success: false,
      error: 'CPF é obrigatório',
      field: 'cpf',
    });
  }

  if (!dadosPessoais?.nome) {
    return res.status(400).json({
      success: false,
      error: 'Nome é obrigatório',
      field: 'dadosPessoais.nome',
    });
  }

  if (!endereco) {
    return res.status(400).json({
      success: false,
      error: 'Endereço é obrigatório',
      field: 'endereco',
    });
  }

  if (!contato?.email) {
    return res.status(400).json({
      success: false,
      error: 'Email é obrigatório',
      field: 'contato.email',
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
    CPF_JA_EXISTE: 409,
    CLIENTE_NAO_ENCONTRADO: 404,
    CLIENTE_INATIVO: 400,
    PERMISSION_DENIED: 403,
    SERVICE_UNAVAILABLE: 503,
    INTERNAL_ERROR: 500,
  };

  return errorCodeMap[error.code] || 400;
};

/**
 * POST / - Criar um novo cliente
 */
router.post('/', validarDadosCliente, async (req, res, next) => {
  try {
    const clienteData = req.body;

    // A função refatorada usa try/catch, não retorna { success, id }
    await criarCliente(clienteData);

    // Se chegou até aqui, foi sucesso
    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso!',
      data: {
        id: clienteData.cpf,
        cpf: clienteData.cpf,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET / - Listar clientes com paginação e filtros
 */
router.get('/', async (req, res, next) => {
  try {
    const { limite = '10', ultimoDocId, filtros = '{}', incluirSubcolecoes = 'false' } = req.query;

    // Validar e parsear parâmetros
    const limiteNum = Math.min(Math.max(1, parseInt(limite) || 10), 100);
    const incluirSubcolecoesBoolean = incluirSubcolecoes === 'true';

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
        ultimoDocSnapshot = await db.collection('clientes').doc(ultimoDocId).get();
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
    const resultado = await listarClientes({
      limite: limiteNum,
      ultimoDoc: ultimoDocSnapshot,
      filtros: filtrosParsed,
      incluirSubcolecoes: incluirSubcolecoesBoolean,
    });

    // Preparar resposta
    res.status(200).json({
      success: true,
      data: {
        clientes: resultado.clientes,
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
 * GET /buscar-nome - Buscar clientes por nome
 */
router.get('/buscar-nome', async (req, res, next) => {
  try {
    const { nome, limite = '10' } = req.query;

    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro nome é obrigatório',
        field: 'nome',
      });
    }

    const limiteNum = Math.min(parseInt(limite) || 10, 50);
    const clientes = await buscarClientesPorNome(nome, limiteNum);

    res.status(200).json({
      success: true,
      data: {
        clientes,
        total: clientes.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /:cpf - Buscar cliente por CPF (versão corrigida)
 */
router.get('/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const { incluirSubcolecoes = 'true' } = req.query;

    console.log(`🔍 Buscando cliente: ${cpf}`);

    const incluirSubcolecoesBoolean = incluirSubcolecoes === 'true';
    const cliente = await buscarClientePorCPF(cpf, incluirSubcolecoesBoolean);

    res.status(200).json({
      success: true,
      data: cliente,
    });
  } catch (error) {
    console.error(`Erro ao buscar cliente ${req.params.cpf}:`, error);

    // Verificar diferentes tipos de erro "não encontrado"
    if (
      error.code === 'CLIENTE_NAO_ENCONTRADO' ||
      error.message?.includes('não encontrado') ||
      error.message?.includes('not found') ||
      (error.success === false && error.code === 'CLIENTE_NAO_ENCONTRADO')
    ) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
        code: 'CLIENTE_NAO_ENCONTRADO',
      });
    }

    // Erro de validação (CPF inválido, etc.)
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
 * GET /:cpf/elegibilidade - Verificar elegibilidade para locação
 */
router.get('/:cpf/elegibilidade', async (req, res, next) => {
  try {
    const { cpf } = req.params;
    const resultado = await verificarElegibilidadeLocacao(cpf);

    res.status(200).json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /:cpf - Atualizar cliente existente
 */
router.put('/:cpf', async (req, res, next) => {
  try {
    const { cpf } = req.params;
    const updates = req.body;

    // Validação básica: verifica se há dados para atualizar
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização',
      });
    }

    // A função refatorada usa try/catch, não retorna { success }
    await atualizarCliente(cpf, updates);

    res.status(200).json({
      success: true,
      message: `Cliente ${cpf} atualizado com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /:cpf/status - Alterar status do cliente
 */
router.patch('/:cpf/status', async (req, res, next) => {
  try {
    const { cpf } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório',
        field: 'status',
      });
    }

    await alterarStatusCliente(cpf, status);

    res.status(200).json({
      success: true,
      message: `Status do cliente ${cpf} alterado para ${status} com sucesso!`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /:cpf - Remover cliente existente
 */
router.delete('/:cpf', async (req, res, next) => {
  try {
    const { cpf } = req.params;
    const { exclusaoCompleta = 'false' } = req.query;

    const exclusaoCompletaBoolean = exclusaoCompleta === 'true';
    await excluirCliente(cpf, exclusaoCompletaBoolean);

    const tipoExclusao = exclusaoCompletaBoolean ? 'excluído permanentemente' : 'desativado';
    res.status(200).json({
      success: true,
      message: `Cliente ${cpf} ${tipoExclusao} com sucesso!`,
    });
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
