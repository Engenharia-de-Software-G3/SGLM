/**
 * @file Define as rotas da API RESTful relacionadas a clientes.
 * Gerencia operações como criação e listagem de clientes.
 */

import express from 'express';
const router = express.Router();
import {
  criarCliente,
  listarClientes,
  atualizarCliente,
  deletarCliente,
  buscarClientePorCPF,
} from './scripts/firestore/firestoreClientes.js';
import { db } from './firebaseConfig.js';

/**
 * Rota POST para criar um novo cliente.
 * Espera os dados do cliente no corpo da requisição em formato JSON.
 * Valida dados básicos e chama a função de criação no Firestore.
 * @name POST /
 * @function
 * @memberof module:cliente
 * @param {object} req - Objeto de requisição do Express, contendo os dados do cliente em `req.body`.
 * @param {object} req.body - Os dados do novo cliente em formato JSON.
 * @param {string} req.body.cpf - O CPF do cliente (obrigatório).
 * @param {object} req.body.dadosPessoais - Dados pessoais do cliente (obrigatório).
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de criação no Firestore.
 */
router.post('/', async (req, res) => {
  try {
    const clienteData = req.body;

    if (!clienteData || !clienteData.cpf || !clienteData.dadosPessoais) {
      return res
        .status(400)
        .send('Dados do cliente incompletos (CPF e dadosPessoais são obrigatórios).');
    }

    if (!/^\d{11}$/.test(clienteData.cpf)) {
      return res.status(400).send('CPF inválido');
    }

    const resultado = await criarCliente(clienteData);

    if (resultado.success) {
      res.status(201).send({ message: 'Cliente criado com sucesso!', id: clienteData.cpf });
    } else {
      res.status(500).send({ message: 'Erro ao criar cliente', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro inesperado na rota POST /clientes:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Rota GET para listar clientes.
 * Suporta paginação e filtros por nome e tipo (PF/PJ).
 * Parâmetros de query:
 * - limite: Número de itens por página (padrão: 10)
 * - ultimoDocId: ID do último documento da página anterior (para paginação)
 * - filtros: JSON stringificado com { nome?: string, tipo?: 'PF' | 'PJ' }
 */
router.get('/', async (req, res) => {
  try {
    const { limite = '10', ultimoDocId, filtros = '{}' } = req.query;

    const limiteNum = parseInt(limite) || 10;
    let filtrosParsed;

    try {
      filtrosParsed = JSON.parse(filtros);
    } catch {
      filtrosParsed = {};
    }

    let ultimoDocSnapshot = null;
    if (ultimoDocId) {
      ultimoDocSnapshot = await db.collection('clientes').doc(ultimoDocId).get();
      if (!ultimoDocSnapshot.exists) {
        return res.status(400).json({ error: 'ultimoDocId inválido' });
      }
    }

    const { clientes, ultimoDoc } = await listarClientes({
      limite: limiteNum,
      ultimoDoc: ultimoDocSnapshot,
      filtros: filtrosParsed,
    });

    const resposta = {
      clientes,
      paginacao: {
        possuiMais: !!ultimoDoc,
        ultimoDocId: ultimoDoc?.id || null,
      },
    };

    res.status(200).json(resposta);
  } catch (error) {
    console.error('Erro na rota GET /clientes:', error);
    res.status(500).json({
      error: 'Erro interno no servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Rota GET para buscar um cliente específico por CPF.
 * Retorna todos os dados do cliente, incluindo subcoleções (endereços, contatos, documentos, dados bancários).
 * @name GET /:cpf
 * @function
 * @memberof module:cliente
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.cpf - CPF do cliente a ser buscado (pode estar formatado ou não).
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de busca no Firestore.
 */
router.get('/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;

    // Validação básica do CPF
    if (!cpf || cpf.trim().length === 0) {
      return res.status(400).json({ 
        error: 'CPF é obrigatório',
        message: 'Informe um CPF válido para busca.' 
      });
    }

    // Validação do formato do CPF
    if (!/^\d{11}$/.test(cpf)) {
      return res.status(400).send('CPF inválido');
    }

    const resultado = await buscarClientePorCPF(cpf);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        cliente: resultado.cliente
      });
    } else {
      const statusCode = resultado.error === 'Cliente não encontrado.' ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        error: resultado.error 
      });
    }
  } catch (error) {
    console.error('Erro inesperado na rota GET /clientes/:cpf:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Rota PUT para atualizar um cliente existente.
 * Espera o CPF do cliente como parâmetro na URL e os dados a serem atualizados no corpo da requisição.
 * Realiza a atualização parcial do cliente no Firestore.
 * @name PUT /:cpf
 * @function
 * @memberof module:cliente
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.cpf - CPF do cliente a ser atualizado.
 * @param {object} req.body - Os dados a serem atualizados do cliente em formato JSON.
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de atualização no Firestore.
 */
router.put('/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).send('Nenhum dado fornecido para atualização.');
    }

    if (!/^\d{11}$/.test(cpf)) {
      return res.status(400).send('CPF inválido');
    }

    const resultado = await atualizarCliente(cpf, updates);

    if (resultado.success) {
      res.status(200).send({ message: `Cliente ${cpf} atualizado com sucesso!` });
    } else {
      const statusCode = resultado.error === 'Cliente não encontrado.' ? 404 : 500;
      res.status(statusCode).send({ message: 'Erro ao atualizar cliente', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro inesperado na rota PUT /clientes/:cpf:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Rota DELETE para remover um cliente existente.
 * Espera o CPF do cliente como parâmetro na URL.
 * Remove o documento do cliente e todas as suas subcoleções associadas no Firestore.
 * @name DELETE /:cpf
 * @function
 * @memberof module:cliente
 * @param {object} req - Objeto de requisição do Express.
 * @param {string} req.params.cpf - CPF do cliente a ser removido.
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de exclusão no Firestore.
 */
router.delete('/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;

    // Validação do formato do CPF
    if (!/^\d{11}$/.test(cpf)) {
      return res.status(400).send('CPF inválido');
    }


    const resultado = await deletarCliente(cpf);

    if (resultado.success) {
      res.status(200).send({ message: `Cliente ${cpf} deletado com sucesso!` });
    } else {
      const statusCode = resultado.error === 'Cliente não encontrado.' ? 404 : 500;
      res.status(statusCode).send({ message: 'Erro ao deletar cliente', error: resultado.error });
    }
  } catch (error) {
    console.error('Erro inesperado na rota DELETE /clientes/:cpf:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
