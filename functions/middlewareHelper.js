// middlewareHelper.js - Funções auxiliares para middleware das rotas
import { ValidationError } from '../src/scripts/firestore/validators.js';

/**
 * Mapeia códigos de erro para status HTTP
 */
export const getStatusCodeFromError = (error) => {
  // Mapear erros de validação
  if (error instanceof ValidationError || error.name === 'ValidationError') {
    return 400;
  }

  const errorCodeMap = {
    // Erros de validação
    VALIDATION_ERROR: 400,

    // Erros de cliente
    CPF_JA_EXISTE: 409,
    CLIENTE_NAO_ENCONTRADO: 404,
    CLIENTE_INATIVO: 400,

    // Erros de veículo
    CHASSI_JA_EXISTE: 409,
    PLACA_JA_EXISTE: 409,
    VEICULO_NAO_ENCONTRADO: 404,
    VEICULO_ALUGADO: 409,
    VEICULO_INDISPONIVEL: 409,
    VEICULO_JA_VENDIDO: 409,

    // Erros de locação
    LOCACAO_NAO_ENCONTRADA: 404,

    // Erros de sistema
    PERMISSION_DENIED: 403,
    SERVICE_UNAVAILABLE: 503,
    INTERNAL_ERROR: 500,
    DOC_NOT_FOUND: 404,
    CONCURRENT_MODIFICATION: 409,
  };

  return errorCodeMap[error.code] || 500;
};

/**
 * Middleware genérico para tratamento de erros
 */
export const errorHandler = (error, req, res, next) => {
  console.error(`Erro na rota ${req.method} ${req.path}:`, error);

  // Se o erro já vem formatado do sistema refatorado
  if (error.success === false) {
    const statusCode = getStatusCodeFromError(error);
    return res.status(statusCode).json(error);
  }

  // Se é erro de validação
  if (error instanceof ValidationError || error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message,
      field: error.field || null,
      code: 'VALIDATION_ERROR',
    });
  }

  // Se é erro do Firebase/Firestore
  if (error.code && error.code.startsWith('firestore/')) {
    const statusCode = error.code === 'firestore/permission-denied' ? 403 : 500;
    return res.status(statusCode).json({
      success: false,
      error: 'Erro no banco de dados',
      code: 'DATABASE_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
  });
};

/**
 * Middleware para validar parâmetros de paginação
 */
export const validatePagination = (req, res, next) => {
  const { limite } = req.query;

  if (limite) {
    const limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Limite deve ser um número positivo',
        field: 'limite',
        code: 'VALIDATION_ERROR',
      });
    }

    if (limiteNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limite máximo é 100',
        field: 'limite',
        code: 'VALIDATION_ERROR',
      });
    }
  }

  next();
};

/**
 * Middleware para validar e parsear filtros JSON
 */
export const validateFilters = (req, res, next) => {
  const { filtros } = req.query;

  if (filtros) {
    try {
      req.filtrosParsed = JSON.parse(filtros);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Filtros devem estar em formato JSON válido',
        field: 'filtros',
        code: 'VALIDATION_ERROR',
      });
    }
  } else {
    req.filtrosParsed = {};
  }

  next();
};

/**
 * Middleware para log de requisições (opcional)
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    console[logLevel](`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

/**
 * Middleware para validar IDs de documentos
 */
export const validateDocumentId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: `${paramName} é obrigatório`,
        field: paramName,
        code: 'VALIDATION_ERROR',
      });
    }

    // Validar formato básico do ID (opcional)
    if (id.length > 100) {
      return res.status(400).json({
        success: false,
        error: `${paramName} muito longo`,
        field: paramName,
        code: 'VALIDATION_ERROR',
      });
    }

    next();
  };
};

/**
 * Wrapper para funções async que automaticamente captura erros
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para validar Content-Type em requisições POST/PUT
 */
export const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      return res.status(415).json({
        success: false,
        error: 'Content-Type deve ser application/json',
        code: 'INVALID_CONTENT_TYPE',
      });
    }
  }

  next();
};

/**
 * Middleware para sanitizar entrada de dados
 */
export const sanitizeInput = (req, res, next) => {
  // Função recursiva para sanitizar objetos
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remover caracteres perigosos básicos
        sanitized[key] = value.trim().replace(/[<>]/g, '');
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }

    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * Middleware para cache de resposta (headers básicos)
 */
export const setCacheHeaders = (maxAge = 300) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
    } else {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    next();
  };
};
