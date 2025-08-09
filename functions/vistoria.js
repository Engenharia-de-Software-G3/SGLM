/**
 * @file Define as rotas da API relacionadas a vistorias.
 * Inclui um endpoint para criar vistorias.
 */
import express from 'express';
const router = express.Router();

// Importando funções da Firestore para vistoria
import { criarVistoria } from './scripts/firestore/firestoreVistoria.js';

/**
 * Rota POST para criar uma nova vistoria.
 * Espera os dados da vistoria no corpo da requisição em formato JSON.
 * @name POST /
 * @function
 * @memberof module:vistoria
 * @param {object} req - Objeto de requisição do Express, contendo os dados da vistoria em `req.body`.
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 */

router.post('/', async (req, res) => {
  try {
    const vistoriaData = req.body;

    // TODO: Adicionar validação mais robusta (incluindo autenticação por middleware)
    /**
     * @todo Adicionar validação de dados de entrada mais robusta para vistoriaData.
     * Considerar usar um esquema de validação (ex: Joi, Yup).
     * Implementar autenticação por middleware.
     */
    if (
      !vistoriaData ||
      !vistoriaData.chassiVeiculo ||
      !vistoriaData.placaVeiculo ||
      !vistoriaData.nomeEmpresa ||
      !vistoriaData.nomeFuncionario ||
      !vistoriaData.quilometragem ||
      !vistoriaData.data
    ) {
      return res
        .status(400)
        .send(
          'Dados da vistoria incompletos (chassi do veículo, placa do veículo, nome da empresa, nome do funcionário, quilometragem e data da vistoria são obrigatórios).',
        );
    }

    // Chame a função do Firestore para criar a vistoria
    const resultado = await criarVistoria(vistoriaData);

    if (resultado.success) {
      // Use o ID retornado pela função criarVistoria
      res.status(201).send({ message: 'Vistoria criada com sucesso!' });
    } else {
      res.status(500).send({ message: 'Erro ao criar Vistoria', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro na rota POST /vistoria:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

// TODO: Implementar outras rotas para vistoria (PUT, DELETE)

/**
 * Rota GET para listar vistorias.
 * Atualmente um placeholder.
 * @name GET /
 * @function
 * @memberof module:vistoria
 * @param {object} req - Objeto de requisição do Express. Pode conter parâmetros de query para filtros e paginação.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 */
router.get('/', async (req, res) => {
  try {
    /**
     * @todo Implementar corretamente a listagem de vistorias.
     * Extrair filtros e paginação de req.query.
     * Chamar uma função de listagem de vistorias do firestoreVistoria.js (se existir/for criada).
     * Formatar e enviar a resposta com os dados das vistorias, total e paginação.
     */
    res.status(200).send({ message: 'Rota GET /vistoria implementada em breve.' });
  } catch (error) {
    console.error('Erro na rota GET /vistoria:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */

export default router;
