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
  let clienteRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Import the actual router after mocks are set up
    delete require.cache[require.resolve('../cliente.js')];
    clienteRouter = require('../cliente.js').default;
    
    app = express();
    app.use(express.json());
    app.use('/clientes', clienteRouter);
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

    test('deve retornar erro 400 quando CPF é inválido (formato)', async () => {
      const clienteData = {
        cpf: '123456789',  // CPF com formato inválido (menos de 11 dígitos)
        dadosPessoais: {
          nome: 'João Silva'
        }
      };

      const response = await request(app)
        .post('/clientes')
        .send(clienteData)
        .expect(400);

      expect(response.text).toBe('CPF inválido');
      expect(criarCliente).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando CPF contém caracteres não numéricos', async () => {
      const clienteData = {
        cpf: '123.456.789-0a',  // CPF formatado com pontos e hífen
        dadosPessoais: {
          nome: 'João Silva'
        }
      };

      const response = await request(app)
        .post('/clientes')
        .send(clienteData)
        .expect(400);

      expect(response.text).toBe('CPF inválido');
      expect(criarCliente).not.toHaveBeenCalled();
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

    test('deve retornar erro 400 quando ultimoDocId é inválido', async () => {
      // Mock do db para simular documento inexistente
      const mockDocSnapshot = {
        get: jest.fn().mockResolvedValue({ exists: false })
      };
      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDocSnapshot)
      };
      db.collection.mockReturnValue(mockCollection);

      const response = await request(app)
        .get('/clientes?ultimoDocId=invalid-id')
        .expect(400);

      expect(response.body.error).toBe('ultimoDocId inválido');
    });

    test('deve processar paginação com ultimoDocId válido', async () => {
      // Mock do db para simular documento existente
      const mockDocSnapshot = {
        get: jest.fn().mockResolvedValue({ exists: true, id: 'valid-id' })
      };
      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDocSnapshot)
      };
      db.collection.mockReturnValue(mockCollection);

      const mockResult = {
        clientes: [{ id: '123', cpf: '12345678901' }],
        ultimoDoc: { id: 'next-doc-id' }
      };
      listarClientes.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/clientes?ultimoDocId=valid-id')
        .expect(200);

      expect(response.body.paginacao.possuiMais).toBe(true);
      expect(response.body.paginacao.ultimoDocId).toBe('next-doc-id');
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

    test('deve retornar erro 400 quando CPF está vazio ou contém apenas espaços', async () => {
      // Teste com CPF contendo apenas espaços
      const response = await request(app)
        .get('/clientes/%20%20')  // URL encoded spaces
        .expect(400);

      expect(response.body.error).toBe('CPF é obrigatório');
      expect(response.body.message).toBe('Informe um CPF válido para busca.');
      expect(buscarClientePorCPF).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando CPF é inválido na busca', async () => {
      const response = await request(app)
        .get('/clientes/123456789')  // CPF inválido
        .expect(400);

      expect(response.text).toBe('CPF inválido');
      expect(buscarClientePorCPF).not.toHaveBeenCalled();
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

    test('deve retornar erro 400 quando CPF é inválido na atualização', async () => {
      const updates = { dadosPessoais: { nome: 'João' } };

      const response = await request(app)
        .put('/clientes/123456789')  // CPF inválido
        .send(updates)
        .expect(400);

      expect(response.text).toBe('CPF inválido');
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

    test('deve retornar erro 400 quando CPF é inválido na deleção', async () => {
      const response = await request(app)
        .delete('/clientes/123456789')  // CPF inválido
        .expect(400);

      expect(response.text).toBe('CPF inválido');
      expect(deletarCliente).not.toHaveBeenCalled();
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