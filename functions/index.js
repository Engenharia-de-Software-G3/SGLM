// functions/index.js
/**
 * @file Ponto de entrada principal para as Cloud Functions do SGLM.
 * Configura o aplicativo Express e encaminha as requisições HTTP
 * para os roteadores específicos (clientes, veiculos, etc.).
 * A inicialização do Firebase Admin SDK e a instância do Firestore são gerenciadas em firebaseConfig.js.
 */

import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
const app = express();

/**
 * Middleware do Express para parsear corpos de requisição em JSON.
 */
app.use(express.json());

/**
 * Middleware do Express para permitir requisições de origem cruzada (CORS).
 * Permite requisições de qualquer origem no ambiente de desenvolvimento.
 */
app.use(cors({ origin: true }));

// Teste da API (opcional)
/**
 * Rota de teste simples para verificar se a API está respondendo.
 * Responde com "Hello World!".
 * @name GET /hello-world
 * @function
 * @memberof module:index
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {void} Envia uma resposta HTTP.
 */
app.get('/hello-world', (req, res) => {
  return res.status(200).send('Hello World!');
});

// Rota cliente
/**
 * Importa e monta o roteador para as operações relacionadas a clientes.
 * Todas as rotas definidas em './cliente' serão acessíveis sob o prefixo '/clientes'.
 * @type {express.Router}
 */
import clientesRouter from './cliente.js';
app.use('/clientes', clientesRouter);

// Rota veículo
/**
 * Importa e monta o roteador para as operações relacionadas a veículos.
 * Todas as rotas definidas em './veiculo' serão acessíveis sob o prefixo '/veiculos'.
 * @type {express.Router}
 */
import veiculosRouter from './veiculo.js';
app.use('/veiculos', veiculosRouter);

// Rota fornecedor
/**
 * Importa e monta o roteador para as operações relacionadas a fornecedores.
 * Todas as rotas definidas em './fornecedores' serão acessíveis sob o prefixo '/fornecedores'.
 * @type {express.Router}
 */
import fornecedoresRouter from './fornecedores.js';
app.use('/fornecedores', fornecedoresRouter);

// Rota manutenções
/**
 * Importa e monta o roteador para as operações relacionadas a histórico de manutenções.
 * Todas as rotas definidas em './manutencoes' serão acessíveis sob o prefixo '/manutencoes'.
 * @type {express.Router}
 */
import manutencoesRouter from './manutencoes.js'; // Importe o roteador de manutenções
app.use('/manutencoes', manutencoesRouter); // Use o roteador com o prefixo '/manutencoes'

// Rota vistoria
/**
 * Importa e monta o roteador para as operações relacionadas a vistorias.
 * Todas as rotas definidas em './vistoria' serão acessíveis sob o prefixo '/vistoria'.
 * @type {express.Router}
 */
import vistoriaRouter from './vistoria.js';
app.use('/vistoria', vistoriaRouter);

/**
 * Exporta o aplicativo Express como uma Cloud Function HTTP.
 * Esta função será o ponto de entrada para todas as requisições HTTP
 * direcionadas para este endpoint da Cloud Function (por exemplo, '/api').
 * @name api
 * @function
 * @memberof module:index
 * @param {object} req - Objeto de requisição HTTP recebido pela Cloud Function.
 * @param {object} res - Objeto de resposta HTTP para enviar a resposta.
 * @returns {void} Envia uma resposta HTTP através do aplicativo Express.
 */
export const api = functions.https.onRequest(app);
