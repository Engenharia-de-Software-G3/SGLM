const request = require('supertest');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreLocacoes.js', () => ({
  criarLocacao: jest.fn(),
  listarLocacoes: jest.fn(),
  atualizarLocacao: jest.fn(),
  excluirLocacao: jest.fn(),
}));

const {
  criarLocacao,
  listarLocacoes,
  atualizarLocacao,
  excluirLocacao,
} = require('../scripts/firestore/firestoreLocacoes.js');

describe('Locações Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar um mock manual do app de locações
    const express = require('express');
    const mockApp = express();
    
    mockApp.use(require('cors')({ origin: true }));
    mockApp.use(express.json());
    
    // Mock da rota POST
    mockApp.post('/', async (req, res) => {
      try {
        const locacaoData = req.body;
        const result = await criarLocacao(locacaoData);
        if (result.success) {
          res.status(201).json(result);
        } else {
          res.status(400).json({ error: result.error });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    // Mock da rota GET
    mockApp.get('/', async (req, res) => {
      try {
        const { limite, ultimoDoc } = req.query;
        const limiteNum = limite ? parseInt(limite) : 10;
        
        if (isNaN(limiteNum)) {
          return res.status(400).json({ error: 'Value for "limite" is not a valid integer.' });
        }
        
        const result = await listarLocacoes({ limite: limiteNum, ultimoDoc });
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    // Mock da rota PUT
    mockApp.put('/:id', async (req, res) => {
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
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    // Mock da rota DELETE
    mockApp.delete('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await excluirLocacao(id);
        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(400).json({ error: result.error });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    app = mockApp;
  });

  describe('POST /', () => {
    test('deve criar locação com dados válidos', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-05',
        valorDiario: 100.00,
        observacoes: 'Locação de teste'
      };

      criarLocacao.mockResolvedValue({
        success: true,
        id: 'locacao123',
        locacao: locacaoData
      });

      const response = await request(app)
        .post('/')
        .send(locacaoData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        id: 'locacao123',
        locacao: locacaoData
      });

      expect(criarLocacao).toHaveBeenCalledWith(locacaoData);
    });

    test('deve retornar erro 400 quando criarLocacao falha', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123'
      };

      criarLocacao.mockResolvedValue({
        success: false,
        error: 'Dados obrigatórios ausentes'
      });

      const response = await request(app)
        .post('/')
        .send(locacaoData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Dados obrigatórios ausentes'
      });
    });

    test('deve capturar erros inesperados', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123'
      };

      criarLocacao.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .post('/')
        .send(locacaoData)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });

    test('deve processar locação com dados completos', async () => {
      const locacaoCompleta = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo456',
        dataInicio: '2024-02-01T10:00:00Z',
        dataFim: '2024-02-07T18:00:00Z',
        valorDiario: 150.50,
        valorTotal: 1053.50,
        status: 'ativa',
        observacoes: 'Cliente preferencial',
        servicosAdicionais: ['GPS', 'Cadeirinha'],
        seguro: {
          tipo: 'completo',
          valor: 50.00
        }
      };

      criarLocacao.mockResolvedValue({
        success: true,
        id: 'locacao456',
        locacao: locacaoCompleta
      });

      const response = await request(app)
        .post('/')
        .send(locacaoCompleta)
        .expect(201);

      expect(criarLocacao).toHaveBeenCalledWith(locacaoCompleta);
      expect(response.body.success).toBe(true);
    });

    test('deve retornar erro 400 quando clienteId está ausente', async () => {
      const locacaoData = {
        veiculoId: 'veiculo123',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-05',
        valorDiario: 100.00,
        observacoes: 'Locação de teste'
      };

      const response = await request(app)
          .post('/')
          .send(locacaoData)
          .expect(400);

      expect(response.body.error).toBe('clienteId é obrigatório');
    });

    test('deve retornar erro 400 quando veiculoId está ausente', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-05',
        valorDiario: 100.00,
        observacoes: 'Locação de teste'
      };

      const response = await request(app)
          .post('/')
          .send(locacaoData)
          .expect(400);

      expect(response.body.error).toBe('veiculoId é obrigatório');
    });

    test('deve retornar erro 400 quando dataInicio estiver em formato inválido', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123',
        dataInicio: '01-01-2024', // Formato inválido
        dataFim: '2024-01-05',
        valorDiario: 100.00,
        observacoes: 'Locação de teste'
      };

      const response = await request(app)
          .post('/')
          .send(locacaoData)
          .expect(400);

      expect(response.body.error).toBe('dataInicio deve estar no formato ISO 8601');
    });

    test('deve retornar erro 400 quando valorDiario não for numérico', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-05',
        valorDiario: '100.00', // Valor enviado como string
        observacoes: 'Locação de teste'
      };

      const response = await request(app)
          .post('/')
          .send(locacaoData)
          .expect(400);

      expect(response.body.error).toBe('valorDiario deve ser um número válido');
    });

    test('deve rejeitar locação com serviços adicionais inválidos', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-05',
        valorDiario: 100.00,
        servicosAdicionais: ['GPS', 12345], // Serviço inválido (número)
        observacoes: 'Locação de teste'
      };

      const response = await request(app)
          .post('/')
          .send(locacaoData)
          .expect(400);

      expect(response.body.error).toBe('Serviços adicionais devem ser strings');
    });

    test('deve rejeitar locação com seguro com valor inválido', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-05',
        valorDiario: 100.00,
        seguro: { tipo: 'completo', valor: '50.00' }, // Valor de seguro como string
        observacoes: 'Locação de teste'
      };

      const response = await request(app)
          .post('/')
          .send(locacaoData)
          .expect(400);

      expect(response.body.error).toBe('Seguro valor deve ser um número');
    });

    test('deve retornar erro 500 quando houver falha no banco de dados', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-05',
        valorDiario: 100.00,
        observacoes: 'Locação de teste'
      };

      criarLocacao.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
          .post('/')
          .send(locacaoData)
          .expect(500);

      expect(response.body.error).toBe('Erro interno do servidor');
    });
  });

  describe('GET /', () => {
    test('deve listar locações com parâmetros padrão', async () => {
      const mockResult = {
        locacoes: [
          {
            id: 'loc1',
            clienteId: 'cliente1',
            veiculoId: 'veiculo1',
            status: 'ativa'
          }
        ],
        ultimoDoc: null,
        total: 1
      };

      listarLocacoes.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(listarLocacoes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: undefined
      });
    });

    test('deve aplicar limite personalizado', async () => {
      const mockResult = {
        locacoes: [],
        ultimoDoc: null,
        total: 0
      };

      listarLocacoes.mockResolvedValue(mockResult);

      await request(app)
        .get('/?limite=5')
        .expect(200);

      expect(listarLocacoes).toHaveBeenCalledWith({
        limite: 5,
        ultimoDoc: undefined
      });
    });

    test('deve retornar erro 400 para limite inválido', async () => {
      const response = await request(app)
        .get('/?limite=abc')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Value for "limite" is not a valid integer.'
      });

      expect(listarLocacoes).not.toHaveBeenCalled();
    });

    test('deve usar limite padrão quando não especificado', async () => {
      const mockResult = {
        locacoes: [],
        ultimoDoc: null
      };

      listarLocacoes.mockResolvedValue(mockResult);

      await request(app)
        .get('/')
        .expect(200);

      expect(listarLocacoes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: undefined
      });
    });

    test('deve processar ultimoDoc quando fornecido', async () => {
      const mockResult = {
        locacoes: [],
        ultimoDoc: null
      };

      listarLocacoes.mockResolvedValue(mockResult);

      await request(app)
        .get('/?ultimoDoc=docId123')
        .expect(200);

      expect(listarLocacoes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: 'docId123'
      });
    });

    test('deve capturar erros inesperados', async () => {
      listarLocacoes.mockRejectedValue(new Error('Erro no Firestore'));

      const response = await request(app)
        .get('/')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });

    test('deve retornar uma lista vazia quando não houver locações', async () => {
      const mockResult = {
        locacoes: [],
        ultimoDoc: null,
        total: 0
      };

      listarLocacoes.mockResolvedValue(mockResult);

      const response = await request(app)
          .get('/')
          .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(listarLocacoes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: undefined
      });
    });

    test('deve retornar erro 400 quando ultimoDoc for inválido', async () => {
      const response = await request(app)
          .get('/?ultimoDoc=invalidDocId')
          .expect(400);

      expect(response.body).toEqual({
        error: 'Value for "ultimoDoc" is invalid or not found.'
      });

      expect(listarLocacoes).not.toHaveBeenCalled();
    });

    test('deve retornar locações sem último documento', async () => {
      const mockResult = {
        locacoes: [
          { id: 'loc1', clienteId: 'cliente1', veiculoId: 'veiculo1', status: 'ativa' }
        ],
        ultimoDoc: null,
        total: 1
      };

      listarLocacoes.mockResolvedValue(mockResult);

      const response = await request(app)
          .get('/')
          .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(listarLocacoes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: undefined
      });
    });

    test('deve restringir limite máximo', async () => {
      const mockResult = {
        locacoes: [],
        ultimoDoc: null,
        total: 0
      };

      const limiteMaximo = 100; // Exemplo de valor limite máximo definido

      listarLocacoes.mockResolvedValue(mockResult);

      await request(app)
          .get('/?limite=1000') // Número acima do limite máximo
          .expect(200);

      // Limite não deve ultrapassar o valor máximo definido
      expect(listarLocacoes).toHaveBeenCalledWith({
        limite: limiteMaximo,
        ultimoDoc: undefined
      });
    });

    test('deve aplicar filtro de status', async () => {
      const mockResult = {
        locacoes: [
          { id: 'loc1', clienteId: 'cliente1', veiculoId: 'veiculo1', status: 'ativa' }
        ],
        ultimoDoc: null,
        total: 1
      };

      listarLocacoes.mockResolvedValue(mockResult);

      await request(app)
          .get('/?status=ativa')
          .expect(200);

      expect(listarLocacoes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: undefined,
        status: 'ativa'
      });
    });
  });

  describe('PUT /:id', () => {
    test('deve atualizar locação com dados válidos', async () => {
      const updateData = {
        status: 'finalizada',
        dataFim: '2024-01-10',
        observacoes: 'Locação finalizada com sucesso'
      };

      atualizarLocacao.mockResolvedValue({
        success: true,
        locacao: { id: 'loc123', ...updateData }
      });

      const response = await request(app)
        .put('/loc123')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        locacao: { id: 'loc123', ...updateData }
      });

      expect(atualizarLocacao).toHaveBeenCalledWith('loc123', updateData);
    });

    test('deve retornar erro 400 quando atualizarLocacao falha', async () => {
      const updateData = {
        status: 'cancelada'
      };

      atualizarLocacao.mockResolvedValue({
        success: false,
        error: 'Locação não encontrada'
      });

      const response = await request(app)
        .put('/loc123')
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Locação não encontrada'
      });
    });

    test('deve capturar erros inesperados', async () => {
      const updateData = { status: 'ativa' };

      atualizarLocacao.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .put('/loc123')
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });

    test('deve processar atualização com dados parciais', async () => {
      const updateData = {
        valorTotal: 1500.00
      };

      atualizarLocacao.mockResolvedValue({
        success: true,
        locacao: { id: 'loc123', valorTotal: 1500.00 }
      });

      const response = await request(app)
        .put('/loc123')
        .send(updateData)
        .expect(200);

      expect(atualizarLocacao).toHaveBeenCalledWith('loc123', updateData);
      expect(response.body.success).toBe(true);
    });

    test('deve retornar erro 400 quando não houver dados no corpo da requisição', async () => {
      const response = await request(app)
          .put('/loc123')
          .send({}) // Enviando um corpo vazio
          .expect(400);

      expect(response.body).toEqual({
        error: 'Dados de atualização são obrigatórios.'
      });

      expect(atualizarLocacao).not.toHaveBeenCalled();
    });

    test('deve retornar erro 404 quando a locação não for encontrada', async () => {
      const updateData = { status: 'finalizada' };

      atualizarLocacao.mockResolvedValue({
        success: false,
        error: 'Locação não encontrada'
      });

      const response = await request(app)
          .put('/loc999') // ID não encontrado
          .send(updateData)
          .expect(404);

      expect(response.body).toEqual({
        error: 'Locação não encontrada'
      });
    });

    test('deve retornar erro 400 quando o status for inválido', async () => {
      const updateData = { status: 'invalido' };

      const response = await request(app)
          .put('/loc123')
          .send(updateData)
          .expect(400);

      expect(response.body).toEqual({
        error: 'Status inválido. Valores permitidos: "ativa", "finalizada", "cancelada".'
      });

      expect(atualizarLocacao).not.toHaveBeenCalled();
    });

    test('deve processar atualização com campo opcional', async () => {
      const updateData = {
        observacoes: 'Observação atualizada'
      };

      atualizarLocacao.mockResolvedValue({
        success: true,
        locacao: { id: 'loc123', observacoes: 'Observação atualizada' }
      });

      const response = await request(app)
          .put('/loc123')
          .send(updateData)
          .expect(200);

      expect(atualizarLocacao).toHaveBeenCalledWith('loc123', updateData);
      expect(response.body.success).toBe(true);
      expect(response.body.locacao.observacoes).toBe('Observação atualizada');
    });

    test('deve retornar erro 500 quando ocorrer uma falha no banco de dados', async () => {
      const updateData = { status: 'finalizada' };

      // Simular erro de banco de dados
      atualizarLocacao.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
          .put('/loc123')
          .send(updateData)
          .expect(500);

      expect(response.body).toEqual({
        error: 'Erro interno do servidor'
      });
    });
  });

  describe('DELETE /:id', () => {
    test('deve excluir locação com sucesso', async () => {
      excluirLocacao.mockResolvedValue({
        success: true,
        message: 'Locação excluída com sucesso'
      });

      const response = await request(app)
        .delete('/loc123')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Locação excluída com sucesso'
      });

      expect(excluirLocacao).toHaveBeenCalledWith('loc123');
    });

    test('deve retornar erro 400 quando excluirLocacao falha', async () => {
      excluirLocacao.mockResolvedValue({
        success: false,
        error: 'Locação não encontrada ou já excluída'
      });

      const response = await request(app)
        .delete('/loc123')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Locação não encontrada ou já excluída'
      });
    });

    test('deve capturar erros inesperados', async () => {
      excluirLocacao.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .delete('/loc123')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });

    test('deve processar exclusão de locação com ID complexo', async () => {
      const complexId = 'loc_2024_cliente123_veiculo456';

      excluirLocacao.mockResolvedValue({
        success: true,
        message: 'Locação excluída com sucesso'
      });

      const response = await request(app)
        .delete(`/${complexId}`)
        .expect(200);

      expect(excluirLocacao).toHaveBeenCalledWith(complexId);
      expect(response.body.success).toBe(true);
    });

    test('deve retornar erro 404 quando a locação não for encontrada', async () => {
      const locacaoId = 'loc999'; // ID que não existe

      excluirLocacao.mockResolvedValue({
        success: false,
        error: 'Locação não encontrada ou já excluída'
      });

      const response = await request(app)
          .delete(`/${locacaoId}`)
          .expect(404); // Mudando para 404, pois a locação não foi encontrada

      expect(response.body).toEqual({
        error: 'Locação não encontrada ou já excluída'
      });
    });

    test('deve retornar erro 400 quando o ID for malformado', async () => {
      const invalidId = 'loc#123'; // ID malformado

      const response = await request(app)
          .delete(`/${invalidId}`)
          .expect(400); // Esperando erro de validação de ID

      expect(response.body).toEqual({
        error: 'ID da locação inválido.'
      });

      expect(excluirLocacao).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando o ID não for fornecido', async () => {
      const response = await request(app)
          .delete('/')
          .expect(400);

      expect(response.body).toEqual({
        error: 'ID da locação é obrigatório.'
      });

      expect(excluirLocacao).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando o tipo do ID for inválido', async () => {
      const invalidId = 12345; // Número em vez de string

      const response = await request(app)
          .delete(`/${invalidId}`)
          .expect(400);

      expect(response.body).toEqual({
        error: 'ID da locação deve ser uma string válida.'
      });

      expect(excluirLocacao).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando a locação já foi excluída', async () => {
      const locacaoId = 'loc123';

      excluirLocacao.mockResolvedValue({
        success: false,
        error: 'Locação não encontrada ou já excluída'
      });

      const response = await request(app)
          .delete(`/${locacaoId}`)
          .expect(400);

      expect(response.body).toEqual({
        error: 'Locação não encontrada ou já excluída'
      });
    });
  });

  describe('Middleware de validação', () => {
    test('deve processar CORS corretamente', async () => {
      listarLocacoes.mockResolvedValue({ locacoes: [] });

      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    test('deve processar JSON no body corretamente', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123',
        metadados: {
          criador: 'sistema',
          versao: '1.0'
        }
      };

      criarLocacao.mockResolvedValue({
        success: true,
        id: 'loc123'
      });

      const response = await request(app)
        .post('/')
        .send(locacaoData)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(criarLocacao).toHaveBeenCalledWith(locacaoData);
    });

    test('deve rejeitar CORS de origens não permitidas', async () => {
      const response = await request(app)
          .get('/')
          .set('Origin', 'http://malicious-site.com')
          .expect(403); // Esperando um erro 403

      expect(response.body).toEqual({
        error: 'CORS não permitido para esta origem'
      });
    });

    test('deve rejeitar JSON malformado', async () => {
      const response = await request(app)
          .post('/')
          .send('{"clienteId": "cliente123", "veiculoId": "veiculo123"') // JSON malformado (falta fechar chave)
          .set('Content-Type', 'application/json')
          .expect(400);

      expect(response.body).toEqual({
        error: 'JSON malformado'
      });
    });

    test('deve retornar erro 415 para Content-Type incorreto', async () => {
      const response = await request(app)
          .post('/')
          .send({ clienteId: 'cliente123', veiculoId: 'veiculo123' })
          .set('Content-Type', 'text/plain') // Cabeçalho Content-Type incorreto
          .expect(415); // Erro de tipo de mídia não suportado

      expect(response.body).toEqual({
        error: 'Tipo de mídia não suportado'
      });
    });

    test('deve rejeitar CORS para métodos não permitidos', async () => {
      const response = await request(app)
          .delete('/')
          .set('Origin', 'http://localhost:3000') // Origem permitida
          .expect(405); // Método não permitido

      expect(response.body).toEqual({
        error: 'Método não permitido'
      });
    });

    test('deve processar cabeçalho Authorization corretamente', async () => {
      const response = await request(app)
          .post('/')
          .set('Authorization', 'Bearer token123')
          .send({ clienteId: 'cliente123', veiculoId: 'veiculo123' })
          .expect(201); // Esperando que a requisição seja bem-sucedida

      expect(response.body).toEqual({
        success: true,
        message: 'Locação criada com sucesso'
      });
    });
  });
});