/**
 * @file Helpers e middlewares para rotas Express.
 * Validações, erros, sanitização, paginação e filtros.
 */

import { ValidationError } from './firestore/validators.js';

/**
 * Mapeia códigos de erro para status HTTP.
 * @param {Error|Object} error - Objeto de erro.
 * @return {number} - Status HTTP correspondente.
 */
export const getStatusCodeFromError = (error) => {
  if (error instanceof ValidationError || error.name === 'ValidationError') {
    return 400;
  }

  const errorCodeMap = {
    // Validação
    VALIDATION_ERROR: 400,

    // Cliente
    CPF_JA_EXISTE: 409,
    CLIENTE_NAO_ENCONTRADO: 404,
    CLIENTE_INATIVO: 400,

    // Veículo
    CHASSI_JA_EXISTE: 409,
    PLACA_JA_EXISTE: 409,
    VEICULO_NAO_ENCONTRADO: 404,
    VEICULO_ALUGADO: 409,
    VEICULO_INDISPONIVEL: 409,
    VEICULO_JA_VENDIDO: 409,

    // Locação
    LOCACAO_NAO_ENCONTRADA: 404,

    // Sistema
    PERMISSION_DENIED: 403,
    SERVICE_UNAVAILABLE: 503,
    INTERNAL_ERROR: 500,
    DOC_NOT_FOUND: 404,
    CONCURRENT_MODIFICATION: 409,
  };

  return errorCodeMap[error.code] || 500;
};

/**
 * Middleware genérico de tratamento de erros.
 * @param {Error|Object} error - Objeto de erro.
 * @param {import('express').Request} req - Requisição Express.
 * @param {import('express').Response} res - Resposta Express.
 * @param {Function} next - Próximo middleware.
 * @returns {void}
 */
export const handlerErros = (error, req, res, next) => {
  const rota = `${req.method} ${req.path}`;
  console.error(`Erro na rota ${rota}:`, error);

  if (error.success === false) {
    const statusCode = getStatusCodeFromError(error);
    return res.status(statusCode).json(error);
  }

  if (error instanceof ValidationError || error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message,
      field: error.field || null,
      code: 'VALIDATION_ERROR',
    });
  }

  if (error.message) {
    const msg = error.message;

    if (
      msg.includes('não encontrado') ||
      msg.includes('não encontrada') ||
      msg.includes('not found')
    ) {
      return res.status(404).json({
        success: false,
        error: msg,
        code: 'NOT_FOUND',
      });
    }

    if (msg.includes('já existe') || msg.includes('duplicado')) {
      return res.status(409).json({
        success: false,
        error: msg,
        code: 'ALREADY_EXISTS',
      });
    }

    if (msg.includes('inválido') || msg.includes('formato')) {
      return res.status(400).json({
        success: false,
        error: msg,
        code: 'VALIDATION_ERROR',
      });
    }

    if (msg.includes('alugado') || msg.includes('indisponível')) {
      return res.status(409).json({
        success: false,
        error: msg,
        code: 'RESOURCE_UNAVAILABLE',
      });
    }
  }

  if (error.code && String(error.code).startsWith('firestore/')) {
    const statusCode = error.code === 'firestore/permission-denied' ? 403 : 500;
    const base = { success: false, error: 'Erro no banco de dados' };
    const payload =
      process.env.NODE_ENV === 'development'
        ? { ...base, code: 'DATABASE_ERROR', details: error.message }
        : { ...base, code: 'DATABASE_ERROR' };

    return res.status(statusCode).json(payload);
  }

  const base = { success: false, error: 'Erro interno do servidor' };
  const payload =
    process.env.NODE_ENV === 'development'
      ? { ...base, code: 'INTERNAL_ERROR', details: error.message }
      : { ...base, code: 'INTERNAL_ERROR' };

  res.status(500).json(payload);
};

/**
 * Middleware para validar paginação.
 * @param {import('express').Request} req - Requisição.
 * @param {import('express').Response} res - Resposta.
 * @param {Function} next - Próximo.
 * @returns {void}
 */
export const validarPaginacao = (req, res, next) => {
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
    req.query.limite = 10;
  }

  next();
};

/**
 * Middleware para validar e parsear filtros JSON.
 * @param {import('express').Request} req - Requisição.
 * @param {import('express').Response} res - Resposta.
 * @param {Function} next - Próximo.
 * @returns {void}
 */
export const validarFiltros = (req, res, next) => {
  const { filtros } = req.query;

  if (filtros) {
    try {
      req.filtrosParsed = JSON.parse(filtros);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Filtros devem estar em JSON válido',
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
 * Middleware de log de requisições.
 * @param {import('express').Request} req - Requisição.
 * @param {import('express').Response} res - Resposta.
 * @param {Function} next - Próximo.
 * @returns {void}
 */
export const logRequisicoes = (req, res, next) => {
  const start = Date.now();
  const agora = new Date().toISOString();
  console.log(`IN ${req.method} ${req.path} - ${agora}`);

  res.on('finish', () => {
    const dur = Date.now() - start;
    const ok = res.statusCode >= 400 ? 'ERR' : 'OK';
    const line = `${ok} ${req.method} ${req.path} - ` + `${res.statusCode} - ${dur}ms`;
    console.log(line);
  });

  next();
};

/**
 * Middleware para validar IDs de documentos.
 * @param {string} [paramName="id"] - Nome do parâmetro na rota.
 * @return {Function} - Middleware Express.
 */
export const validarIdDocumento = (paramName = 'id') => {
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
 * Wrapper para funções async, capturando erros.
 * @param {Function} fn - Função Express async.
 * @return {Function} - Middleware Express.
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para validar Content-Type em POST/PUT/PATCH.
 * @param {import('express').Request} req - Requisição.
 * @param {import('express').Response} res - Resposta.
 * @param {Function} next - Próximo.
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
 * Middleware para sanitizar entrada.
 * Remove caracteres perigosos e aplica trim em strings.
 * @param {import('express').Request} req - Requisição.
 * @param {import('express').Response} res - Resposta.
 * @param {Function} next - Próximo.
 * @returns {void}
 */
export const sanitizarInput = (req, res, next) => {
  /**
   * @param {Object|Array|string|number|boolean|null} obj - Valor a sanitizar.
   * @return {Object|Array|string|number|boolean|null} - Valor sanitizado.
   */
  const sanitizarObjeto = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizarObjeto);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim().replace(/[<>]/g, '');
      } else {
        sanitized[key] = sanitizarObjeto(value);
      }
    }

    return sanitized;
  };

  if (req.body) {
    req.body = sanitizarObjeto(req.body);
  }

  next();
};

/**
 * Middleware para cache de resposta (headers).
 * @param {number} [maxAge=300] - Tempo em segundos.
 * @return {Function} - Middleware Express.
 */
export const setCacheHeaders = (maxAge = 300) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
    } else {
      const noCache = 'no-cache, no-store, must-revalidate';
      res.set('Cache-Control', noCache);
    }

    next();
  };
};

/**
 * Middleware para validar campos obrigatórios no body.
 * Suporta campos aninhados (ex.: 'dadosPessoais.nome').
 * @param {string[]} fields - Lista de campos obrigatórios.
 * @return {Function} - Middleware Express.
 */
export const validarCamposObrigatorios = (fields) => {
  return (req, res, next) => {
    const missingFields = [];

    fields.forEach((field) => {
      const fieldValue = getValoresAninhados(req.body, field);
      const vazio = fieldValue === undefined || fieldValue === null || fieldValue === '';
      if (vazio) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      const joined = missingFields.join(', ');
      const msg = `Campos obrigatórios faltantes: ${joined}`;
      return res.status(400).json({
        success: false,
        error: msg,
        fields: missingFields,
        code: 'VALIDATION_ERROR',
      });
    }

    next();
  };
};

/**
 * Acessa valores aninhados em objetos.
 * @param {Object} obj - Objeto de origem.
 * @param {string} path - Caminho (ex.: 'dadosPessoais.nome').
 * @return {*} - Valor encontrado ou undefined.
 */
const getValoresAninhados = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Formata resposta de sucesso.
 * @param {string} [message="Operação realizada com sucesso"] - Mensagem.
 * @return {Function} - Função que recebe dados e retorna resposta.
 */
export const formatarRespostaSucesso = (message = 'Operação realizada com sucesso') => {
  return (data) => ({
    success: true,
    message,
    data,
  });
};

/**
 * Processa ultimoDoc do Firestore para paginação.
 * Adiciona req.ultimoDocSnapshot se válido.
 * @param {import('express').Request} req - Requisição.
 * @param {import('express').Response} res - Resposta.
 * @param {Function} next - Próximo.
 * @returns {Promise<void>} - Promessa.
 */
export const processarUltimoDoc = async (req, res, next) => {
  const { ultimoDocId } = req.query;

  if (ultimoDocId) {
    try {
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
      const errMsg = 'Erro ao processar ultimoDocId';
      return res.status(400).json({
        success: false,
        error: errMsg,
        field: 'ultimoDocId',
        code: 'VALIDATION_ERROR',
      });
    }
  }

  next();
};
