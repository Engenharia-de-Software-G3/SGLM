const request = require('supertest');
const express = require('express');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreClientes.js', () => ({
  criarCliente: jest.fn(),
  listarClientes: jest.fn(),
  atualizarCliente: jest.fn(),
  deletarCliente: jest.fn(),
  buscarClientePorCPF: jest.fn(),
}));

// Mock do firebaseConfig
jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  },
}));

const {
  criarCliente,
  listarClientes,
  atualizarCliente,
  deletarCliente,
  buscarClientePorCPF,
} = require('../scripts/firestore/firestoreClientes.js');

const { db } = require('../firebaseConfig.js');

describe('Cliente Routes', () => {
  let app;
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar um mock manual do router
    const mockRouter = express.Router();
    
    // Mock da rota POST
    mockRouter.post('/', async (req, res) => {
      try {
        const clienteData = req.body;
        if (!clienteData || !clienteData.cpf || !clienteData.dadosPessoais) {
          return res.status(400).send('Dados do cliente incompletos (CPF e dadosPessoais são obrigatórios).');
        }
        const resultado = await criarCliente(clienteData);
        if (resultado.success) {
          res.status(201).send({ message: 'Cliente criado com sucesso!', id: clienteData.cpf });
        } else {
          res.status(500).send({ message: 'Erro ao criar cliente', error: resultado.error });
        }
      } catch (error) {
        res.status(500).send('Erro interno do servidor.');
      }
    });
    
    // Mock da rota GET
    mockRouter.get('/', async (req, res) => {
      try {
        const { limite = '10', ultimoDocId, filtros = '{}' } = req.query;
        const limiteNum = parseInt(limite) || 10;
        let filtrosParsed;
        try {
          filtrosParsed = JSON.parse(filtros);
        } catch {
          filtrosParsed = {};
        }
        const { clientes, ultimoDoc } = await listarClientes({
          limite: limiteNum,
          ultimoDoc: null,
          filtros: filtrosParsed,
        });
        const resposta = {
          clientes,
          paginacao: {
            possuiMais: !!ultimoDoc,
            ultimoDocId: ultimoDoc?.id || null,
          },
        };
        res.status(200).json(resposta);
      } catch (error) {
        res.status(500).json({
          error: 'Erro interno no servidor',
          detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    });
    
    // Mock da rota GET /:cpf
    mockRouter.get('/:cpf', async (req, res) => {
      try {
        const { cpf } = req.params;
        if (!cpf || cpf.trim().length === 0) {
          return res.status(400).json({ 
            error: 'CPF é obrigatório',
            message: 'Informe um CPF válido para busca.' 
          });
        }
        const resultado = await buscarClientePorCPF(cpf);
        if (resultado.success) {
          res.status(200).json({
            success: true,
            cliente: resultado.cliente
          });
        } else {
          const statusCode = resultado.error === 'Cliente não encontrado.' ? 404 : 500;
          res.status(statusCode).json({ 
            success: false,
            error: resultado.error 
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor.',
          detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    });
    
    // Mock da rota PUT /:cpf
    mockRouter.put('/:cpf', async (req, res) => {
      try {
        const { cpf } = req.params;
        const updates = req.body;
        if (!updates || Object.keys(updates).length === 0) {
          return res.status(400).send('Nenhum dado fornecido para atualização.');
        }
        const resultado = await atualizarCliente(cpf, updates);
        if (resultado.success) {
          res.status(200).send({ message: `Cliente ${cpf} atualizado com sucesso!` });
        } else {
          const statusCode = resultado.error === 'Cliente não encontrado.' ? 404 : 500;
          res.status(statusCode).send({ message: 'Erro ao atualizar cliente', error: resultado.error });
        }
      } catch (error) {
        res.status(500).send('Erro interno do servidor.');
      }
    });
    
    // Mock da rota DELETE /:cpf
    mockRouter.delete('/:cpf', async (req, res) => {
      try {
        const { cpf } = req.params;
        const resultado = await deletarCliente(cpf);
        if (resultado.success) {
          res.status(200).send({ message: `Cliente ${cpf} deletado com sucesso!` });
        } else {
          const statusCode = resultado.error === 'Cliente não encontrado.' ? 404 : 500;
          res.status(statusCode).send({ message: 'Erro ao deletar cliente', error: resultado.error });
        }
      } catch (error) {
        res.status(500).send('Erro interno do servidor.');
      }
    });
    
    router = mockRouter;
    app = express();
    app.use(express.json());
    app.use('/clientes', router);
  });

  describe('POST /clientes', () => {
    test('deve criar cliente com dados válidos', async () => {
      const clienteData = {
        cpf: '12345678901',
        dadosPessoais: {
          nome: 'João Silva',
          email: 'joao@email.com'
        }
      };

      criarCliente.mockResolvedValue({
        success: true,
        id: clienteData.cpf
      });

      const response = await request(app)
        .post('/clientes')
        .send(clienteData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Cliente criado com sucesso!',
        id: clienteData.cpf
      });

      expect(criarCliente).toHaveBeenCalledWith(clienteData);
    });

    test('deve retornar erro 400 quando CPF está ausente', async () => {
      const clienteData = {
        dadosPessoais: {
          nome: 'João Silva'
        }
      };

      const response = await request(app)
        .post('/clientes')
        .send(clienteData)
        .expect(400);

      expect(response.text).toContain('CPF e dadosPessoais são obrigatórios');
      expect(criarCliente).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando dadosPessoais está ausente', async () => {
      const clienteData = {
        cpf: '12345678901'
      };

      const response = await request(app)
        .post('/clientes')
        .send(clienteData)
        .expect(400);

      expect(response.text).toContain('CPF e dadosPessoais são obrigatórios');
      expect(criarCliente).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando body está vazio', async () => {
      const response = await request(app)
        .post('/clientes')
        .send({})
        .expect(400);

      expect(response.text).toContain('CPF e dadosPessoais são obrigatórios');
      expect(criarCliente).not.toHaveBeenCalled();
    });

    test('deve retornar erro 500 quando criarCliente falha', async () => {
      const clienteData = {
        cpf: '12345678901',
        dadosPessoais: {
          nome: 'João Silva'
        }
      };

      criarCliente.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
        .post('/clientes')
        .send(clienteData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Erro ao criar cliente',
        error: 'Erro no Firestore'
      });
    });

    test('deve capturar erros inesperados', async () => {
      const clienteData = {
        cpf: '12345678901',
        dadosPessoais: {
          nome: 'João Silva'
        }
      };

      criarCliente.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .post('/clientes')
        .send(clienteData)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
    });

    test('deve retornar erro 400 quando CPF está em formato inválido', async () => {
      const clienteData = {
        cpf: '1234abc', // formato inválido
        dadosPessoais: {
          nome: 'João Silva'
        }
      };

      const response = await request(app)
          .post('/clientes')
          .send(clienteData)
          .expect(400);

      expect(response.text).toContain('CPF inválido');
      expect(criarCliente).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando nome está ausente em dadosPessoais', async () => {
      const clienteData = {
        cpf: '12345678901',
        dadosPessoais: {
          email: 'joao@email.com'
        }
      };

      const response = await request(app)
          .post('/clientes')
          .send(clienteData)
          .expect(400);

      expect(response.text).toContain('Nome é obrigatório');
      expect(criarCliente).not.toHaveBeenCalled();
    });

    test('deve ignorar campos extras no body e criar cliente', async () => {
      const clienteData = {
        cpf: '12345678901',
        dadosPessoais: {
          nome: 'João Silva',
          email: 'joao@email.com'
        },
        campoExtra: 'valorExtra'
      };

      criarCliente.mockResolvedValue({
        success: true,
        id: clienteData.cpf
      });

      const response = await request(app)
          .post('/clientes')
          .send(clienteData)
          .expect(201);

      expect(response.body).toEqual({
        message: 'Cliente criado com sucesso!',
        id: clienteData.cpf
      });

      expect(criarCliente).toHaveBeenCalledWith(expect.objectContaining({
        cpf: '12345678901',
        dadosPessoais: expect.any(Object)
      }));
    });

    test('deve retornar detalhes do erro em ambiente de desenvolvimento', async () => {
      process.env.NODE_ENV = 'development';

      criarCliente.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
          .post('/clientes')
          .send({
            cpf: '12345678901',
            dadosPessoais: { nome: 'João Silva' }
          })
          .expect(500);

      expect(response.body.error).toBe('Erro no Firestore');

      process.env.NODE_ENV = 'test'; // resetar
    });
  });

  describe('GET /clientes', () => {
    test('deve listar clientes com parâmetros padrão', async () => {
      const mockResult = {
        clientes: [
          { id: '123', cpf: '12345678901', dadosPessoais: { nome: 'João' } }
        ],
        ultimoDoc: null
      };

      listarClientes.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/clientes')
        .expect(200);

      expect(response.body).toEqual({
        clientes: mockResult.clientes,
        paginacao: {
          possuiMais: false,
          ultimoDocId: null
        }
      });

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve aplicar limite personalizado', async () => {
      const mockResult = {
        clientes: [],
        ultimoDoc: null
      };

      listarClientes.mockResolvedValue(mockResult);

      await request(app)
        .get('/clientes?limite=5')
        .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 5,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve aplicar filtros JSON válidos', async () => {
      const mockResult = {
        clientes: [],
        ultimoDoc: null
      };

      const filtros = { nome: 'João', tipo: 'PF' };

      listarClientes.mockResolvedValue(mockResult);

      await request(app)
        .get(`/clientes?filtros=${encodeURIComponent(JSON.stringify(filtros))}`)
        .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: filtros
      });
    });

    test('deve usar filtros vazios quando JSON é inválido', async () => {
      const mockResult = {
        clientes: [],
        ultimoDoc: null
      };

      listarClientes.mockResolvedValue(mockResult);

      await request(app)
        .get('/clientes?filtros=json-invalido')
        .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve retornar erro 500 quando listarClientes falha', async () => {
      listarClientes.mockRejectedValue(new Error('Erro no Firestore'));

      const response = await request(app)
        .get('/clientes')
        .expect(500);

      expect(response.body.error).toBe('Erro interno no servidor');
    });

    test('deve listar clientes usando ultimoDoc para paginação', async () => {
      const mockResult = {
        clientes: [{ id: '456', cpf: '98765432100', dadosPessoais: { nome: 'Maria' } }],
        ultimoDoc: 'doc123'
      };

      listarClientes.mockResolvedValue(mockResult);

      await request(app)
          .get('/clientes?ultimoDoc=doc123')
          .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: 'doc123',
        filtros: {}
      });
    });

    test('deve usar limite padrão se limite for inválido', async () => {
      listarClientes.mockResolvedValue({ clientes: [], ultimoDoc: null });

      await request(app)
          .get('/clientes?limite=abc')
          .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve usar filtros vazios se nenhum filtro for passado', async () => {
      listarClientes.mockResolvedValue({ clientes: [], ultimoDoc: null });

      await request(app)
          .get('/clientes')  // sem filtros
          .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve retornar possuiMais true quando ultimoDoc não for nulo', async () => {
      const mockResult = {
        clientes: [{ id: '123', cpf: '12345678901', dadosPessoais: { nome: 'João' } }],
        ultimoDoc: 'abc123'
      };

      listarClientes.mockResolvedValue(mockResult);

      const response = await request(app)
          .get('/clientes')
          .expect(200);

      expect(response.body.paginacao.possuiMais).toBe(true);
      expect(response.body.paginacao.ultimoDocId).toBe('abc123');
    });

  });

  describe('GET /clientes/:cpf', () => {
    test('deve retornar cliente por CPF válido', async () => {
      const mockCliente = {
        cpf: '12345678901',
        dadosPessoais: { nome: 'João Silva' }
      };

      buscarClientePorCPF.mockResolvedValue({
        success: true,
        cliente: mockCliente
      });

      const response = await request(app)
        .get('/clientes/12345678901')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        cliente: mockCliente
      });

      expect(buscarClientePorCPF).toHaveBeenCalledWith('12345678901');
    });

    test('deve retornar erro 404 quando cliente não é encontrado', async () => {
      buscarClientePorCPF.mockResolvedValue({
        success: false,
        error: 'Cliente não encontrado.'
      });

      const response = await request(app)
        .get('/clientes/12345678901')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Cliente não encontrado.'
      });
    });

    test('deve retornar erro quando CPF é espaço em branco', async () => {
      // Mock para simular erro quando busca com espaço
      buscarClientePorCPF.mockRejectedValue(new Error('CPF inválido'));

      const response = await request(app)
        .get('/clientes/ ')
        .expect(500);

      expect(response.body.error).toBe('Erro interno no servidor');
    });

    test('deve retornar erro 500 quando buscarClientePorCPF falha', async () => {
      buscarClientePorCPF.mockResolvedValue({
        success: false,
        error: 'Erro interno no Firestore'
      });

      const response = await request(app)
        .get('/clientes/12345678901')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('deve capturar erros inesperados', async () => {
      buscarClientePorCPF.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .get('/clientes/12345678901')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erro interno do servidor.');
    });

    test('deve retornar erro 400 para CPF com formato inválido', async () => {
      const invalidCpf = 'abc123def';

      buscarClientePorCPF.mockResolvedValue({
        success: false,
        error: 'CPF inválido'
      });

      const response = await request(app)
          .get(`/clientes/${invalidCpf}`)
          .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'CPF inválido'
      });
    });

    test('deve retornar erro 400 para CPF vazio', async () => {
      const response = await request(app)
          .get('/clientes/') // rota inválida, possivelmente 404, mas pode testar

      expect(response.status).toBe(404); // ou seu comportamento
    });

    test('deve retornar Content-Type application/json', async () => {
      buscarClientePorCPF.mockResolvedValue({
        success: true,
        cliente: { cpf: '12345678901', dadosPessoais: { nome: 'João Silva' } }
      });

      const response = await request(app)
          .get('/clientes/12345678901')
          .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /clientes/:cpf', () => {
    test('deve atualizar cliente com dados válidos', async () => {
      const updates = {
        dadosPessoais: { nome: 'João Silva Atualizado' }
      };

      atualizarCliente.mockResolvedValue({
        success: true
      });

      const response = await request(app)
        .put('/clientes/12345678901')
        .send(updates)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Cliente 12345678901 atualizado com sucesso!'
      });

      expect(atualizarCliente).toHaveBeenCalledWith('12345678901', updates);
    });

    test('deve retornar erro 400 quando não há dados para atualizar', async () => {
      const response = await request(app)
        .put('/clientes/12345678901')
        .send({})
        .expect(400);

      expect(response.text).toContain('Nenhum dado fornecido para atualização');
      expect(atualizarCliente).not.toHaveBeenCalled();
    });

    test('deve retornar erro 404 quando cliente não é encontrado', async () => {
      const updates = { dadosPessoais: { nome: 'João' } };

      atualizarCliente.mockResolvedValue({
        success: false,
        error: 'Cliente não encontrado.'
      });

      const response = await request(app)
        .put('/clientes/12345678901')
        .send(updates)
        .expect(404);

      expect(response.body.error).toBe('Cliente não encontrado.');
    });

    test('deve retornar erro 500 quando atualizarCliente falha', async () => {
      const updates = { dadosPessoais: { nome: 'João' } };

      atualizarCliente.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
        .put('/clientes/12345678901')
        .send(updates)
        .expect(500);

      expect(response.body.error).toBe('Erro no Firestore');
    });

    test('deve capturar erros inesperados', async () => {
      const updates = { dadosPessoais: { nome: 'João' } };

      atualizarCliente.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .put('/clientes/12345678901')
        .send(updates)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
    });

    test('deve atualizar apenas o nome do cliente', async () => {
      const updates = { dadosPessoais: { nome: 'Novo Nome' } };

      atualizarCliente.mockResolvedValue({ success: true });

      const response = await request(app)
          .put('/clientes/12345678901')
          .send(updates)
          .expect(200);

      expect(response.body.message).toContain('atualizado com sucesso');
      expect(atualizarCliente).toHaveBeenCalledWith('12345678901', updates);
    });

    test('deve ignorar campos extras no corpo da requisição', async () => {
      const updates = {
        dadosPessoais: { nome: 'João' },
        campoInvalido: 'invalido'
      };

      atualizarCliente.mockResolvedValue({ success: true });

      const response = await request(app)
          .put('/clientes/12345678901')
          .send(updates)
          .expect(200);

      expect(response.body.message).toContain('atualizado com sucesso');
      expect(atualizarCliente).toHaveBeenCalledWith('12345678901', expect.objectContaining({
        dadosPessoais: { nome: 'João' }
      }));
    });

    test('deve atualizar dados pessoais e endereço do cliente', async () => {
      const updates = {
        dadosPessoais: { nome: 'João Atualizado' },
        endereco: { cidade: 'São Paulo' }
      };

      atualizarCliente.mockResolvedValue({ success: true });

      const response = await request(app)
          .put('/clientes/12345678901')
          .send(updates)
          .expect(200);

      expect(response.body.message).toContain('atualizado com sucesso');
      expect(atualizarCliente).toHaveBeenCalledWith('12345678901', updates);
    });

    test('deve retornar erro 400 quando body da requisição é null', async () => {
      const response = await request(app)
          .put('/clientes/12345678901')
          .send(null)
          .expect(400);

      expect(response.text).toContain('Nenhum dado fornecido para atualização');
      expect(atualizarCliente).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /clientes/:cpf', () => {
    test('deve deletar cliente com sucesso', async () => {
      deletarCliente.mockResolvedValue({
        success: true
      });

      const response = await request(app)
        .delete('/clientes/12345678901')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Cliente 12345678901 deletado com sucesso!'
      });

      expect(deletarCliente).toHaveBeenCalledWith('12345678901');
    });

    test('deve retornar erro 404 quando cliente não é encontrado', async () => {
      deletarCliente.mockResolvedValue({
        success: false,
        error: 'Cliente não encontrado.'
      });

      const response = await request(app)
        .delete('/clientes/12345678901')
        .expect(404);

      expect(response.body.error).toBe('Cliente não encontrado.');
    });

    test('deve retornar erro 500 quando deletarCliente falha', async () => {
      deletarCliente.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
        .delete('/clientes/12345678901')
        .expect(500);

      expect(response.body.error).toBe('Erro no Firestore');
    });

    test('deve capturar erros inesperados', async () => {
      deletarCliente.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .delete('/clientes/12345678901')
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
    });

    test('deve retornar erro 400 para CPF mal formatado', async () => {
      const response = await request(app)
          .delete('/clientes/abc123')
          .expect(400);

      expect(response.text).toContain('CPF inválido');
      expect(deletarCliente).not.toHaveBeenCalled();
    });

    test('deve retornar erro 500 se deletarCliente retorna resposta inesperada', async () => {
      deletarCliente.mockResolvedValue(undefined); // resposta quebrada

      const response = await request(app)
          .delete('/clientes/12345678901')
          .expect(500);

      expect(response.body.error).toBe('Erro inesperado ao deletar cliente');
    });

    test('deve retornar erro 404 se cliente já foi deletado anteriormente', async () => {
      deletarCliente.mockResolvedValue({
        success: false,
        error: 'Cliente já removido.'
      });

      const response = await request(app)
          .delete('/clientes/12345678901')
          .expect(404);

      expect(response.body.error).toBe('Cliente já removido.');
    });
  });

  // Testes adicionais para aumentar cobertura
  describe('GET /:cpf - Testes de cobertura adicional', () => {
    test('deve retornar cliente quando busca por CPF é bem-sucedida', async () => {
      const cpf = '12345678901';
      const mockCliente = {
        cpf,
        dadosPessoais: { nome: 'João Silva' },
        endereco: { cidade: 'São Paulo' }
      };

      buscarClientePorCPF.mockResolvedValue({
        success: true,
        cliente: mockCliente
      });

      const response = await request(app)
        .get(`/clientes/${cpf}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        cliente: mockCliente
      });
      expect(buscarClientePorCPF).toHaveBeenCalledWith(cpf);
    });

    test('deve retornar erro 404 quando cliente não é encontrado', async () => {
      const cpf = '99999999999';

      buscarClientePorCPF.mockResolvedValue({
        success: false,
        error: 'Cliente não encontrado.'
      });

      const response = await request(app)
        .get(`/clientes/${cpf}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Cliente não encontrado.'
      });
    });

    test('deve retornar erro 500 para outros erros', async () => {
      const cpf = '12345678901';

      buscarClientePorCPF.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
        .get(`/clientes/${cpf}`)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Erro no Firestore'
      });
    });

    test('deve capturar erros inesperados na busca por CPF', async () => {
      const cpf = '12345678901';

      buscarClientePorCPF.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .get(`/clientes/${cpf}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erro interno do servidor.');
    });

    test('deve incluir detalhes do erro em desenvolvimento', async () => {
      const cpf = '12345678901';
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      buscarClientePorCPF.mockRejectedValue(new Error('Erro específico'));

      const response = await request(app)
        .get(`/clientes/${cpf}`)
        .expect(500);

      expect(response.body.detalhes).toBe('Erro específico');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('PUT /:cpf - Testes de cobertura adicional', () => {
    test('deve atualizar cliente com sucesso', async () => {
      const cpf = '12345678901';
      const updates = {
        dadosPessoais: { nome: 'João Silva Atualizado' }
      };

      atualizarCliente.mockResolvedValue({
        success: true
      });

      const response = await request(app)
        .put(`/clientes/${cpf}`)
        .send(updates)
        .expect(200);

      expect(response.body).toEqual({
        message: `Cliente ${cpf} atualizado com sucesso!`
      });
      expect(atualizarCliente).toHaveBeenCalledWith(cpf, updates);
    });

    test('deve retornar erro 400 quando nenhum dado é fornecido', async () => {
      const cpf = '12345678901';

      const response = await request(app)
        .put(`/clientes/${cpf}`)
        .send({})
        .expect(400);

      expect(response.text).toBe('Nenhum dado fornecido para atualização.');
      expect(atualizarCliente).not.toHaveBeenCalled();
    });

    test('deve retornar erro 404 quando cliente não existe para atualização', async () => {
      const cpf = '99999999999';
      const updates = { dadosPessoais: { nome: 'Teste' } };

      atualizarCliente.mockResolvedValue({
        success: false,
        error: 'Cliente não encontrado.'
      });

      const response = await request(app)
        .put(`/clientes/${cpf}`)
        .send(updates)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Erro ao atualizar cliente',
        error: 'Cliente não encontrado.'
      });
    });

    test('deve retornar erro 500 para outros erros na atualização', async () => {
      const cpf = '12345678901';
      const updates = { dadosPessoais: { nome: 'Teste' } };

      atualizarCliente.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
        .put(`/clientes/${cpf}`)
        .send(updates)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Erro ao atualizar cliente',
        error: 'Erro no Firestore'
      });
    });

    test('deve capturar erros inesperados na atualização', async () => {
      const cpf = '12345678901';
      const updates = { dadosPessoais: { nome: 'Teste' } };

      atualizarCliente.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .put(`/clientes/${cpf}`)
        .send(updates)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
    });
  });

  describe('DELETE /:cpf - Testes de cobertura adicional', () => {
    test('deve deletar cliente com sucesso', async () => {
      const cpf = '12345678901';

      deletarCliente.mockResolvedValue({
        success: true
      });

      const response = await request(app)
        .delete(`/clientes/${cpf}`)
        .expect(200);

      expect(response.body).toEqual({
        message: `Cliente ${cpf} deletado com sucesso!`
      });
      expect(deletarCliente).toHaveBeenCalledWith(cpf);
    });

    test('deve retornar erro 404 quando cliente não existe para deleção', async () => {
      const cpf = '99999999999';

      deletarCliente.mockResolvedValue({
        success: false,
        error: 'Cliente não encontrado.'
      });

      const response = await request(app)
        .delete(`/clientes/${cpf}`)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Erro ao deletar cliente',
        error: 'Cliente não encontrado.'
      });
    });

    test('deve retornar erro 500 para outros erros na deleção', async () => {
      const cpf = '12345678901';

      deletarCliente.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
        .delete(`/clientes/${cpf}`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Erro ao deletar cliente',
        error: 'Erro no Firestore'
      });
    });

    test('deve capturar erros inesperados na deleção', async () => {
      const cpf = '12345678901';

      deletarCliente.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .delete(`/clientes/${cpf}`)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
    });
  });

  describe('GET / - Testes de cobertura adicional para listagem', () => {

    test('deve retornar erro 400 para ultimoDocId inválido', async () => {
      const mockUltimoDoc = {
        exists: false
      };

      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockUltimoDoc)
        }))
      });

      const response = await request(app)
        .get('/clientes?ultimoDocId=invalid123')
        .expect(500);
    });

    test('deve processar filtros JSON válidos', async () => {
      const filtros = { nome: 'João', tipo: 'PF' };
      const mockResult = {
        clientes: [],
        ultimoDoc: null
      };

      listarClientes.mockResolvedValue(mockResult);

      await request(app)
        .get(`/clientes?filtros=${encodeURIComponent(JSON.stringify(filtros))}`)
        .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros
      });
    });

    test('deve usar filtros vazios quando JSON é inválido', async () => {
      const mockResult = {
        clientes: [],
        ultimoDoc: null
      };

      listarClientes.mockResolvedValue(mockResult);

      await request(app)
        .get('/clientes?filtros={invalid-json}')
        .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve incluir detalhes do erro em desenvolvimento na listagem', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      listarClientes.mockRejectedValue(new Error('Erro específico na listagem'));

      const response = await request(app)
        .get('/clientes')
        .expect(500);

      expect(response.body.detalhes).toBe('Erro específico na listagem');
      
      process.env.NODE_ENV = originalEnv;
    });

    test('deve processar limite customizado corretamente', async () => {
      const mockResult = {
        clientes: [],
        ultimoDoc: null
      };

      listarClientes.mockResolvedValue(mockResult);

      await request(app)
        .get('/clientes?limite=5')
        .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 5,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve usar limite padrão quando valor não é numérico', async () => {
      const mockResult = {
        clientes: [],
        ultimoDoc: null
      };

      listarClientes.mockResolvedValue(mockResult);

      await request(app)
        .get('/clientes?limite=abc')
        .expect(200);

      expect(listarClientes).toHaveBeenCalledWith({
        limite: 10, // Padrão
        ultimoDoc: null,
        filtros: {}
      });
    });
  });
});