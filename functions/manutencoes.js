/**
 * @file Define as rotas da API relacionadas a histórico de manutenções de veículos.
 * Inclui um endpoint para listar manutenções de um veículo específico.
 */

import express from 'express';
import { db } from './firebaseConfig.js';
const router = express.Router();

import {
  adicionarManutencao,
  deletarManutencao,
  listarManutencao,
  listarManutencoes
} from './scripts/firestore/firestoreManutencao.js';

/**
 * Rota POST para criar uma nova manutenção.
 * Espera os dados da manuntenção no corpo da requisição em formato JSON.
 * Valida dados básicos e chama a função de criação no Firestore.
 * @name POST /
 * @function
 * @memberof module:manutencao
 * @param {object} req - Objeto de requisição do Express, contendo os dados da manutenção em `req.body`.
 * @param {object} req.body - Os dados da nova manutenção em formato JSON.
 * @param {string} req.body.placaVeiculo - A placa do veículo (obrigatório).
 * @param {object} req.body.nomeServico - Nome do serviço (obrigatório).
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de criação no Firestore.
 */
router.post('/', async (req, res) => {
  try {
    const manutencaoData = req.body;

    // TODO: Adicionar validação mais robusta (incluindo autenticação por middleware)
    /**
     * @todo Implementar validação completa dos dados de entrada.
     * Considerar usar um esquema de validação (ex: Joi, Yup).
     * Integrar middleware de autenticação e autorização.
     */
    // Validação básica
    if (!manutencaoData || !manutencaoData.placaVeiculo || !manutencaoData.nomeServico) {
      return res
          .status(400)
          .send('Dados da manutenção incompletos (Placa veículo e nome da manutenção são obrigatórios).');
    }

    // Chame a função do Firestore para criar a manutenção
    const resultado = await adicionarManutencao(manutencaoData);

    if (resultado.success) {
      // Use o ID retornado pela função adicionarManutencao
      res.status(201).send({ message: 'Manutenção criada com sucesso!', id: resultado.id});
    } else {
      res.status(500).send({ message: 'Erro ao criar manutenção', error: resultado.error });
    }
  } catch (error) {
    // Captura erros inesperados durante o processamento da rota
    console.error('Erro inesperado na rota POST /manutencoes:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Rota GET para listar o histórico de manutenções.
 * @function
 * @memberof module:manutencoes
 * @param {object} req.params - Parâmetros da rota.
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de listagem no Firestore.
 */
router.get('/', async (req, res) => {
  try{
    const listaManutencoes = await listarManutencoes();

    res.status(200).send(listaManutencoes);
  } catch (error) {
    console.error(`Erro inesperado na rota GET /manutencoes`, error);
    res.status(500).send('Erro interno do servidor.');
  }
});


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

    const listaManutencoes = await listarManutencao(veiculoId);

    // TODO: Implementar tratamento de caso onde o veículo não existe ou não tem manutenções

    res.status(200).send(listaManutencoes);
  } catch (error) {
    // Captura erros inesperados durante o processamento da rota
    console.error(`Erro inesperado na rota GET /manutencoes/${req.params.veiculoId}:`, error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Rota DELETE para remover uma manutenção existente.
 * Espera o id da manutenção como parâmetro na URL.
 * Remove o documento da manutenção e todas as suas subcoleções associadas no Firestore.
 * @name DELETE /:idManutencao
 * @function
 * @memberof module:manutencoes
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.id - id da manutenção a ser removida.
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de exclusão no Firestore.
 */
router.delete('/:idManutencao', async (req, res) => {
  try {
    const { idManutencao } = req.params;

    const resultado = await deletarManutencao(idManutencao);

    if (resultado.success) {
      res.status(200).send({ message: `Manutenção ${idManutencao} deletada com sucesso!` });
    } else {
      const statusCode = resultado.error === 'Manutenção não encontrada.' ? 404 : 500;
      res.status(statusCode).send({ message: 'Erro ao deletar manutenção', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro inesperado na rota DELETE /manutencoes/:idManutencao:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
