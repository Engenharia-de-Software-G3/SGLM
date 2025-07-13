/**
 * @file Define as rotas da API relacionadas a serviços.
 * Inclui um endpoint para criar serviços.
 */
import express from 'express';
const router = express.Router();

// Importando funções da Firestore para serviços
import { criarServicoAdicional} from '../src/scripts/firestore/firestoreServicosAdicionais.js';



/**
 * Rota POST para criar um novo serviço.
 * Espera os dados do serviço no corpo da requisição em formato JSON.
 * @name POST /
 * @function
 * @memberof module:servicos
 * @param {object} req - Objeto de requisição do Express, contendo os dados do serviços em `req.body`.
 * @param {object} res - Objeto de resposta do Express para enviar o status e o corpo da resposta.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 */

router.post('/', async (req, res) => {
    try {
        const servicoAdicionalData = req.body;

        // TODO: Adicionar validação mais robusta (incluindo autenticação por middleware)
        /**
         * @todo Adicionar validação de dados de entrada mais robusta para servicoAdicionalData.
         * Considerar usar um esquema de validação (ex: Joi, Yup).
         * Implementar autenticação por middleware.
         */
        if (!servicoAdicionalData || !servicoAdicionalData.chassiVeiculo || !servicoAdicionalData.nome || !servicoAdicionalData.data || !servicoAdicionalData.valor) {
            return res
                .status(400)
                .send('Dados do serviço incompletos (chassi do veículo, nome do serviço, data de cadastro do serviço e valor do serviço são obrigatórios).');
        }

        // Chame a função do Firestore para criar o serviço
        const resultado = await criarServicoAdicional(servicoAdicionalData);

        if (resultado.success) {
            // Use o ID retornado pela função criarServicoAdicional
            res.status(201).send({ message: 'Serviço criado com sucesso!', id: resultado.id });
        } else {
            res.status(500).send({ message: 'Erro ao criar Serviço', error: resultado.error });
        }
    } catch (error) {
        console.error('Erro na rota POST /servicos:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});

// TODO: Implementar outras rotas para veículos (PUT, DELETE)

/**
 * Rota GET para listar veículos.
 * Atualmente um placeholder.
 * @name GET /
 * @function
 * @memberof module:servicos
 * @param {object} req - Objeto de requisição do Express. Pode conter parâmetros de query para filtros e paginação.
 * @param {object} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Uma Promessa que resolve quando a resposta é enviada.
 */
router.get('/', async (req, res) => {
    try {
        /**
         * @todo Implementar corretamente a listagem de serviços.
         * Extrair filtros e paginação de req.query.
         * Chamar uma função de listagem de serviços do firestoreServicosAdicionais.js (se existir/for criada).
         * Formatar e enviar a resposta com os dados dos veículos, total e paginação.
         */
        res.status(200).send({ message: 'Rota GET /servicos implementada em breve.' });
    } catch (error) {
        console.error('Erro na rota GET /veiculos:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});

/**
 * Exporta o roteador Express para ser utilizado no arquivo principal (index.js).
 * @type {express.Router}
 */

export default router;
