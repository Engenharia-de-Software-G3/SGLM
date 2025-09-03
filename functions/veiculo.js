/**
 * @file Define as rotas da API relacionadas a veículos.
 * Inclui endpoints para criar, listar, atualizar e deletar veículos.
 */

import express from 'express';
const router = express.Router();

import {
  criarVeiculo,
  listarVeiculos,
  buscarPorId, buscaVeiculo,
  atualizarVeiculo,// Import this to help with DELETE and general updates
} from './scripts/firestore/firestoreVeiculos.js';

import { db } from './firebaseConfig.js';
import {buscarClientePorCPF} from "./scripts/firestore/firestoreClientes.js"; // Import db for direct Firestore operations if needed

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

    const resultado = await criarVeiculo(veiculoData);

    if (resultado.success) {
      res.status(201).send({ message: 'Veículo criado com sucesso!', id: resultado.id });
    } else {
      res.status(400).send({ message: 'Erro ao criar veículo', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro na rota POST /veiculos:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Rota GET para listar veículos com paginação e filtros.
 * @name GET /
 * @function
 * @memberof module:veiculo
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} [req.query.limite=10] - Número de itens por página
 * @param {string} [req.query.ultimoDocId] - ID do último documento para paginação
 * @param {string} [req.query.filtrosQuery] - Parâmetro para realizar filtragem via query params
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.get('/', async (req, res) => {
  try {
    const { limite, ultimoDocId, ...filtrosQuery } = req.query;

    // Converter e validar parâmetros
    let limiteNum = 10; // Padrão
    if (limite) {
      limiteNum = parseInt(limite, 10);
    }

    if (isNaN(limiteNum)) {
      return res.status(400).json({ error: 'Value for "limite" is not a valid integer.' });
    }

    const limiteAplicado = Math.min(limiteNum, 100);

    const filtrosParsed = {};
    Object.keys(filtrosQuery).forEach((key) => {
      if (filtrosQuery[key]) filtrosParsed[key] = filtrosQuery[key];
    });

    let ultimoDoc = null;
    if (ultimoDocId) {
      const lastDocSnapshot = await db.collection('veiculos').doc(ultimoDocId).get();
      if (!lastDocSnapshot.exists) {
        return res.status(400).json({ error: 'ID do último documento inválido' });
      }
      ultimoDoc = lastDocSnapshot;
    }

    const { veiculos, ultimoDoc: ultimoDocSnapshot } = await listarVeiculos({
      limite: limiteNum,
      ultimoDoc,
      filtros: filtrosParsed,
    });

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

router.get('/:idVeiculo', async (req, res) => {
  try {
    const { idVeiculo } = req.params;

    // Validação básica do CPF
    if (!idVeiculo || idVeiculo.trim().length === 0) {
      return res.status(400).json({
        error: 'id do Veículo é obrigatório',
        message: 'Informe um id do Veículo válido para busca.'
      });
    }

    const resultado = await buscaVeiculo(idVeiculo);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        veiculo: resultado.veiculo
      });
    } else {
      const statusCode = resultado.error === 'Veículo não encontrado.' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: resultado.error
      });
    }
  } catch (error) {
    console.error('Erro inesperado na rota GET /veiculos/:idVeiculo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});


/**
 * Rota PUT para atualizar um veículo.
 * Espera o id do veículo no parâmetro da rota.
 * Espera os dados a serem atualizados no corpo da requisição em formato JSON.
 * Pode atualizar placa, quilometragem, status (venda), etc.
 * @name PUT /:id
 * @function
 * @memberof module:veiculo
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.idVeiculo - id do veículo a ser atualizado.
 * @param {object} req.body - Objeto com os campos a serem atualizados.
 * @param {string} [req.body.placa] - Nova placa do veículo.
 * @param {number} [req.body.quilometragem] - Nova quilometragem do veículo.
 * @param {string} [req.body.dataVenda] - Data da venda para registrar (formato YYYY-MM-DD).
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.put('/:idVeiculo', async (req, res) => {
  try {
    const idVeiculo = req.params.idVeiculo;
    const updates = req.body;

    if (!idVeiculo || !updates || Object.keys(updates).length === 0) {
      return res.status(400).send('idVeiculo e/ou dados de atualização ausentes.');
    }

    const veiculo = await buscarPorId(idVeiculo);
    if (!veiculo) {
      return res.status(404).send('Veículo não encontrado.');
    }

    const updateData = { ...updates };

    const resultado = await atualizarVeiculo(idVeiculo, updateData);

    res.status(200).send({ message: 'Veículo atualizado com sucesso!' });
  } catch (error) {
    console.error(`Erro na rota PUT /veiculos/${req.params.idVeiculo}:`, error);
    res.status(500).send({ message: 'Erro ao atualizar veículo', error: error.message });
  }
});

/**
 * Rota DELETE para deletar um veículo.
 * Espera o id do veículo no parâmetro da rota.
 * @name DELETE /:idVeiculo
 * @function
 * @memberof module:veiculo
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.idVeiculo - id do veículo a ser deletado.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.delete('/:idVeiculo', async (req, res) => {
  try {
    const idVeiculo = req.params.idVeiculo;

    if (!idVeiculo) {
      return res.status(400).send('Id do veículo ausente.');
    }

    // Find the vehicle document by id to get its ID
    const snapshot = await db.collection('veiculos').where('id', '==', idVeiculo).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).send('Veículo não encontrado.');
    }

    const veiculoDocRef = snapshot.docs[0].ref;

    await veiculoDocRef.delete();

    res.status(200).send({ message: 'Veículo deletado com sucesso!' });
  } catch (error) {
    console.error(`Erro na rota DELETE /veiculos/${req.params.idVeiculo}:`, error);
    res.status(500).send({ message: 'Erro ao deletar veículo', error: error.message });
  }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
