const request = require('supertest');
const express = require('express');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreLocacoes.js', () => ({
  criarLocacao: jest.fn(),
  listarLocacoes: jest.fn(),
  atualizarLocacao: jest.fn(),
  excluirLocacao: jest.fn(),
  buscaLocacao: jest.fn(),
}));

const {
  criarLocacao,
  listarLocacoes,
  atualizarLocacao,
  excluirLocacao,
  buscaLocacao,
} = require('../scripts/firestore/firestoreLocacoes.js');

describe('Locações Routes', () => {
  let app;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Importa o app aqui para garantir que os mocks sejam aplicados por teste
    const locacoesApp = require('../locacoes.js').default;
    app = locacoesApp;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    delete require.cache[require.resolve('../locacoes.js')];
  });

  describe('POST /', () => {
    test('deve criar locação com dados válidos', async () => {
      const locacaoData = { clienteId: '1', veiculoId: '1' };
      criarLocacao.mockResolvedValue({ success: true, id: 'loc1' });

      await request(app)
        .post('/')
        .send(locacaoData)
        .expect(201)
        .then(response => {
          expect(response.body.success).toBe(true);
        });
    });

    test('deve retornar 400 se criarLocacao falhar', async () => {
      const locacaoData = { clienteId: '1', veiculoId: '1' };
      criarLocacao.mockResolvedValue({ success: false, error: 'Falha' });

      await request(app)
        .post('/')
        .send(locacaoData)
        .expect(400)
        .then(response => {
          expect(response.body.error).toBe('Falha');
        });
    });

    test('deve retornar 500 em caso de exceção', async () => {
      const locacaoData = { clienteId: '1', veiculoId: '1' };
      criarLocacao.mockRejectedValue(new Error('Erro inesperado'));

      await request(app)
        .post('/')
        .send(locacaoData)
        .expect(500)
        .then(response => {
          expect(response.body.error).toBe('Internal server error');
        });
    });
  });

  describe('GET /', () => {
    test('deve listar locações', async () => {
      listarLocacoes.mockResolvedValue({ locacoes: [] });
      await request(app).get('/').expect(200);
    });

    test('deve retornar 400 para limite inválido', async () => {
      await request(app)
        .get('/?limite=abc')
        .expect(400)
        .then(response => {
          expect(response.body.error).toBe('Value for "limite" is not a valid integer.');
        });
    });

    test('deve retornar 500 em caso de exceção', async () => {
      listarLocacoes.mockRejectedValue(new Error('Erro inesperado'));
      await request(app)
        .get('/')
        .expect(500)
        .then(response => {
          expect(response.body.error).toBe('Internal server error');
        });
    });
  });

  describe('GET /:idLocacao', () => {
    test('deve buscar uma locação com sucesso', async () => {
      buscaLocacao.mockResolvedValue({ success: true, locacao: { id: '1' } });
      await request(app)
        .get('/1')
        .expect(200)
        .then(response => {
          expect(response.body.locacao.id).toBe('1');
        });
    });

    

    test('deve retornar 404 se locação não for encontrada', async () => {
      buscaLocacao.mockResolvedValue({ success: false, error: 'Locação não encontrada.' });
      await request(app).get('/1').expect(404);
    });

    test('deve retornar 500 se buscaLocacao falhar com outro erro', async () => {
      buscaLocacao.mockResolvedValue({ success: false, error: 'Outro erro' });
      await request(app).get('/1').expect(500);
    });

    test('deve retornar 500 em caso de exceção', async () => {
      buscaLocacao.mockRejectedValue(new Error('Erro inesperado'));
      await request(app).get('/1').expect(500);
    });

    test('deve retornar detalhes do erro em desenvolvimento', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      buscaLocacao.mockRejectedValue(new Error('Detalhe do erro'));
      await request(app)
        .get('/1')
        .expect(500)
        .then(response => {
          expect(response.body.detalhes).toBe('Detalhe do erro');
        });
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('PUT /:id', () => {
    test('deve atualizar locação com sucesso', async () => {
      atualizarLocacao.mockResolvedValue({ success: true });
      await request(app).put('/1').send({ status: 'finalizada' }).expect(200);
    });

    test('deve retornar 400 se a atualização falhar', async () => {
      atualizarLocacao.mockResolvedValue({ success: false, error: 'Falha' });
      await request(app).put('/1').send({ status: 'finalizada' }).expect(400);
    });

    test('deve retornar 500 em caso de exceção', async () => {
      atualizarLocacao.mockRejectedValue(new Error('Erro inesperado'));
      await request(app).put('/1').send({ status: 'finalizada' }).expect(500);
    });
  });

  describe('DELETE /:id', () => {
    test('deve excluir locação com sucesso', async () => {
      excluirLocacao.mockResolvedValue({ success: true });
      await request(app).delete('/1').expect(200);
    });

    test('deve retornar 400 se a exclusão falhar', async () => {
      excluirLocacao.mockResolvedValue({ success: false, error: 'Falha' });
      await request(app).delete('/1').expect(400);
    });

    test('deve retornar 500 em caso de exceção', async () => {
      excluirLocacao.mockRejectedValue(new Error('Erro inesperado'));
      await request(app).delete('/1').expect(500);
    });
  });
});
