// functions/fornecedores.js
import express from 'express';
const router = express.Router();

// TODO: Importe sua função do Firestore para criar fornecedores aqui
// Certifique-se de que o arquivo firestoreFornecedores.js usa export const
// para a sua função de criação.
// Exemplo:
import { criarFornecedor } from './scripts/firestore/firestoreFornecedores.js';

/**
 * Rota POST para criar um novo fornecedor.
 * Espera os dados do fornecedor no corpo da requisição em formato JSON.
 * Valida dados básicos e chama a função de criação no Firestore.
 * @name POST /
 * @function
 * @memberof module:fornecedor
 * @param {object} req - Objeto de requisição do Express, contendo os dados do fornecedor em `req.body`.
 * @param {object} req.body - Os dados do novo fornecedor em formato JSON.
 * @param {string} req.body.cnpj - O CNPJ do fornecedor (obrigatório, usado como ID).
 * @param {string} req.body.razaoSocial - A razão social do fornecedor (obrigatório).
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 * @throws {Error} Em caso de erro interno no servidor ou no processo de criação no Firestore.
 */
router.post('/', async (req, res) => {
  try {
    const fornecedorData = req.body;

    // TODO: Adicionar validação mais robusta (incluindo autenticação por middleware)
    /**
     * @todo Integrar middleware de autenticação e autorização.
     * Adicionar validação de CNPJ duplicado usando verificarDocumentoExistente antes de criar.
     */
    // Validação básica (ex: CNPJ e razão social são obrigatórios)
    if (!fornecedorData || !fornecedorData.cnpj) {
      return res.status(400).send('Dados do fornecedor incompletos (CNPJ é obrigatório).');
    }

    const resultado = await criarFornecedor(fornecedorData);

    if (resultado.success) {
      // Assumindo que o ID retornado é o CNPJ
      res.status(201).send({ message: 'Fornecedor criado com sucesso!', id: fornecedorData.cnpj });
    } else {
      res.status(500).send({ message: 'Erro ao criar fornecedor', error: resultado.error });
    }
  } catch (error) {
    // Captura erros inesperados durante o processamento da rota
    console.error('Erro inesperado na rota POST /fornecedores:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

// TODO: Implementar outras rotas para fornecedores (GET, PUT, DELETE)

/**
 * Rota GET para listar fornecedores.
 * Atualmente um placeholder.
 * @name GET /
 * @function
 * @memberof module:fornecedor
 * @param {object} req - Objeto de requisição do Express. Pode conter parâmetros de query para filtros e paginação.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 */
router.get('/', async (req, res) => {
  try {
    /**
     * @todo Implementar corretamente a listagem de fornecedores.
     * Extrair filtros e paginação de req.query.
     * Chamar uma função de listagem de fornecedores do firestoreFornecedores.js (se existir/for criada).
     * Formatar e enviar a resposta com os dados dos fornecedores, total e paginação.
     */
    res.status(200).send({ message: 'Rota GET /fornecedores implementada em breve.' });
  } catch (error) {
    console.error('Erro na rota GET /fornecedores:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
