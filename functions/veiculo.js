/**
 * @file Define as rotas da API relacionadas a veículos.
 * Inclui endpoints para criar, listar, atualizar e deletar veículos.
 */

import express from 'express';
import {
  alterarStatusVeiculo,
  atualizarPlaca,
  atualizarQuilometragemVeiculo,
  atualizarVeiculo,
  buscarPorChassi,
  buscarPorPlaca,
  criarVeiculo,
  gerarRelatorioFrota,
  listarQuilometragemVeiculo,
  listarVeiculos,
  listarVeiculosDisponiveis,
  registrarVenda,
} from './firestore/firestoreVeiculos.js';

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

const router = express.Router();

// Middlewares globais
router.use(logRequisicoes);
router.use(validateContentType);
router.use(sanitizarInput);

/**
 * @route POST /
 * @summary Criar novo veículo
 * @param {Object} req.body - Dados do veículo
 * @returns {Object} Veículo criado
 */
router.post(
  '/',
  validarCamposObrigatorios([
    'chassi',
    'placa',
    'modelo',
    'marca',
    'renavam',
    'quilometragem',
    'dataCompra',
  ]),
  asyncHandler(async (req, res) => {
    const resultado = await criarVeiculo(req.body);

    res.status(201).json(
      formatarRespostaSucesso('Veículo criado com sucesso!')({
        id: resultado.id,
        chassi: req.body.chassi,
        placa: req.body.placa,
      }),
    );
  }),
);

/**
 * @route GET /
 * @summary Listar veículos com paginação e filtros
 * @param {Object} req.query - Parâmetros de paginação e filtros
 * @returns {Object} Lista de veículos
 */
router.get(
  '/',
  validarPaginacao,
  validarFiltros,
  processarUltimoDoc,
  asyncHandler(async (req, res) => {
    const resultado = await listarVeiculos({
      limite: req.query.limite,
      ultimoDoc: req.ultimoDocSnapshot,
      filtros: req.filtrosParsed,
      incluirEstatisticas: req.query.incluirEstatisticas === 'true',
    });

    res.status(200).json(
      formatarRespostaSucesso('Veículos listados com sucesso')({
        veiculos: resultado.veiculos,
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
 * @route GET /disponiveis
 * @summary Listar apenas veículos disponíveis
 * @param {Object} req.query - Filtros opcionais
 * @returns {Object[]} Veículos disponíveis
 */
router.get(
  '/disponiveis',
  validarFiltros,
  asyncHandler(async (req, res) => {
    const resultado = await listarVeiculosDisponiveis(req.filtrosParsed);

    res
      .status(200)
      .json(formatarRespostaSucesso('Veículos disponíveis listados com sucesso')(resultado));
  }),
);

/**
 * @route GET /relatorio
 * @summary Gerar relatório da frota
 * @returns {Object} Relatório da frota
 */
router.get(
  '/relatorio',
  asyncHandler(async (req, res) => {
    const relatorio = await gerarRelatorioFrota();

    res.status(200).json(formatarRespostaSucesso('Relatório gerado com sucesso')(relatorio));
  }),
);

/**
 * @route GET /chassi/:chassi
 * @summary Buscar veículo por chassi
 * @param {string} chassi - Chassi do veículo
 * @returns {Object} Veículo encontrado
 */
router.get(
  '/chassi/:chassi',
  validarIdDocumento('chassi'),
  asyncHandler(async (req, res) => {
    const veiculo = await buscarPorChassi(req.params.chassi);

    res.status(200).json(formatarRespostaSucesso('Veículo encontrado com sucesso')(veiculo));
  }),
);

/**
 * @route GET /placa/:placa
 * @summary Buscar veículo por placa
 * @param {string} placa - Placa do veículo
 * @returns {Object} Veículo encontrado
 */
router.get(
  '/placa/:placa',
  validarIdDocumento('placa'),
  asyncHandler(async (req, res) => {
    const veiculo = await buscarPorPlaca(req.params.placa);

    res.status(200).json(formatarRespostaSucesso('Veículo encontrado com sucesso')(veiculo));
  }),
);

/**
 * @route GET /:chassi/quilometragem
 * @summary Listar quilometragem de um veículo
 * @param {string} chassi - Chassi do veículo
 * @returns {Object[]} Dados de quilometragem
 */
router.get(
  '/:chassi/quilometragem',
  validarIdDocumento('chassi'),
  asyncHandler(async (req, res) => {
    const dadosQuilometragem = await listarQuilometragemVeiculo(req.params.chassi);

    res
      .status(200)
      .json(
        formatarRespostaSucesso('Dados de quilometragem obtidos com sucesso')(dadosQuilometragem),
      );
  }),
);

/**
 * @route PUT /:chassi
 * @summary Atualizar veículo
 * @param {string} chassi - Chassi do veículo
 * @param {Object} req.body - Dados para atualização
 * @returns {Object} Sucesso
 */
router.put(
  '/:chassi',
  validarIdDocumento('chassi'),
  asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização',
        code: 'VALIDATION_ERROR',
      });
    }

    await atualizarVeiculo(req.params.chassi, req.body);

    res
      .status(200)
      .json(formatarRespostaSucesso(`Veículo ${req.params.chassi} atualizado com sucesso!`)({}));
  }),
);

/**
 * @route PATCH /:chassi/placa
 * @summary Atualizar apenas a placa do veículo
 * @param {string} chassi - Chassi do veículo
 * @param {string} req.body.placa - Nova placa
 * @returns {Object} Sucesso
 */
router.patch(
  '/:chassi/placa',
  validarIdDocumento('chassi'),
  validarCamposObrigatorios(['placa']),
  asyncHandler(async (req, res) => {
    await atualizarPlaca(req.params.chassi, req.body.placa);

    res
      .status(200)
      .json(
        formatarRespostaSucesso(`Placa do veículo ${req.params.chassi} atualizada com sucesso!`)(
          {},
        ),
      );
  }),
);

/**
 * @route PATCH /:chassi/quilometragem
 * @summary Atualizar quilometragem do veículo
 * @param {string} chassi - Chassi do veículo
 * @param {number} req.body.quilometragem - Nova quilometragem
 * @returns {Object} Sucesso
 */
router.patch(
  '/:chassi/quilometragem',
  validarIdDocumento('chassi'),
  validarCamposObrigatorios(['quilometragem']),
  asyncHandler(async (req, res) => {
    const { chassi } = req.params;
    const { quilometragem } = req.body;
    await atualizarQuilometragemVeiculo(chassi, quilometragem);
    const mensagemSucesso = `Quilometragem do veículo ${chassi} atualizada com sucesso!`;
    res.status(200).json(formatarRespostaSucesso(mensagemSucesso)({}));
  }),
);

/**
 * @route PATCH /:chassi/status
 * @summary Alterar status do veículo
 * @param {string} chassi - Chassi do veículo
 * @param {string} req.body.status - Novo status
 * @returns {Object} Sucesso
 */
router.patch(
  '/:chassi/status',
  validarIdDocumento('chassi'),
  validarCamposObrigatorios(['status']),
  asyncHandler(async (req, res) => {
    await alterarStatusVeiculo(req.params.chassi, req.body.status);

    res
      .status(200)
      .json(
        formatarRespostaSucesso(
          `Status do veículo ${req.params.chassi} alterado para ` +
            `${req.body.status} com sucesso!`,
        )({}),
      );
  }),
);

/**
 * @route POST /:chassi/venda
 * @summary Registrar venda do veículo
 * @param {string} chassi - Chassi do veículo
 * @param {string} req.body.dataVenda - Data da venda
 * @param {string} [req.body.observacoes] - Observações opcionais
 * @returns {Object} Sucesso
 */
router.post(
  '/:chassi/venda',
  validarIdDocumento('chassi'),
  validarCamposObrigatorios(['dataVenda']),
  asyncHandler(async (req, res) => {
    await registrarVenda(req.params.chassi, req.body.dataVenda, req.body.observacoes);

    res
      .status(200)
      .json(
        formatarRespostaSucesso(`Venda do veículo ${req.params.chassi} registrada com sucesso!`)(
          {},
        ),
      );
  }),
);

/**
 * @route DELETE /:chassi
 * @summary Deletar veículo (soft delete ou físico)
 * @param {string} chassi - Chassi do veículo
 * @param {boolean} [req.query.exclusaoFisica] - Se true, exclusão física
 * @returns {Object} Sucesso
 */
router.delete(
  '/:chassi',
  validarIdDocumento('chassi'),
  asyncHandler(async (req, res) => {
    const { chassi } = req.params;
    const exclusaoFisica = req.query.exclusaoFisica === 'true';

    // Implementar exclusão física se necessário. Por ora, usar soft delete.
    await alterarStatusVeiculo(chassi, 'vendido');

    const mensagem = exclusaoFisica
      ? `Veículo ${chassi} excluído com sucesso!`
      : `Veículo ${chassi} marcado como vendido com sucesso!`;

    res.status(200).json(formatarRespostaSucesso(mensagem)({}));
  }),
);

// Middleware de tratamento de erros
router.use(handlerErros);

export default router;
