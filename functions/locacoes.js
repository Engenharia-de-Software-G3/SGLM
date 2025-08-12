import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import {
  criarLocacao,
  listarLocacoes,
  atualizarLocacao,
  excluirLocacao,
} from '../src/scripts/firestore/firestoreLocacoes.js';
import * as EmailJS from 'emailjs-com';

const app = express();

app.use(cors({ origin: true }));

// Middleware to parse JSON request bodies
app.use(express.json());

// Create rental
app.post('/', async (req, res) => {
  try {
    const locacaoData = req.body;
    console.log('Dados recebidos:', locacaoData);
    const result = await criarLocacao(locacaoData);
    console.log('Resultado da criação:', result);
    if (result.success) {
      // Buscar cliente para obter o e-mail
      const cleanCpf = locacaoData.cpfLocatario.replace(/\D/g, '');
      const clientSnapshot = await db.collection('clientes').where('cpf', '==', cleanCpf).limit(1).get();
      if (!clientSnapshot.empty) {
        const client = clientSnapshot.docs[0].data();
        if (client.email) {
          // Gerar o PDF (você precisará mover a lógica do generateContractPDF para o backend)
          const contractData = {
            id: result.id,
            client: {
              nomeCompleto: client.dadosPessoais.nomeCompleto,
              cpf: locacaoData.cpfLocatario,
              rg: client.dadosPessoais.rg || 'Não informado',
              email: client.email || 'Não informado',
              telefone: client.dadosPessoais.telefone || 'Não informado',
              endereco: client.dadosPessoais.endereco || 'Não informado',
              nacionalidade: client.dadosPessoais.nacionalidade || 'Brasileiro',
              estadoCivil: client.dadosPessoais.estadoCivil || 'Solteiro',
              profissao: client.dadosPessoais.profissao || 'Autônomo',
            },
            vehicle: {
              // Buscar veículo
              marca: locacaoData.marca || 'Não informado',
              modelo: locacaoData.modelo || 'Não informado',
              placa: locacaoData.placaVeiculo,
              renavam: locacaoData.renavam || 'Não informado',
              chassi: locacaoData.chassi || 'Não informado',
              motor: locacaoData.motor || 'Não informado',
              cor: locacaoData.cor || 'Não informado',
              ano: locacaoData.ano || 'Não informado',
              quilometragem: locacaoData.quilometragem || '0',
            },
            locacao: {
              dataInicio: locacaoData.dataInicio,
              dataFim: locacaoData.dataFim,
              valor: locacaoData.valor,
              periodicidadePagamento: locacaoData.periodicidadePagamento,
            },
          };

          // Mover generateContractPDF para o backend ou chamar via API
          // Aqui, assumimos que você tem uma função generateContractPDF no backend
          const pdfBuffer = await generateContractPDF(contractData); // Implementar no backend

          // Enviar e-mail
          const formData = new FormData();
          formData.append('attachment', pdfBuffer, `contrato_${result.id}.pdf`);
          formData.append('to_email', client.email);
          formData.append('to_name', client.dadosPessoais.nomeCompleto);
          formData.append('contract_id', result.id);

          await EmailJS.sendForm(
            'YOUR_SERVICE_ID',
            'YOUR_TEMPLATE_ID',
            formData,
            'YOUR_USER_ID'
          );
        }
      }
      res.status(201).json(result);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// List rentals with pagination
app.get('/', async (req, res) => {
  try {
    const { limite, ultimoDoc } = req.query;

    // Provide a default value for limite if not provided in query params
    const limiteNum = limite ? parseInt(limite) : 10; // Default to 10 if limite is undefined

    // Check if the parsed limite is a valid number
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

// Update rental
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

// Delete rental
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
