// functions/index.js
import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

// Rota de teste
app.get('/hello-world', (req, res) => {
  return res.status(200).send('Hello World!');
});

// Rota de status
app.get('/status', (req, res) => {
  return res.status(200).json({
    status: 'online',
    message: 'SGLM API funcionando',
    timestamp: new Date().toISOString(),
  });
});

// Rota clientes
import clientesRouter from './cliente.js';
app.use('/clientes', clientesRouter);

// Rota veículos
import veiculosRouter from './veiculo.js';
app.use('/veiculos', veiculosRouter);

// Rota fornecedores
import fornecedoresRouter from './fornecedores.js';
app.use('/fornecedores', fornecedoresRouter);

// Rota manutenções
import manutencoesRouter from './manutencoes.js';
app.use('/manutencoes', manutencoesRouter);

// Rota vistorias
import vistoriasRouter from './vistoria.js';
app.use('/vistorias', vistoriasRouter);

// Rota locações
import locacoesRouter from './locacoes.js';
app.use('/locacoes', locacoesRouter);

export const api = functions.https.onRequest(app);
