/**
 * @file Rotas da API de manutenções de veículos.
 * Inclui endpoint para listar manutenções de um veículo.
 */

import express from 'express';
import { db } from './firebaseConfig.js';
import { listarManutencoes } from './firestore/firestoreManutencao.js';

const router = express.Router();

/**
 * GET /:veiculoId
 * Lista histórico de manutenções de um veículo.
 * @param {object} req - Requisição Express. Contém o ID em
 *   req.params.veiculoId.
 * @param {object} req.params - Parâmetros da rota.
 * @param {string} req.params.veiculoId - ID do veículo a consultar.
 * @param {object} res - Resposta do Express.
 * @returns {Promise<void>} Promessa resolvida ao enviar a resposta.
 * @throws {Error} Erros internos do servidor/Firestore.
 */
router.get('/:veiculoId', async (req, res) => {
  try {
    const { veiculoId } = req.params;

    if (!veiculoId) {
      return res.status(400).send('ID do veículo não fornecido.');
    }

    const veiculoDoc = await db.collection('veiculos').doc(veiculoId).get();

    if (!veiculoDoc.exists) {
      const notFoundMsg = `Veículo com ID ${veiculoId} não encontrado.`;
      return res.status(404).send(notFoundMsg);
    }

    const listaManutencoes = await listarManutencoes(veiculoId);

    // TODO: Tratar caso sem manutenções, se necessário.
    res.status(200).send(listaManutencoes);
  } catch (error) {
    // Erros inesperados durante o processamento da rota
    const baseMsg = 'Erro inesperado na rota GET /manutencoes/';
    const logMsg = `${baseMsg}${req.params.veiculoId}:`;
    console.error(logMsg, error);
    res.status(500).send('Erro interno do servidor.');
  }
});

// TODO: Implementar rotas POST para novas manutenções, se necessário.

/**
 * Exporta o roteador para uso no arquivo principal.
 * @type {import('express').Router}
 */
export default router;
