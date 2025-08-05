/**
 * @file Funções auxiliares e middlewares para rotas Express.
 * Inclui validações, tratamento de erros, sanitização, paginação, filtros, etc.
 */

import { ValidationError } from '../src/scripts/firestore/validators.js';

/**
 * Mapeia códigos de erro para status HTTP.
 * @param {Error|Object} error - Objeto de erro.
 * @returns {number} Status HTTP correspondente.
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
 * Middleware genérico para tratamento de erros.
 * @param {Error|Object} error - Objeto de erro.
 * @param {import('express').Request} req - Requisição Express.
 * @param {import('express').Response} res - Resposta Express.
 * @param {Function} next - Próximo middleware.
 * @returns {void}
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

  // Verificar mensagens de erro específicas
  if (error.message) {
    if (
      error.message.includes('não encontrado') ||
      error.message.includes('não encontrada') ||
      error.message.includes('not found')
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND',
      });
    }

    if (error.message.includes('já existe') || error.message.includes('duplicado')) {
      return res.status(409).json({
        success: false,
        error: error.message,
        code: 'ALREADY_EXISTS',
      });
    }

    if (error.message.includes('inválido') || error.message.includes('formato')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
      });
    }

    if (error.message.includes('alugado') || error.message.includes('indisponível')) {
      return res.status(409).json({
        success: false,
        error: error.message,
        code: 'RESOURCE_UNAVAILABLE',
      });
    }
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
 * Middleware para validar parâmetros de paginação.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 * @returns {void}
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

    req.query.limite = Math.min(Math.max(1, limiteNum), 100);
  } else {
    req.query.limite = 10; // Default
  }

  next();
};

/**
 * Middleware para validar e parsear filtros JSON.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 * @returns {void}
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
 * Middleware para log de requisições.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 * @returns {void}
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode >= 400 ? 'x' : 'v';
    console.log(`${statusEmoji} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

/**
 * Middleware para validar IDs de documentos.
 * @param {string} [paramName='id'] - Nome do parâmetro na rota.
 * @returns {Function} Middleware Express.
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

    // Validar formato básico do ID
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
 * Wrapper para funções async que automaticamente captura erros.
 * @param {Function} fn - Função async Express.
 * @returns {Function} Middleware Express.
 * @example
 * router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para validar Content-Type em requisições POST/PUT/PATCH.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 * @returns {void}
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
 * Middleware para sanitizar entrada de dados.
 * Remove caracteres perigosos básicos e faz trim em strings.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 * @returns {void}
 */
export const sanitizeInput = (req, res, next) => {
  /**
   * @param {Object|Array|string|number|boolean|null} obj
   * @returns {Object|Array|string|number|boolean|null}
   */
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
        // Remover caracteres perigosos básicos e trim
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
 * Middleware para cache de resposta (headers básicos).
 * @param {number} [maxAge=300] - Tempo em segundos.
 * @returns {Function} Middleware Express.
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

/**
 * Middleware para validar dados obrigatórios no body.
 * Suporta campos aninhados (ex: 'dadosPessoais.nome').
 * @param {string[]} fields - Lista de campos obrigatórios.
 * @returns {Function} Middleware Express.
 */
export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];

    fields.forEach((field) => {
      const fieldValue = getNestedValue(req.body, field);
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Campos obrigatórios faltantes: ${missingFields.join(', ')}`,
        fields: missingFields,
        code: 'VALIDATION_ERROR',
      });
    }

    next();
  };
};

/**
 * Função auxiliar para acessar valores aninhados em objetos.
 * @param {Object} obj - Objeto de origem.
 * @param {string} path - Caminho do campo (ex: 'dadosPessoais.nome').
 * @returns {*}
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Função para formatar resposta de sucesso.
 * @param {string} [message='Operação realizada com sucesso'] - Mensagem de sucesso.
 * @returns {Function} Função que recebe os dados e retorna o objeto de resposta.
 * @example
 * res.json(formatSuccessResponse('Feito!')({ id: 1 }))
 */
export const formatSuccessResponse = (message = 'Operação realizada com sucesso') => {
  return (data) => ({
    success: true,
    message,
    data,
  });
};

/**
 * Middleware para processar ultimoDoc do Firestore para paginação.
 * Adiciona req.ultimoDocSnapshot se válido.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 * @returns {Promise<void>}
 */
export const processLastDoc = async (req, res, next) => {
  const { ultimoDocId } = req.query;

  if (ultimoDocId) {
    try {
      // Determinar coleção baseada na rota
      let collection = 'clientes';
      if (req.path.includes('/veiculos')) collection = 'veiculos';
      if (req.path.includes('/locacoes')) collection = 'locacoes';

      const { db } = await import('../firebaseConfig.js');
      const lastDocSnapshot = await db.collection(collection).doc(ultimoDocId).get();

      if (!lastDocSnapshot.exists) {
        return res.status(400).json({
          success: false,
          error: 'ultimoDocId inválido',
          field: 'ultimoDocId',
          code: 'VALIDATION_ERROR',
        });
      }

      req.ultimoDocSnapshot = lastDocSnapshot;
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Erro ao processar ultimoDocId',
        field: 'ultimoDocId',
        code: 'VALIDATION_ERROR',
      });
    }
  }

  next();
};
