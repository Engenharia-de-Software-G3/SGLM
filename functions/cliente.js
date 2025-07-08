// functions/cliente.js
/**
 * @file Define as rotas da API RESTful relacionadas a clientes.
 * Gerencia operações como criação e listagem de clientes.
 */

import express from 'express';
const router = express.Router();
import { criarCliente, listarClientes } from '../src/scripts/firestore/firestoreClientes.js';
//import { verificarDocumentoExistente } from '../src/scripts/firestore/firestoreUtils.js';

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

    // TODO: Adicionar validação mais robusta (incluindo autenticação por middleware)
    /**
     * @todo Implementar validação completa dos dados de entrada (CPF, dados pessoais, contato, endereço, documentos).
     * Considerar usar um esquema de validação (ex: Joi, Yup).
     * Integrar middleware de autenticação e autorização.
     * Adicionar validação de CPF duplicado usando verificarDocumentoExistente antes de criar.
     */
    // Validação básica
    if (!clienteData || !clienteData.cpf || !clienteData.dadosPessoais) {
      return res
        .status(400)
        .send('Dados do cliente incompletos (CPF e dadosPessoais são obrigatórios).');
    }

    // Chame a função do Firestore para criar o cliente
    const resultado = await criarCliente(clienteData);

    if (resultado.success) {
      // Use o ID retornado pela função criarCliente (que é o cpf)
      res.status(201).send({ message: 'Cliente criado com sucesso!', id: clienteData.cpf });
    } else {
      // A função criarCliente já trata e loga erros do Firestore e retorna { success: false, error: ... }
      res.status(500).send({ message: 'Erro ao criar cliente', error: resultado.error });
    }
  } catch (error) {
    // Captura erros inesperados durante o processamento da rota
    console.error('Erro inesperado na rota POST /clientes:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Rota GET para listar clientes.
 * Espera parâmetros de query para filtros e paginação.
 * @name GET /
 * @function
 * @memberof module:cliente
 * @param {object} req - Objeto de requisição do Express. Pode conter parâmetros de query para filtros e paginação em `req.query`.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de listagem no Firestore.
 */
router.get('/', async (req, res) => {
  try {
    /**
     * @todo Implementar corretamente a listagem de clientes.
     * Extrair filtros e paginação (pagina, limite) de req.query.
     * Validar e parsear os parâmetros de paginação.
     * Chamar a função listarClientes({ filtros, pagina, limite }).
     * Formatar a resposta incluindo a lista de clientes, total e paginação.
     */

    // Placeholder atual
    res.status(200).send({ message: 'Rota GET /clientes implementada em breve.' });
  } catch (error) {
    // Captura erros inesperados durante o processamento da rota
    console.error('Erro inesperado na rota GET /clientes:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
