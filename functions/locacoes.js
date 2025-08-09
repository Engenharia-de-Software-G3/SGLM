/**
 * @file Rotas da API para locações.
 * Criação, listagem, atualização e exclusão de locações.
 */

import express from 'express';
import cors from 'cors';
import {
  atualizarLocacao,
  buscarLocacaoPorId,
  criarLocacao,
  excluirLocacao,
  historicoLocacoesCliente,
  historicoLocacoesVeiculo,
  listarLocacoes,
} from './firestore/firestoreLocacoes.js';

import {
  asyncHandler,
  formatarRespostaSucesso,
  handlerErros,
  logRequisicoes,
  processarUltimoDoc,
  sanitizarInput,
  validarCamposObrigatorios,
  validarFiltros,
  validarIdDocumento,
  validarPaginacao,
  validateContentType,
} from './middlewareHelper.js';

const app = express();

// Configurar CORS
app.use(cors({ origin: true }));

// Middlewares globais
app.use(logRequisicoes);
app.use(validateContentType);
app.use(sanitizarInput);
app.use(express.json());

/**
 * @route POST /
 * @summary Criar nova locação
 * @param {Object} req.body - Dados da locação
 * @returns {Object} Locação criada
 */
app.post(
  '/',
  validarCamposObrigatorios(['cpfLocatario', 'placaVeiculo', 'dataInicio', 'dataFim', 'valor']),
  asyncHandler(async (req, res) => {
    const resultado = await criarLocacao(req.body);

    res.status(201).json(
      formatarRespostaSucesso('Locação criada com sucesso!')({
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
  validarPaginacao,
  validarFiltros,
  processarUltimoDoc,
  asyncHandler(async (req, res) => {
    const resultado = await listarLocacoes({
      limite: req.query.limite,
      ultimoDoc: req.ultimoDocSnapshot,
      filtros: req.filtrosParsed,
    });

    res.status(200).json(
      formatarRespostaSucesso('Locações listadas com sucesso')({
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
  validarIdDocumento('cpf'),
  asyncHandler(async (req, res) => {
    const { cpf } = req.params;
    const locacoes = await historicoLocacoesCliente(cpf);

    res.status(200).json(
      formatarRespostaSucesso('Histórico do cliente obtido com sucesso')({
        cpf,
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
  validarIdDocumento('chassi'),
  asyncHandler(async (req, res) => {
    const { chassi } = req.params;
    const locacoes = await historicoLocacoesVeiculo(chassi);

    res.status(200).json(
      formatarRespostaSucesso('Histórico do veículo obtido com sucesso')({
        chassi,
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
  validarIdDocumento('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const locacao = await buscarLocacaoPorId(id);

    const msg = 'Locação encontrada com sucesso';
    res.status(200).json(formatarRespostaSucesso(msg)(locacao));
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
  validarIdDocumento('id'),
  asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização',
        code: 'VALIDATION_ERROR',
      });
    }

    const { id } = req.params;
    await atualizarLocacao(id, req.body);

    const msg = `Locação ${id} atualizada com sucesso!`;
    res.status(200).json(formatarRespostaSucesso(msg)({}));
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
  validarIdDocumento('id'),
  validarCamposObrigatorios(['status']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    await atualizarLocacao(id, { status });

    const msg = `Status da locação ${id} alterado para ` + `${status} com sucesso!`;
    res.status(200).json(formatarRespostaSucesso(msg)({}));
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
  validarIdDocumento('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await excluirLocacao(id);

    const msg = `Locação ${id} excluída com sucesso!`;
    res.status(200).json(formatarRespostaSucesso(msg)({}));
  }),
);

// Middleware de tratamento de erros
app.use(handlerErros);

export default app;
