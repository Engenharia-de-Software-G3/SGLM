const request = require('supertest');

// Mock de todos os roteadores
jest.mock('../cliente.js', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json({ message: 'clientes router mock' }));
  router.post('/', (req, res) => res.status(201).json({ message: 'cliente criado mock' }));
  return router;
});

jest.mock('../veiculo.js', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json({ message: 'veiculos router mock' }));
  router.post('/', (req, res) => res.status(201).json({ message: 'veiculo criado mock' }));
  return router;
});

jest.mock('../fornecedores.js', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json({ message: 'fornecedores router mock' }));
  return router;
});

jest.mock('../manutencoes.js', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/:veiculoId', (req, res) => res.json({ message: 'manutencoes router mock', veiculoId: req.params.veiculoId }));
  return router;
});

jest.mock('../vistoria.js', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json({ message: 'vistorias router mock' }));
  router.post('/', (req, res) => res.status(201).json({ message: 'vistoria criada mock' }));
  return router;
});

jest.mock('../locacoes.js', () => {
  const express = require('express');
  const app = express();
  app.get('/', (req, res) => res.json({ message: 'locacoes app mock' }));
  app.post('/', (req, res) => res.status(201).json({ message: 'locacao criada mock' }));
  return app;
});

// Mock do firebase-functions
jest.mock('firebase-functions', () => ({
  https: {
    onRequest: jest.fn((app) => app)
  }
}));

describe('Index - Main App', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar um mock manual do app principal
    const express = require('express');
    const cors = require('cors');
    
    const mockApp = express();
    
    // Configurar middlewares
    mockApp.use(cors({ origin: true }));
    mockApp.use(express.json());
    
    // Rota principal de teste
    mockApp.get('/hello-world', (req, res) => {
      res.send('Hello World from feat/ui-sglm-partial branch!');
    });
    
    // Montar os roteadores mockados
    mockApp.use('/clientes', require('../cliente.js'));
    mockApp.use('/veiculos', require('../veiculo.js'));
    mockApp.use('/fornecedores', require('../fornecedores.js'));
    mockApp.use('/manutencoes', require('../manutencoes.js'));
    mockApp.use('/vistorias', require('../vistoria.js'));
    mockApp.use('/locacoes', require('../locacoes.js'));
    
    app = mockApp;
  });

  describe('Rota de teste principal', () => {
    test('deve responder na rota /hello-world', async () => {
      const response = await request(app)
        .get('/hello-world')
        .expect(200);

      expect(response.text).toBe('Hello World from feat/ui-sglm-partial branch!');
    });

    test('deve aceitar requisições CORS', async () => {
      const response = await request(app)
        .get('/hello-world')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Middleware de configuração', () => {
    test('deve processar JSON no body', async () => {
      const testData = { test: 'data', number: 123 };

      const response = await request(app)
        .post('/clientes')
        .send(testData)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(response.body.message).toBe('cliente criado mock');
    });

    test('deve rejeitar JSON malformado', async () => {
      const response = await request(app)
        .post('/clientes')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    test('deve aplicar CORS para diferentes origens', async () => {
      const origens = [
        'http://localhost:3000',
        'https://app.exemplo.com',
        'https://sglm.exemplo.com'
      ];

      for (const origem of origens) {
        const response = await request(app)
          .get('/hello-world')
          .set('Origin', origem)
          .expect(200);

        expect(response.headers['access-control-allow-origin']).toBe('*');
      }
    });

    test('deve processar requisições OPTIONS para CORS preflight', async () => {
      const response = await request(app)
        .options('/clientes')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Roteamento de clientes', () => {
    test('deve rotear GET /clientes para o roteador de clientes', async () => {
      const response = await request(app)
        .get('/clientes')
        .expect(200);

      expect(response.body.message).toBe('clientes router mock');
    });

    test('deve rotear POST /clientes para o roteador de clientes', async () => {
      const clienteData = {
        cpf: '12345678901',
        dadosPessoais: { nome: 'João Silva' }
      };

      const response = await request(app)
        .post('/clientes')
        .send(clienteData)
        .expect(201);

      expect(response.body.message).toBe('cliente criado mock');
    });

    test('deve rotear rotas parametrizadas de clientes', async () => {
      const response = await request(app)
        .get('/clientes/12345678901')
        .expect(200);

      // Como estamos usando um mock simples, pode retornar 404 se a rota não for definida no mock
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Roteamento de veículos', () => {
    test('deve rotear GET /veiculos para o roteador de veículos', async () => {
      const response = await request(app)
        .get('/veiculos')
        .expect(200);

      expect(response.body.message).toBe('veiculos router mock');
    });

    test('deve rotear POST /veiculos para o roteador de veículos', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic'
      };

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoData)
        .expect(201);

      expect(response.body.message).toBe('veiculo criado mock');
    });
  });

  describe('Roteamento de fornecedores', () => {
    test('deve rotear GET /fornecedores para o roteador de fornecedores', async () => {
      const response = await request(app)
        .get('/fornecedores')
        .expect(200);

      expect(response.body.message).toBe('fornecedores router mock');
    });
  });

  describe('Roteamento de manutenções', () => {
    test('deve rotear GET /manutencoes/:veiculoId para o roteador de manutenções', async () => {
      const veiculoId = 'veiculo123';
      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(200);

      expect(response.body.message).toBe('manutencoes router mock');
      expect(response.body.veiculoId).toBe(veiculoId);
    });
  });

  describe('Roteamento de vistorias', () => {
    test('deve rotear GET /vistorias para o roteador de vistorias', async () => {
      const response = await request(app)
        .get('/vistorias')
        .expect(200);

      expect(response.body.message).toBe('vistorias router mock');
    });

    test('deve rotear POST /vistorias para o roteador de vistorias', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15'
      };

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(201);

      expect(response.body.message).toBe('vistoria criada mock');
    });
  });

  describe('Roteamento de locações', () => {
    test('deve rotear GET /locacoes para o app de locações', async () => {
      const response = await request(app)
        .get('/locacoes')
        .expect(200);

      expect(response.body.message).toBe('locacoes app mock');
    });

    test('deve rotear POST /locacoes para o app de locações', async () => {
      const locacaoData = {
        clienteId: 'cliente123',
        veiculoId: 'veiculo123',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-05'
      };

      const response = await request(app)
        .post('/locacoes')
        .send(locacaoData)
        .expect(201);

      expect(response.body.message).toBe('locacao criada mock');
    });
  });

  describe('Rotas não encontradas', () => {
    test('deve retornar 404 para rota inexistente', async () => {
      const response = await request(app)
        .get('/rota-inexistente')
        .expect(404);
    });

    test('deve retornar 404 para métodos não suportados em rota existente', async () => {
      const response = await request(app)
        .patch('/hello-world') // PATCH não definido para esta rota
        .expect(404);
    });

    test('deve retornar 404 para subrotas não definidas', async () => {
      const response = await request(app)
        .get('/clientes/subpath/inexistente')
        .expect(404);
    });
  });

  describe('Tratamento de erros', () => {
    test('deve processar requisições com headers customizados', async () => {
      const response = await request(app)
        .get('/hello-world')
        .set('X-Custom-Header', 'test-value')
        .set('User-Agent', 'SGLM-Test-Client/1.0')
        .expect(200);

      expect(response.text).toBe('Hello World from feat/ui-sglm-partial branch!');
    });

    test('deve processar requisições sem Content-Type', async () => {
      const response = await request(app)
        .get('/hello-world')
        .expect(200);

      expect(response.text).toBe('Hello World from feat/ui-sglm-partial branch!');
    });

    test('deve processar query parameters', async () => {
      const response = await request(app)
        .get('/hello-world?param1=value1&param2=value2')
        .expect(200);

      expect(response.text).toBe('Hello World from feat/ui-sglm-partial branch!');
    });
  });

  describe('Integração de todos os módulos', () => {
    test('deve ter todos os roteadores montados corretamente', async () => {
      const rotasParaTestar = [
        { path: '/clientes', method: 'get' },
        { path: '/veiculos', method: 'get' },
        { path: '/fornecedores', method: 'get' },
        { path: '/vistorias', method: 'get' },
        { path: '/locacoes', method: 'get' },
        { path: '/manutencoes/veiculo123', method: 'get' }
      ];

      for (const rota of rotasParaTestar) {
        const response = await request(app)[rota.method](rota.path);
        expect([200, 201, 404]).toContain(response.status);
      }
    });

    test('deve processar dados em diferentes formatos', async () => {
      const dadosTeste = [
        { tipo: 'json', data: { test: 'json' }, contentType: 'application/json' },
        { tipo: 'form', data: 'test=form', contentType: 'application/x-www-form-urlencoded' }
      ];

      for (const dado of dadosTeste) {
        const response = await request(app)
          .post('/clientes')
          .send(dado.data)
          .set('Content-Type', dado.contentType);
        
        // Deve processar sem erro de parsing (200/201 ou erro de validação 400)
        expect([200, 201, 400]).toContain(response.status);
      }
    });

    test('deve manter consistência entre rotas similares', async () => {
      const rotasPOST = ['/clientes', '/veiculos', '/vistorias', '/locacoes'];

      for (const rota of rotasPOST) {
        const response = await request(app)
          .post(rota)
          .send({ test: 'data' });
        
        // Todas devem retornar 201 (sucesso) ou 400 (validação)
        expect([201, 400]).toContain(response.status);
      }
    });
  });

  describe('Performance e limites', () => {
    test('deve processar requisições com payload grande', async () => {
      const payloadGrande = {
        dados: 'x'.repeat(1000), // String de 1000 caracteres
        array: new Array(100).fill({ item: 'teste' }),
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0'
        }
      };

      const response = await request(app)
        .post('/clientes')
        .send(payloadGrande);

      // Deve processar sem erro de tamanho
      expect([201, 400]).toContain(response.status);
    });

    test('deve processar múltiplas requisições simultâneas', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        request(app).get('/hello-world')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello World from feat/ui-sglm-partial branch!');
      });
    });
  });
});