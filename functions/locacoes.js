/**
 * @file Define as rotas da API RESTful relacionadas a locações.
 * Gerencia operações como criação, listagem, atualização e exclusão de locações.
 */

import express from 'express';
import cors from 'cors';
import {
  criarLocacao,
  listarLocacoes,
  buscarLocacaoPorId,
  atualizarLocacao,
  excluirLocacao,
  historicoLocacoesCliente,
  historicoLocacoesVeiculo,
} from '../src/scripts/firestore/firestoreLocacoes.js';

import {
  errorHandler,
  validatePagination,
  validateFilters,
  validateDocumentId,
  asyncHandler,
  validateContentType,
  sanitizeInput,
  requestLogger,
  validateRequiredFields,
  formatSuccessResponse,
  processLastDoc,
} from './middlewareHelper.js';

const app = express();

// Configurar CORS
app.use(cors({ origin: true }));

// Middlewares globais
app.use(requestLogger);
app.use(validateContentType);
app.use(sanitizeInput);
app.use(express.json());

/**
 * @route POST /
 * @summary Criar nova locação
 * @param {Object} req.body - Dados da locação
 * @returns {Object} Locação criada
 */
app.post(
  '/',
  validateRequiredFields(['cpfLocatario', 'placaVeiculo', 'dataInicio', 'dataFim', 'valor']),
  asyncHandler(async (req, res) => {
    const resultado = await criarLocacao(req.body);

    res.status(201).json(
      formatSuccessResponse('Locação criada com sucesso!')({
        id: resultado.id,
        locacao: req.body,
      }),
    );
  }),
);

/**
 * @route GET /
 * @summary Listar locações com paginação e filtros
 * @param {Object} req.query - Parâmetros de paginação e filtros
 * @returns {Object} Lista de locações
 */
app.get(
  '/',
  validatePagination,
  validateFilters,
  processLastDoc,
  asyncHandler(async (req, res) => {
    const resultado = await listarLocacoes({
      limite: req.query.limite,
      ultimoDoc: req.ultimoDocSnapshot,
      filtros: req.filtrosParsed,
    });

    res.status(200).json(
      formatSuccessResponse('Locações listadas com sucesso')({
        locacoes: resultado.locacoes,
        total: resultado.locacoes.length,
        paginacao: {
          possuiMais: !!resultado.ultimoDoc,
          ultimoDocId: resultado.ultimoDoc?.id || null,
        },
      }),
    );
  }),
);

/**
 * @route GET /cliente/:cpf
 * @summary Histórico de locações de um cliente
 * @param {string} cpf - CPF do cliente
 * @returns {Object[]} Locações do cliente
 */
app.get(
  '/cliente/:cpf',
  validateDocumentId('cpf'),
  asyncHandler(async (req, res) => {
    const locacoes = await historicoLocacoesCliente(req.params.cpf);

    res.status(200).json(
      formatSuccessResponse('Histórico do cliente obtido com sucesso')({
        cpf: req.params.cpf,
        locacoes,
        total: locacoes.length,
      }),
    );
  }),
);

/**
 * @route GET /veiculo/:chassi
 * @summary Histórico de locações de um veículo
 * @param {string} chassi - Chassi do veículo
 * @returns {Object[]} Locações do veículo
 */
app.get(
  '/veiculo/:chassi',
  validateDocumentId('chassi'),
  asyncHandler(async (req, res) => {
    const locacoes = await historicoLocacoesVeiculo(req.params.chassi);

    res.status(200).json(
      formatSuccessResponse('Histórico do veículo obtido com sucesso')({
        chassi: req.params.chassi,
        locacoes,
        total: locacoes.length,
      }),
    );
  }),
);

/**
 * @route GET /:id
 * @summary Buscar locação por ID
 * @param {string} id - ID da locação
 * @returns {Object} Locação encontrada
 */
app.get(
  '/:id',
  validateDocumentId('id'),
  asyncHandler(async (req, res) => {
    const locacao = await buscarLocacaoPorId(req.params.id);

    res.status(200).json(formatSuccessResponse('Locação encontrada com sucesso')(locacao));
  }),
);

/**
 * @route PUT /:id
 * @summary Atualizar locação
 * @param {string} id - ID da locação
 * @param {Object} req.body - Dados para atualização
 * @returns {Object} Sucesso
 */
app.put(
  '/:id',
  validateDocumentId('id'),
  asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização',
        code: 'VALIDATION_ERROR',
      });
    }

    await atualizarLocacao(req.params.id, req.body);

    res
      .status(200)
      .json(formatSuccessResponse(`Locação ${req.params.id} atualizada com sucesso!`)({}));
  }),
);

/**
 * @route PATCH /:id/status
 * @summary Atualizar apenas o status da locação
 * @param {string} id - ID da locação
 * @param {string} req.body.status - Novo status
 * @returns {Object} Sucesso
 */
app.patch(
  '/:id/status',
  validateDocumentId('id'),
  validateRequiredFields(['status']),
  asyncHandler(async (req, res) => {
    await atualizarLocacao(req.params.id, { status: req.body.status });

    res
      .status(200)
      .json(
        formatSuccessResponse(
          `Status da locação ${req.params.id} alterado para ${req.body.status} com sucesso!`,
        )({}),
      );
  }),
);

/**
 * @route DELETE /:id
 * @summary Excluir locação
 * @param {string} id - ID da locação
 * @returns {Object} Sucesso
 */
app.delete(
  '/:id',
  validateDocumentId('id'),
  asyncHandler(async (req, res) => {
    await excluirLocacao(req.params.id);

    res
      .status(200)
      .json(formatSuccessResponse(`Locação ${req.params.id} excluída com sucesso!`)({}));
  }),
);

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;
