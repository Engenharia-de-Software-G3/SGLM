// functions/fornecedores.js
import express from 'express';
// TODO: Importe sua função do Firestore para criar fornecedores aqui
// Certifique-se de que o arquivo firestoreFornecedores.js usa export const
// para a sua função de criação.
// Exemplo:
import { criarFornecedor } from './firestore/firestoreFornecedores.js';
const router = express.Router();

/**
 * Rota POST para criar um novo fornecedor.
 * Espera os dados do fornecedor no corpo da requisição em JSON.
 * Valida dados básicos e chama a função de criação no Firestore.
 * @name POST /
 * @function
 * @memberof fornecedor
 * @param {object} req - Requisição Express, com dados em req.body.
 * @param {object} req.body - Dados do novo fornecedor em JSON.
 * @param {string} req.body.cnpj - CNPJ do fornecedor (obrigatório).
 * @param {string} req.body.razaoSocial - Razão social (obrigatório).
 * @param {object} res - Resposta do Express para status e corpo.
 * @returns {Promise<void>} Promessa resolvida ao enviar resposta.
 * @throws {Error} Em caso de erro interno ou no Firestore.
 */
router.post('/', async (req, res) => {
  try {
    const fornecedorData = req.body;

    // TODO: Adicionar validação mais robusta (autenticação por middleware)
    /**
     * @todo Integrar middleware de autenticação e autorização.
     * Adicionar validação de CNPJ duplicado antes de criar.
     */
    // Validação básica (CNPJ e razão social obrigatórios)
    if (!fornecedorData || !fornecedorData.cnpj) {
      return res.status(400).send('Dados do fornecedor incompletos (CNPJ é obrigatório).');
    }

    const resultado = await criarFornecedor(fornecedorData);

    if (resultado.success) {
      // Assumindo que o ID retornado é o CNPJ
      res.status(201).send({
        message: 'Fornecedor criado com sucesso!',
        id: fornecedorData.cnpj,
      });
    } else {
      res.status(500).send({
        message: 'Erro ao criar fornecedor',
        error: resultado.error,
      });
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
 * Placeholder.
 * @name GET /
 * @function
 * @memberof fornecedor
 * @param {object} req - Requisição Express. Pode conter filtros e paginação.
 * @param {object} res - Resposta do Express.
 * @returns {Promise<void>} Promessa resolvida ao enviar resposta.
 */
router.get('/', async (req, res) => {
  try {
    /**
     * @todo Implementar corretamente a listagem de fornecedores.
     * Extrair filtros e paginação de req.query.
     * Chamar função de listagem do firestoreFornecedores.js.
     * Formatar e enviar resposta com dados, total e paginação.
     */
    res.status(200).send({
      message: 'Rota GET /fornecedores implementada em breve.',
    });
  } catch (error) {
    console.error('Erro na rota GET /fornecedores:', error);
    res.status(500).send('Erro interno do servidor.');
  }
});

/**
 * Exporta o roteador Express para ser usado no arquivo principal (index.js).
 * @type {express.Router}
 */
export default router;
