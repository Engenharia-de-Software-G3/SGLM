/**
 * @file Define as rotas da API relacionadas a histórico de manutenções de veículos.
 * Inclui um endpoint para listar manutenções de um veículo específico.
 */

import express from 'express';
import { db } from './firebaseConfig.js';
const router = express.Router();

import { listarManutencoes } from './scripts/firestore/firestoreManutencao.js';

/**
 * Rota GET para listar o histórico de manutenções de um veículo específico.
 * Espera o ID do veículo como parâmetro na URL.
 * @name GET /:veiculoId
 * @function
 * @memberof module:manutencoes
 * @param {object} req - Objeto de requisição do Express. Contém o ID do veículo em `req.params.veiculoId`.
 * @param {object} req.params - Parâmetros da rota.
 * @param {string} req.params.veiculoId - O ID do veículo cujo histórico de manutenções será listado.
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de listagem no Firestore.
 */
router.get('/:veiculoId', async (req, res) => {
  try {
    const veiculoId = req.params.veiculoId;

    if (!veiculoId) {
      return res.status(400).send('ID do veículo não fornecido.');
    }

    const veiculoDoc = await db.collection('veiculos').doc(veiculoId).get();

    if (!veiculoDoc.exists) {
      return res.status(404).send(`Veículo com ID ${veiculoId} não encontrado.`);
    }

    const listaManutencoes = await listarManutencoes(veiculoId);

    // TODO: Implementar tratamento de caso onde o veículo não existe ou não tem manutenções

    res.status(200).send(listaManutencoes);
  } catch (error) {
    // Captura erros inesperados durante o processamento da rota
    console.error(`Erro inesperado na rota GET /manutencoes/${req.params.veiculoId}:`, error);
    res.status(500).send('Erro interno do servidor.');
  }
});

// TODO: Implementar rotas para adicionar novas manutenções (POST) se necessário

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
