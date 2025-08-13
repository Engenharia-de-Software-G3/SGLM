/**
 * @file Define as rotas da API RESTful relacionadas a contratos jurídicos.
 * Gerencia operações como criação e busca de contratos.
 */

import express from 'express';
const router = express.Router();
import {
  criarContratoJuridico,
  buscarContratoPorId,
} from '../src/scripts/firestore/firestoreContratos.js';

/**
 * Rota POST para criar um novo contrato jurídico.
 * Recebe o CPF do cliente, o chassi do veículo e os termos do contrato no corpo da requisição.
 * @name POST /
 * @function
 * @memberof module:contrato
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.body.cpfCliente - CPF do cliente (obrigatório).
 * @param {string} req.body.chassiVeiculo - Chassi do veículo (obrigatório).
 * @param {object} req.body.termosContrato - Termos do contrato (obrigatório).
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.post('/', async (req, res) => {
  try {
    const { cpfCliente, chassiVeiculo, termosContrato } = req.body;

    // Validação básica
    if (!cpfCliente || !chassiVeiculo || !termosContrato) {
      return res
        .status(400)
        .send(
          'Dados do contrato incompletos (cpfCliente, chassiVeiculo e termosContrato são obrigatórios).'
        );
    }

    const resultado = await criarContratoJuridico({ cpfCliente, chassiVeiculo, termosContrato });

    if (resultado.success) {
      res.status(201).send({ message: 'Contrato criado com sucesso!', id: resultado.id });
    } else {
      const statusCode = resultado.error.includes('encontrado') ? 404 : 500;
      res
        .status(statusCode)
        .send({ message: 'Erro ao criar contrato', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro inesperado na rota POST /contratos:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Rota GET para buscar um contrato pelo ID.
 * @name GET /:id
 * @function
 * @memberof module:contrato
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.id - ID do contrato.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await buscarContratoPorId(id);

    if (resultado.success) {
      res.status(200).json(resultado.contrato);
    } else {
      const statusCode = resultado.error === 'Contrato não encontrado.' ? 404 : 500;
      res
        .status(statusCode)
        .json({ message: 'Erro ao buscar contrato', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro inesperado na rota GET /contratos/:id:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

export default router;