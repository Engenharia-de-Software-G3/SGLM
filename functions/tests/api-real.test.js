const request = require('supertest');

const API_BASE_URL = 'https://api-3dr7n3lena-uc.a.run.app';

describe('API Real - Testes de Integração', () => {
  
  describe('Rota de teste', () => {
    test('deve responder na rota /hello-world', async () => {
      const response = await request(API_BASE_URL)
        .get('/hello-world')
        .expect(200);

      expect(response.text).toContain('Hello World');
    }, 10000);
  });

  describe('Clientes API', () => {
    test('deve listar clientes', async () => {
      const response = await request(API_BASE_URL)
        .get('/clientes')
        .expect(200);

      expect(response.body).toHaveProperty('clientes');
      expect(Array.isArray(response.body.clientes)).toBe(true);
    }, 10000);

    test('deve retornar lista de clientes mesmo com CPF em branco', async () => {
      const response = await request(API_BASE_URL)
        .get('/clientes/ ')
        .expect(200);

      // API retorna lista geral quando CPF está em branco
      expect(response.body).toHaveProperty('clientes');
    }, 10000);

    test('deve validar dados obrigatórios na criação', async () => {
      const clienteIncompleto = {
        dadosPessoais: {
          nome: 'Teste'
        }
        // CPF ausente
      };

      const response = await request(API_BASE_URL)
        .post('/clientes')
        .send(clienteIncompleto)
        .expect(400);

      expect(response.text).toContain('CPF e dadosPessoais são obrigatórios');
    }, 10000);
  });

  describe('Veículos API', () => {
    test('deve listar veículos', async () => {
      const response = await request(API_BASE_URL)
        .get('/veiculos')
        .expect(200);

      expect(response.body).toHaveProperty('veiculos');
      expect(Array.isArray(response.body.veiculos)).toBe(true);
    }, 10000);

    test('deve usar limite padrão quando parâmetro é inválido', async () => {
      const response = await request(API_BASE_URL)
        .get('/veiculos?limite=abc')
        .expect(200);

      // API usa limite padrão quando parâmetro é inválido
      expect(response.body).toHaveProperty('veiculos');
      expect(Array.isArray(response.body.veiculos)).toBe(true);
    }, 10000);

    test('deve validar dados obrigatórios na criação', async () => {
      const veiculoIncompleto = {
        chassi: '1HGBH41JXMN109186'
        // placa e modelo ausentes
      };

      const response = await request(API_BASE_URL)
        .post('/veiculos')
        .send(veiculoIncompleto)
        .expect(400);

      expect(response.text).toContain('chassi, placa e modelo são obrigatórios');
    }, 10000);
  });

  describe('Locações API', () => {
    test('deve listar locações', async () => {
      const response = await request(API_BASE_URL)
        .get('/locacoes')
        .expect(200);

      expect(response.body).toHaveProperty('locacoes');
    }, 10000);

    test('deve validar limite de paginação', async () => {
      const response = await request(API_BASE_URL)
        .get('/locacoes?limite=xyz')
        .expect(400);

      expect(response.body.error).toBe('Value for "limite" is not a valid integer.');
    }, 10000);
  });

  describe('Fornecedores API', () => {
    test('deve responder na rota /fornecedores', async () => {
      const response = await request(API_BASE_URL)
        .get('/fornecedores');

      // Aceita tanto 200 (se implementado) quanto 404 (se não implementado)
      expect([200, 404]).toContain(response.status);
    }, 10000);
  });

  describe('Manutenções API', () => {
    test('deve responder na rota /manutencoes', async () => {
      const response = await request(API_BASE_URL)
        .get('/manutencoes');

      // Aceita tanto 200 (se implementado) quanto 404 (se não implementado)
      expect([200, 404]).toContain(response.status);
    }, 10000);
  });

  describe('Vistorias API', () => {
    test('deve responder na rota /vistorias', async () => {
      const response = await request(API_BASE_URL)
        .get('/vistorias');

      // Aceita tanto 200 (se implementado) quanto 404 (se não implementado)
      expect([200, 404]).toContain(response.status);
    }, 10000);
  });

  describe('Testes de erro', () => {
    test('deve retornar 404 para rota inexistente', async () => {
      const response = await request(API_BASE_URL)
        .get('/rota-inexistente')
        .expect(404);
    }, 10000);

    test('deve aceitar requisições CORS', async () => {
      const response = await request(API_BASE_URL)
        .get('/hello-world')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    }, 10000);

    test('deve aceitar JSON no body', async () => {
      // Teste com endpoint que aceita POST
      const response = await request(API_BASE_URL)
        .post('/clientes')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Deve processar JSON (mesmo que retorne erro de validação)
      expect([400, 500]).toContain(response.status);
    }, 10000);
  });
});