/**
 * @file Rotas da API de vistorias.
 * Inclui endpoint para criar vistorias.
 */
import express from 'express';
import { criarVistoria } from './firestore/firestoreVistoria.js';

const router = express.Router();

/**
 * POST /
 * Cria uma nova vistoria.
 * @name POST /
 * @function
 * @param {object} req - Requisição Express. Dados em req.body.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} - Resolve ao enviar resposta.
 */
router.post('/', async (req, res) => {
  try {
    const vistoriaData = req.body;

    // TODO: validar melhor (ex.: Joi/Yup) e autenticar por middleware
    const camposObrigatoriosMsg =
      'Dados da vistoria incompletos ' +
      '(chassi do veículo, placa do veículo, nome da empresa, ' +
      'nome do funcionário, quilometragem e data são obrigatórios).';

    if (
      !vistoriaData ||
      !vistoriaData.chassiVeiculo ||
      !vistoriaData.placaVeiculo ||
      !vistoriaData.nomeEmpresa ||
      !vistoriaData.nomeFuncionario ||
      !vistoriaData.quilometragem ||
      !vistoriaData.data
    ) {
      return res.status(400).send(camposObrigatoriosMsg);
    }

    const resultado = await criarVistoria(vistoriaData);

    if (resultado.success) {
      res.status(201).send({ message: 'Vistoria criada com sucesso!' });
    } else {
      res.status(500).send({
        message: 'Erro ao criar Vistoria',
        error: resultado.error,
      });
    }
  } catch (error) {
    console.error('Erro na rota POST /vistoria:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

// TODO: Implementar outras rotas (PUT, DELETE)

/**
 * GET /
 * Lista vistorias (placeholder).
 * @name GET /
 * @function
 * @param {object} req - Requisição Express (filtros/paginação em query).
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} - Resolve ao enviar resposta.
 */
router.get('/', async (req, res) => {
  try {
    const msg = 'Rota GET /vistoria implementada em breve.';
    res.status(200).send({ message: msg });
  } catch (error) {
    console.error('Erro na rota GET /vistoria:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Exporta o roteador para uso no arquivo principal.
 * @type {import('express').Router}
 */
export default router;
