const request = require('supertest');
const express = require('express');

// Mocks
const mockGet = jest.fn();
const mockOrderBy = jest.fn(() => ({ get: mockGet }));
const mockLimit = jest.fn(() => ({ orderBy: mockOrderBy, get: mockGet }));
const mockWhere = jest.fn(() => ({ limit: mockLimit, orderBy: mockOrderBy }));

jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn((docId) => ({
        get: jest.fn().mockResolvedValue({ exists: docId !== 'invalid' }),
      })),
      where: mockWhere,
      limit: mockLimit,
      orderBy: mockOrderBy,
    })),
  },
}));

jest.mock('../scripts/firestore/firestoreVeiculos.js', () => ({
  criarVeiculo: jest.fn(),
  listarVeiculos: jest.fn(),
  buscarPorId: jest.fn(),
  buscaVeiculo: jest.fn(),
  atualizarVeiculo: jest.fn(),
}));

const {
  criarVeiculo,
  listarVeiculos,
  buscarPorId,
  buscaVeiculo,
  atualizarVeiculo,
} = require('../scripts/firestore/firestoreVeiculos.js');

describe('Veículos Routes', () => {
  let app;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Importa o router aqui para garantir que os mocks sejam aplicados por teste
    const veiculoRouter = require('../veiculo.js').default;
    app = express();
    app.use(express.json());
    app.use('/', veiculoRouter);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    delete require.cache[require.resolve('../veiculo.js')];
  });

  describe('POST /', () => {
    const veiculoData = { chassi: '123', placa: 'ABC', modelo: 'Modelo' };

    test('deve criar veículo com sucesso', async () => {
      criarVeiculo.mockResolvedValue({ success: true, id: 'v1' });
      await request(app).post('/').send(veiculoData).expect(201);
    });

    test('deve retornar 400 para dados incompletos', async () => {
      await request(app).post('/').send({ chassi: '123' }).expect(400);
    });

    test('deve retornar 400 se criarVeiculo falhar', async () => {
      criarVeiculo.mockResolvedValue({ success: false, error: 'Falha' });
      await request(app).post('/').send(veiculoData).expect(400);
    });

    test('deve retornar 500 em caso de exceção', async () => {
      criarVeiculo.mockRejectedValue(new Error('Erro'));
      await request(app).post('/').send(veiculoData).expect(500);
    });
  });

  describe('GET /', () => {
    test('deve listar veículos', async () => {
      listarVeiculos.mockResolvedValue({ veiculos: [] });
      await request(app).get('/').expect(200);
    });

    test('deve retornar 400 para limite inválido', async () => {
      await request(app).get('/?limite=abc').expect(400);
    });

    test('deve retornar 400 para ultimoDocId inválido', async () => {
      await request(app).get('/?ultimoDocId=invalid').expect(400);
    });

    test('deve retornar 500 em caso de exceção', async () => {
      listarVeiculos.mockRejectedValue(new Error('Erro'));
      await request(app).get('/').expect(500);
    });

    test('deve retornar detalhes do erro em desenvolvimento', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        listarVeiculos.mockRejectedValue(new Error('Detalhe do erro'));
        await request(app)
          .get('/')
          .expect(500)
          .then(response => {
            expect(response.body.detalhes).toBe('Detalhe do erro');
          });
        process.env.NODE_ENV = originalEnv;
      });
  });

  describe('GET /:idVeiculo', () => {
    test('deve buscar um veículo com sucesso', async () => {
        buscaVeiculo.mockResolvedValue({ success: true, veiculo: { id: '1' } });
        await request(app).get('/1').expect(200);
    });

    

    test('deve retornar 404 se veículo não for encontrado', async () => {
        buscaVeiculo.mockResolvedValue({ success: false, error: 'Veículo não encontrado.' });
        await request(app).get('/1').expect(404);
    });

    test('deve retornar 500 se buscaVeiculo falhar com outro erro', async () => {
        buscaVeiculo.mockResolvedValue({ success: false, error: 'Outro erro' });
        await request(app).get('/1').expect(500);
    });

    test('deve retornar 500 em caso de exceção', async () => {
        buscaVeiculo.mockRejectedValue(new Error('Erro inesperado'));
        await request(app).get('/1').expect(500);
    });

    test('deve retornar detalhes do erro em desenvolvimento', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        buscaVeiculo.mockRejectedValue(new Error('Detalhe do erro'));
        await request(app)
          .get('/1')
          .expect(500)
          .then(response => {
            expect(response.body.detalhes).toBe('Detalhe do erro');
          });
        process.env.NODE_ENV = originalEnv;
      });
  });

  describe('PUT /:idVeiculo', () => {
    const updateData = { placa: 'novo' };

    test('deve atualizar veículo com sucesso', async () => {
      buscarPorId.mockResolvedValue({ id: '1' });
      atualizarVeiculo.mockResolvedValue({ success: true });
      await request(app).put('/1').send(updateData).expect(200);
    });

    test('deve retornar 400 para dados ausentes', async () => {
      await request(app).put('/1').send({}).expect(400);
    });

    test('deve retornar 404 se o veículo não for encontrado', async () => {
      buscarPorId.mockResolvedValue(null);
      await request(app).put('/1').send(updateData).expect(404);
    });

    test('deve retornar 500 em caso de exceção', async () => {
      buscarPorId.mockRejectedValue(new Error('Erro'));
      await request(app).put('/1').send(updateData).expect(500);
    });
  });

  describe('DELETE /:idVeiculo', () => {
    test('deve deletar veículo com sucesso', async () => {
        mockGet.mockResolvedValue({ empty: false, docs: [{ ref: { delete: jest.fn() } }] });
        await request(app).delete('/1').expect(200);
    });

    test('deve retornar 400 para ID ausente', async () => {
        await request(app).delete('/').expect(404); // Rota não encontrada
    });

    test('deve retornar 404 se o veículo não for encontrado', async () => {
        mockGet.mockResolvedValue({ empty: true });
        await request(app).delete('/1').expect(404);
    });

    test('deve retornar 500 em caso de exceção', async () => {
        mockGet.mockRejectedValue(new Error('Erro'));
        await request(app).delete('/1').expect(500);
    });
  });
});
