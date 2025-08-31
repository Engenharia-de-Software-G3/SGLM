/**
 * @file Define as rotas da API relacionadas a veículos.
 * Inclui endpoints para criar, listar, atualizar e deletar veículos.
 */

import express from 'express';
const router = express.Router();

import {
  atualizarQuilometragemVeiculo,
  criarVeiculo,
  listarVeiculos,
  atualizarPlaca,
  registrarVenda,
  buscarPorChassi,
} from '../src/scripts/firestore/firestoreVeiculos.js';

import { db } from '../firebaseConfig.js';

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
 * @param {string} [req.query.filtros] - JSON stringificado com filtros (placa, status, marca)
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.get('/', async (req, res) => {
  try {
    const { limite, ultimoDocId, filtros = '{}' } = req.query;

    const limiteNum = limite ? Math.min(parseInt(limite) || 10, 100) : 10; // Default 10, max 100

    if (isNaN(limiteNum)) {
      return res.status(400).json({ error: 'Value for "limite" is not a valid integer.' });
    }

    let filtrosParsed;
    try {
      filtrosParsed = JSON.parse(filtros);
    } catch {
      filtrosParsed = {};
    }

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

/**
 * Rota PUT para atualizar um veículo.
 * Espera o chassi do veículo no parâmetro da rota.
 * Espera os dados a serem atualizados no corpo da requisição em formato JSON.
 * Pode atualizar placa, quilometragem, status (venda), etc.
 * @name PUT /:chassi
 * @function
 * @memberof module:veiculo
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.chassi - Chassi do veículo a ser atualizado.
 * @param {object} req.body - Objeto com os campos a serem atualizados.
 * @param {string} [req.body.placa] - Nova placa do veículo.
 * @param {number} [req.body.quilometragem] - Nova quilometragem do veículo.
 * @param {string} [req.body.dataVenda] - Data da venda para registrar (formato YYYY-MM-DD).
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.put('/:chassi', async (req, res) => {
  try {
    const chassi = req.params.chassi;
    const updates = req.body;

    if (!chassi || !updates || Object.keys(updates).length === 0) {
      return res.status(400).send('Chassi e/ou dados de atualização ausentes.');
    }

    const veiculo = await buscarPorChassi(chassi);
    if (!veiculo) {
      return res.status(404).send('Veículo não encontrado.');
    }

    let resultado;

    if (updates.placa !== undefined) {
      resultado = await atualizarPlaca(chassi, updates.placa);
      if (!resultado.success) throw new Error(resultado.error);
    }

    if (updates.quilometragem !== undefined) {
      if (isNaN(parseInt(updates.quilometragem))) {
        return res.status(400).send('Quilometragem deve ser um número válido.');
      }
      resultado = await atualizarQuilometragemVeiculo(chassi, parseInt(updates.quilometragem));
      if (!resultado.success) throw new Error(resultado.error);
    }

    if (updates.dataVenda !== undefined) {
      resultado = await registrarVenda(chassi, updates.dataVenda);
      if (!resultado.success) throw new Error(resultado.error);
    }

    if (resultado === undefined) {
      return res
        .status(200)
        .send({ message: 'Veículo encontrado, mas nenhum campo atualizável fornecido.' });
    }

    res.status(200).send({ message: 'Veículo atualizado com sucesso!' });
  } catch (error) {
    console.error(`Erro na rota PUT /veiculos/${req.params.chassi}:`, error);
    res.status(500).send({ message: 'Erro ao atualizar veículo', error: error.message });
  }
});

/**
 * Rota DELETE para deletar um veículo.
 * Espera o chassi do veículo no parâmetro da rota.
 * @name DELETE /:chassi
 * @function
 * @memberof module:veiculo
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.chassi - Chassi do veículo a ser deletado.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
router.delete('/:chassi', async (req, res) => {
  try {
    const chassi = req.params.chassi;

    if (!chassi) {
      return res.status(400).send('Chassi do veículo ausente.');
    }

    const snapshot = await db.collection('veiculos').where('chassi', '==', chassi).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).send('Veículo não encontrado.');
    }

    const veiculoDocRef = snapshot.docs[0].ref;

    await veiculoDocRef.delete();

    res.status(200).send({ message: 'Veículo deletado com sucesso!' });
  } catch (error) {
    console.error(`Erro na rota DELETE /veiculos/${req.params.chassi}:`, error);
    res.status(500).send({ message: 'Erro ao deletar veículo', error: error.message });
  }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
