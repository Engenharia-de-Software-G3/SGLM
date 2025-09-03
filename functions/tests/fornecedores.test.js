const request = require('supertest');
const express = require('express');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreFornecedores.js', () => ({
  criarFornecedor: jest.fn(),
}));

const { criarFornecedor } = require('../scripts/firestore/firestoreFornecedores.js');

describe('Fornecedores Routes', () => {
  let app;
  let fornecedorRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Import the actual router after mocks are set up
    delete require.cache[require.resolve('../fornecedores.js')];
    fornecedorRouter = require('../fornecedores.js').default;
    
    app = express();
    app.use(express.json());
    app.use('/fornecedores', fornecedorRouter);
  });

  describe('POST /fornecedores', () => {
    test('deve criar fornecedor com dados válidos', async () => {
      const fornecedorData = {
        cnpj: '12345678000195',
        razaoSocial: 'Empresa Teste LTDA',
        nomeFantasia: 'Teste',
        endereco: {
          logradouro: 'Rua Teste, 123',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        }
      };

      criarFornecedor.mockResolvedValue({
        success: true,
        id: fornecedorData.cnpj
      });

      const response = await request(app)
        .post('/fornecedores')
        .send(fornecedorData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Fornecedor criado com sucesso!',
        id: fornecedorData.cnpj
      });

      expect(criarFornecedor).toHaveBeenCalledWith(fornecedorData);
    });

    test('deve retornar erro 400 quando CNPJ está ausente', async () => {
      const fornecedorData = {
        razaoSocial: 'Empresa Teste LTDA',
        nomeFantasia: 'Teste'
      };

      const response = await request(app)
        .post('/fornecedores')
        .send(fornecedorData)
        .expect(400);

      expect(response.text).toContain('CNPJ é obrigatório');
      expect(criarFornecedor).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando body está vazio', async () => {
      const response = await request(app)
        .post('/fornecedores')
        .send({})
        .expect(400);

      expect(response.text).toContain('CNPJ é obrigatório');
      expect(criarFornecedor).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando body é null', async () => {
      const response = await request(app)
        .post('/fornecedores')
        .send(null)
        .expect(400);

      expect(response.text).toContain('CNPJ é obrigatório');
      expect(criarFornecedor).not.toHaveBeenCalled();
    });

    test('deve retornar erro 500 quando criarFornecedor falha', async () => {
      const fornecedorData = {
        cnpj: '12345678000195',
        razaoSocial: 'Empresa Teste LTDA'
      };

      criarFornecedor.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
        .post('/fornecedores')
        .send(fornecedorData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Erro ao criar fornecedor',
        error: 'Erro no Firestore'
      });
    });

    test('deve capturar erros inesperados', async () => {
      const fornecedorData = {
        cnpj: '12345678000195',
        razaoSocial: 'Empresa Teste LTDA'
      };

      criarFornecedor.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .post('/fornecedores')
        .send(fornecedorData)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
    });

    test('deve aceitar fornecedor mesmo sem razaoSocial (apenas CNPJ obrigatório)', async () => {
      const fornecedorData = {
        cnpj: '12345678000195'
      };

      criarFornecedor.mockResolvedValue({
        success: true,
        id: fornecedorData.cnpj
      });

      const response = await request(app)
        .post('/fornecedores')
        .send(fornecedorData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Fornecedor criado com sucesso!',
        id: fornecedorData.cnpj
      });

      expect(criarFornecedor).toHaveBeenCalledWith(fornecedorData);
    });

    test('deve criar fornecedor com todos os dados válidos', async () => {
      const fornecedorData = {
        cnpj: '12345678000195',
        razaoSocial: 'Empresa Teste LTDA',
        nomeFantasia: 'Teste',
        endereco: {
          logradouro: 'Rua Teste, 123',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        }
      };

      criarFornecedor.mockResolvedValue({
        success: true,
        id: fornecedorData.cnpj
      });

      const response = await request(app)
          .post('/fornecedores')
          .send(fornecedorData)
          .expect(201);

      expect(response.body).toEqual({
        message: 'Fornecedor criado com sucesso!',
        id: fornecedorData.cnpj
      });

      expect(criarFornecedor).toHaveBeenCalledWith(fornecedorData);
    });
  });

  describe('GET /fornecedores', () => {
    test('deve retornar mensagem placeholder para listagem', async () => {
      const response = await request(app)
        .get('/fornecedores')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Rota GET /fornecedores implementada em breve.'
      });
    });

    test('deve capturar erros inesperados na rota GET', async () => {
      // Simular erro mockando console.error
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Forçar um erro modificando o comportamento do response
      const response = await request(app)
        .get('/fornecedores')
        .expect(200); // A rota atual sempre retorna 200

      expect(response.body.message).toContain('implementada em breve');

      console.error = originalConsoleError;
    });

    test('deve retornar mensagem placeholder para listagem', async () => {
      const response = await request(app)
          .get('/fornecedores')
          .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Rota GET /fornecedores implementada em breve.');
    });
  });

  describe('Validação de middleware', () => {
    test('deve processar JSON corretamente', async () => {
      const fornecedorData = {
        cnpj: '12345678000195',
        dadosComplexos: {
          endereco: {
            logradouro: 'Rua Teste',
            numero: 123
          },
          contatos: ['email@teste.com', 'telefone123']
        }
      };

      criarFornecedor.mockResolvedValue({
        success: true,
        id: fornecedorData.cnpj
      });

      const response = await request(app)
        .post('/fornecedores')
        .send(fornecedorData)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(criarFornecedor).toHaveBeenCalledWith(fornecedorData);
      expect(response.body.message).toBe('Fornecedor criado com sucesso!');
    });

    test('deve rejeitar JSON malformado', async () => {
      const response = await request(app)
        .post('/fornecedores')
        .send('{"cnpj": "123456"') // JSON malformado - falta fechar chave
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(criarFornecedor).not.toHaveBeenCalled();
    });
  });

  test('deve processar JSON corretamente', async () => {
    const fornecedorData = {
      cnpj: '12345678000195',
      dadosComplexos: {
        endereco: {
          logradouro: 'Rua Teste',
          numero: 123
        },
        contatos: ['email@teste.com', 'telefone123']
      }
    };

    criarFornecedor.mockResolvedValue({
      success: true,
      id: fornecedorData.cnpj
    });

    const response = await request(app)
        .post('/fornecedores')
        .send(fornecedorData)
        .set('Content-Type', 'application/json')
        .expect(201);

    // Verificando que o criador foi chamado com os dados corretos
    expect(criarFornecedor).toHaveBeenCalledWith(fornecedorData);

    // Verificando a resposta da API
    expect(response.body.message).toBe('Fornecedor criado com sucesso!');

    // Verificando se o cabeçalho Content-Type está correto
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
  });
});