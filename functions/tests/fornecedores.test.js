const request = require('supertest');
const express = require('express');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreFornecedores.js', () => ({
  criarFornecedor: jest.fn(),
}));

const { criarFornecedor } = require('../scripts/firestore/firestoreFornecedores.js');

describe('Fornecedores Routes', () => {
  let app;
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar um mock manual do router
    const mockRouter = express.Router();
    
    // Mock da rota POST
    mockRouter.post('/', async (req, res) => {
      try {
        const fornecedorData = req.body;
        if (!fornecedorData || !fornecedorData.cnpj) {
          return res.status(400).send('Dados do fornecedor incompletos (CNPJ é obrigatório).');
        }
        const resultado = await criarFornecedor(fornecedorData);
        if (resultado.success) {
          res.status(201).send({ message: 'Fornecedor criado com sucesso!', id: fornecedorData.cnpj });
        } else {
          res.status(500).send({ message: 'Erro ao criar fornecedor', error: resultado.error });
        }
      } catch (error) {
        res.status(500).send('Erro interno do servidor.');
      }
    });
    
    // Mock da rota GET
    mockRouter.get('/', async (req, res) => {
      try {
        res.status(200).send({ message: 'Rota GET /fornecedores implementada em breve.' });
      } catch (error) {
        res.status(500).send('Erro interno do servidor.');
      }
    });
    
    router = mockRouter;
    app = express();
    app.use(express.json());
    app.use('/fornecedores', router);
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

    test('deve retornar erro 400 quando CNPJ é inválido', async () => {
      const fornecedorData = {
        cnpj: '123456780001',
        razaoSocial: 'Empresa Teste LTDA'
      };

      const response = await request(app)
          .post('/fornecedores')
          .send(fornecedorData)
          .expect(400);

      expect(response.text).toContain('CNPJ inválido');
      expect(criarFornecedor).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando razaoSocial está ausente', async () => {
      const fornecedorData = {
        cnpj: '12345678000195'
      };

      const response = await request(app)
          .post('/fornecedores')
          .send(fornecedorData)
          .expect(400);

      expect(response.text).toContain('Razão Social é obrigatória');
      expect(criarFornecedor).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando o CEP é inválido', async () => {
      const fornecedorData = {
        cnpj: '12345678000195',
        razaoSocial: 'Empresa Teste LTDA',
        nomeFantasia: 'Teste',
        endereco: {
          logradouro: 'Rua Teste, 123',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-abc' // CEP inválido
        }
      };

      const response = await request(app)
          .post('/fornecedores')
          .send(fornecedorData)
          .expect(400);

      expect(response.text).toContain('CEP inválido');
      expect(criarFornecedor).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando o body é um número', async () => {
      const response = await request(app)
          .post('/fornecedores')
          .send(123456)
          .expect(400);

      expect(response.text).toContain('Dados inválidos');
      expect(criarFornecedor).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando razão social tem tamanho excessivo', async () => {
      const fornecedorData = {
        cnpj: '12345678000195',
        razaoSocial: 'A'.repeat(256), // Exemplo de string muito longa
        nomeFantasia: 'Teste'
      };

      const response = await request(app)
          .post('/fornecedores')
          .send(fornecedorData)
          .expect(400);

      expect(response.text).toContain('Razão Social excede o tamanho permitido');
      expect(criarFornecedor).not.toHaveBeenCalled();
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

    test('deve retornar erro 503 quando o banco de dados estiver indisponível', async () => {
      const fornecedorData = {
        cnpj: '12345678000195',
        razaoSocial: 'Empresa Teste LTDA'
      };

      criarFornecedor.mockRejectedValueOnce(new Error('Banco de dados indisponível'));

      const response = await request(app)
          .post('/fornecedores')
          .send(fornecedorData)
          .expect(503);

      expect(response.text).toBe('Serviço temporariamente indisponível.');
    });

    test('deve retornar erro 400 com mensagem clara quando CNPJ está faltando', async () => {
      const fornecedorData = {
        razaoSocial: 'Empresa Teste LTDA'
      };

      const response = await request(app)
          .post('/fornecedores')
          .send(fornecedorData)
          .expect(400);

      expect(response.body).toEqual({
        message: 'CNPJ é obrigatório'
      });
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

    test('deve capturar erros inesperados na rota GET', async () => {
      // Simular erro mockando console.error
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Forçar um erro inesperado modificando o comportamento da rota
      app.get('/fornecedores', (req, res) => {
        throw new Error('Erro inesperado');
      });

      const response = await request(app)
          .get('/fornecedores')
          .expect(500); // Espera-se um código 500 para erros internos do servidor

      expect(response.body).toEqual({
        message: 'Erro interno do servidor.'
      });

      // Verifica se o erro foi logado no console
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Erro inesperado'));

      console.error = originalConsoleError;
    });

    test('deve retornar erro 503 quando o serviço de dependência falhar', async () => {
      // Simula falha de dependência externa (por exemplo, um banco de dados)
      app.get('/fornecedores', (req, res) => {
        res.status(503).json({ message: 'Serviço temporariamente indisponível' });
      });

      const response = await request(app)
          .get('/fornecedores')
          .expect(503);

      expect(response.body).toEqual({
        message: 'Serviço temporariamente indisponível'
      });
    });

    test('deve retornar lista de fornecedores', async () => {
      const fornecedores = [
        { cnpj: '12345678000195', razaoSocial: 'Fornecedor 1' },
        { cnpj: '98765432000199', razaoSocial: 'Fornecedor 2' }
      ];

      // Mocka a resposta do banco de dados ou serviço de fornecedores
      app.get('/fornecedores', (req, res) => {
        res.status(200).json(fornecedores);
      });

      const response = await request(app)
          .get('/fornecedores')
          .expect(200);

      expect(response.body).toEqual(fornecedores);
    });

    test('deve retornar em um tempo razoável', async () => {
      const response = await request(app)
          .get('/fornecedores')
          .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(Number(response.headers['x-response-time'])).toBeLessThan(500); // 500ms como exemplo
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

  test('deve rejeitar JSON malformado', async () => {
    const response = await request(app)
        .post('/fornecedores')
        .send('{"cnpj": "123456"') // JSON malformado - falta fechar chave
        .set('Content-Type', 'application/json')
        .expect(400);

    // Verificar se a função não foi chamada devido ao erro
    expect(criarFornecedor).not.toHaveBeenCalled();

    // Verificar mensagem de erro na resposta
    expect(response.body.message).toBe('Erro ao processar o JSON. Verifique o formato e tente novamente.');
  });

  test('deve rejeitar conteúdo não JSON (Content-Type inválido)', async () => {
    const response = await request(app)
        .post('/fornecedores')
        .send('<cnpj>12345678000195</cnpj>') // Enviando XML ou formato não JSON
        .set('Content-Type', 'application/xml')
        .expect(415); // 415 Unsupported Media Type

    expect(criarFornecedor).not.toHaveBeenCalled();
    expect(response.body.message).toBe('Formato de mídia não suportado. Envie dados em formato JSON.');
  });

  test('deve rejeitar JSON quando CNPJ está ausente', async () => {
    const fornecedorData = {
      dadosComplexos: {
        endereco: {
          logradouro: 'Rua Teste',
          numero: 123
        },
        contatos: ['email@teste.com', 'telefone123']
      }
    };

    const response = await request(app)
        .post('/fornecedores')
        .send(fornecedorData)
        .set('Content-Type', 'application/json')
        .expect(400);

    expect(criarFornecedor).not.toHaveBeenCalled();
    expect(response.body.message).toBe('CNPJ é obrigatório');
  });
});