/**
 * @file Define as rotas da API RESTful relacionadas a clientes.
 * Gerencia operações como criação e listagem de clientes.
 */

import express from 'express';
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

import {
  handlerErros,
  validarPaginacao,
  validarFiltros,
  validarIdDocumento,
  asyncHandler,
  validateContentType,
  sanitizarInput,
  logRequisicoes,
  validarCamposObrigatorios,
  formatarRespostaSucesso,
  processarUltimoDoc,
} from './middlewareHelper.js';

const router = express.Router();

// Middlewares globais
router.use(logRequisicoes);
router.use(validateContentType);
router.use(sanitizarInput);

/**
 * @route POST /
 * @summary Criar um novo cliente
 * @param {Object} req.body - Dados do cliente
 * @returns {Object} Cliente criado
 */
router.post(
  '/',
  validarCamposObrigatorios(['cpf', 'dadosPessoais.nome', 'endereco', 'contato.email']),
  asyncHandler(async (req, res) => {
    await criarCliente(req.body);
    res.status(201).json(
      formatarRespostaSucesso('Cliente criado com sucesso!')({
        id: req.body.cpf,
        cpf: req.body.cpf,
      }),
    );
  }),
);

/**
 * @route GET /
 * @summary Listar clientes com paginação e filtros
 * @param {Object} req.query - Parâmetros de paginação e filtros
 * @returns {Object} Lista de clientes
 */
router.get(
  '/',
  validarPaginacao,
  validarFiltros,
  processarUltimoDoc,
  asyncHandler(async (req, res) => {
    const resultado = await listarClientes({
      limite: req.query.limite,
      ultimoDoc: req.ultimoDocSnapshot,
      filtros: req.filtrosParsed,
      incluirSubcolecoes: req.query.incluirSubcolecoes === 'true',
    });

    res.status(200).json(
      formatarRespostaSucesso('Clientes listados com sucesso')({
        clientes: resultado.clientes,
        total: resultado.total,
        paginacao: {
          possuiMais: !!resultado.ultimoDoc,
          ultimoDocId: resultado.ultimoDoc?.id || null,
        },
      }),
    );
  }),
);

/**
 * @route GET /buscar-nome
 * @summary Buscar clientes por nome
 * @param {string} req.query.nome - Nome do cliente
 * @returns {Object[]} Lista de clientes encontrados
 */
router.get(
  '/buscar-nome',
  validarPaginacao,
  asyncHandler(async (req, res) => {
    const { nome } = req.query;

    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro nome é obrigatório',
        field: 'nome',
        code: 'VALIDATION_ERROR',
      });
    }

    const clientes = await buscarClientesPorNome(nome, req.query.limite);

    res.status(200).json(
      formatarRespostaSucesso('Busca realizada com sucesso')({
        clientes,
        total: clientes.length,
      }),
    );
  }),
);

/**
 * @route GET /:cpf
 * @summary Buscar cliente por CPF
 * @param {string} cpf - CPF do cliente
 * @returns {Object} Cliente encontrado
 */
router.get(
  '/:cpf',
  validarIdDocumento('cpf'),
  asyncHandler(async (req, res) => {
    const cliente = await buscarClientePorCPF(
      req.params.cpf,
      req.query.incluirSubcolecoes === 'true',
    );

    res.status(200).json(formatarRespostaSucesso('Cliente encontrado com sucesso')(cliente));
  }),
);

/**
 * @route GET /:cpf/elegibilidade
 * @summary Verificar elegibilidade para locação
 * @param {string} cpf - CPF do cliente
 * @returns {Object} Resultado da verificação
 */
router.get(
  '/:cpf/elegibilidade',
  validarIdDocumento('cpf'),
  asyncHandler(async (req, res) => {
    const resultado = await verificarElegibilidadeLocacao(req.params.cpf);

    res.status(200).json(formatarRespostaSucesso('Verificação realizada com sucesso')(resultado));
  }),
);

/**
 * @route PUT /:cpf
 * @summary Atualizar cliente existente
 * @param {string} cpf - CPF do cliente
 * @param {Object} req.body - Dados para atualização
 * @returns {Object} Sucesso
 */
router.put(
  '/:cpf',
  validarIdDocumento('cpf'),
  asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização',
        code: 'VALIDATION_ERROR',
      });
    }

    await atualizarCliente(req.params.cpf, req.body);

    res
      .status(200)
      .json(formatarRespostaSucesso(`Cliente ${req.params.cpf} atualizado com sucesso!`)({}));
  }),
);

/**
 * @route PATCH /:cpf/status
 * @summary Alterar status do cliente
 * @param {string} cpf - CPF do cliente
 * @param {string} req.body.status - Novo status
 * @returns {Object} Sucesso
 */
router.patch(
  '/:cpf/status',
  validarIdDocumento('cpf'),
  validarCamposObrigatorios(['status']),
  asyncHandler(async (req, res) => {
    await alterarStatusCliente(req.params.cpf, req.body.status);

    res
      .status(200)
      .json(
        formatarRespostaSucesso(
          `Status do cliente ${req.params.cpf} alterado para ${req.body.status} com sucesso!`,
        )({}),
      );
  }),
);

/**
 * @route DELETE /:cpf
 * @summary Remover cliente existente (soft delete ou completo)
 * @param {string} cpf - CPF do cliente
 * @param {boolean} [req.query.exclusaoCompleta] - Se true, exclusão permanente
 * @returns {Object} Sucesso
 */
router.delete(
  '/:cpf',
  validarIdDocumento('cpf'),
  asyncHandler(async (req, res) => {
    const exclusaoCompleta = req.query.exclusaoCompleta === 'true';
    await excluirCliente(req.params.cpf, exclusaoCompleta);

    const tipoExclusao = exclusaoCompleta ? 'excluído permanentemente' : 'desativado';
    res
      .status(200)
      .json(formatarRespostaSucesso(`Cliente ${req.params.cpf} ${tipoExclusao} com sucesso!`)({}));
  }),
);

// Middleware de tratamento de erros
router.use(handlerErros);

export default router;
