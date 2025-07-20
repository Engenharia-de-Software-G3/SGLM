/**
 * @file Define as rotas da API relacionadas a veículos.
 * Inclui um endpoint para criar veículos.
 */

import express from 'express';
const router = express.Router();

// Importando funções da Firestore para veículos
import { criarVeiculo, listarVeiculos } from '../src/scripts/firestore/firestoreVeiculos.js';
// import { verificarDocumentoExistente } from '../src/scripts/firestore/firestoreUtils.js';

/**
 * Rota POST para criar um novo veículo.
 * Espera os dados do veículo no corpo da requisição em formato JSON.
 * @name POST /
 * @function
 * @memberof module:veiculo
 * @param {object} req - Objeto de requisição do Express, contendo os dados do veículo em `req.body`.
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 */
router.post('/', async (req, res) => {
  try {
    const veiculoData = req.body;

    // TODO: Adicionar validação mais robusta (incluindo autenticação por middleware)
    /**
     * @todo Adicionar validação de dados de entrada mais robusta para veiculoData.
     * Considerar usar um esquema de validação (ex: Joi, Yup).
     * Implementar autenticação por middleware.
     */
    if (!veiculoData || !veiculoData.chassi || !veiculoData.placa || !veiculoData.modelo) {
      return res
        .status(400)
        .send('Dados do veículo incompletos (chassi, placa e modelo são obrigatórios).');
    }

    // Chame a função do Firestore para criar o veículo
    const resultado = await criarVeiculo(veiculoData);

    if (resultado.success) {
      // Use o ID retornado pela função criarVeiculo (que é a placa)
      res.status(201).send({ message: 'Veículo criado com sucesso!', id: resultado.id });
    } else {
      res.status(500).send({ message: 'Erro ao criar veículo', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro na rota POST /veiculos:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

// TODO: Implementar outras rotas para veículos (PUT, DELETE)

/**
 * Rota GET para listar veículos.
 * Atualmente um placeholder.
 * @name GET /
 * @function
 * @memberof module:veiculo
 * @param {object} req - Objeto de requisição do Express. Pode conter parâmetros de query para filtros e paginação.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 */
/**
 * Rota GET para listar veículos com paginação e filtros.
 * @name GET /
 * @function
 * @memberof module:veiculo
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} [req.query.limite=10] - Número de itens por página
 * @param {string} [req.query.ultimoDocId] - ID do último documento para paginação
 * @param {string} [req.query.filtros] - JSON stringificado com filtros (placa, status)
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.get('/', async (req, res) => {
  try {
    const { limite = '10', ultimoDocId, filtros = '{}' } = req.query;

    // Converter e validar parâmetros
    const limiteNum = Math.min(parseInt(limite) || 10, 100); // Limite máximo de 100 itens
    let filtrosParsed;

    try {
      filtrosParsed = JSON.parse(filtros);
    } catch {
      filtrosParsed = {};
    }

    // Obter documento de referência para paginação
    let ultimoDoc = null;
    if (ultimoDocId) {
      ultimoDoc = await db.collection('veiculos').doc(ultimoDocId).get();
      if (!ultimoDoc.exists) {
        return res.status(400).json({ error: 'ID do último documento inválido' });
      }
    }

    // Chamar função de listagem
    const { veiculos, ultimoDoc: ultimoDocSnapshot } = await listarVeiculos({
      limite: limiteNum,
      ultimoDoc,
      filtros: filtrosParsed,
    });

    // Formatar resposta
    res.status(200).json({
      veiculos,
      paginacao: {
        possuiMais: !!ultimoDocSnapshot,
        proximoDocId: ultimoDocSnapshot?.id || null,
      },
    });
  } catch (error) {
    console.error('Erro na rota GET /veiculos:', error);
    res.status(500).json({
      error: 'Erro interno no servidor',
      ...(process.env.NODE_ENV === 'development' && { detalhes: error.message }),
    });
  }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
