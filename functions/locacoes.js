import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import {
  criarLocacao,
  listarLocacoes,
  atualizarLocacao,
  excluirLocacao, buscaLocacao,
} from './scripts/firestore/firestoreLocacoes.js';

const app = express();

app.use(cors({ origin: true }));

app.use(express.json());

app.post('/', async (req, res) => {
  try {
    const locacaoData = req.body;
    const result = await criarLocacao(locacaoData);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', async (req, res) => {
  try {
    const { limite, ultimoDoc } = req.query;

    const limiteNum = limite ? parseInt(limite) : 10;
    if (isNaN(limiteNum)) {
      return res.status(400).json({ error: 'Value for "limite" is not a valid integer.' });
    }

    const result = await listarLocacoes({ limite: limiteNum, ultimoDoc });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error listing rentals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/:idLocacao', async (req, res) => {
  try {
    const { idLocacao } = req.params;

    if (!idLocacao || idLocacao.trim().length === 0) {
      return res.status(400).json({
        error: 'id da locação é obrigatório',
        message: 'Informe um id da locação válido para busca.'
      });
    }

    const resultado = await buscaLocacao(idLocacao);

    if (resultado.success) {
      res.status(200).json({
        success: true,
        locacao: resultado.locacao
      });
    } else {
      const statusCode = resultado.error === 'Locação não encontrada.' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: resultado.error
      });
    }
  } catch (error) {
    console.error('Erro inesperado na rota GET /locacoes/:idLocacao:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

app.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locacaoData = req.body;
    const result = await atualizarLocacao(id, locacaoData);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error updating rental:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await excluirLocacao(id);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error deleting rental:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;