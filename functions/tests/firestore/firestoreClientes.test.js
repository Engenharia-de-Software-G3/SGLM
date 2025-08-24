// Mock do firebaseConfig
const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(),
          get: jest.fn(),
          delete: jest.fn(),
        })),
        get: jest.fn(),
        where: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
    })),
    where: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(),
      })),
      get: jest.fn(),
    })),
    get: jest.fn(),
  })),
  batch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(),
  })),
};

jest.mock('../../firebaseConfig.js', () => ({
  db: mockDb,
}));

const {
  criarCliente,
  listarClientes,
  atualizarCliente,
  deletarCliente,
  buscarClientePorCPF,
} = require('../../scripts/firestore/firestoreClientes.js');

describe('FirestoreClientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarCliente', () => {
    test('deve criar cliente com dados básicos', async () => {
      const clienteData = {
        cpf: '123.456.789-01',
        dadosPessoais: {
          nome: 'João Silva',
          dataNascimento: '1990-01-01'
        },
        endereco: {
          cep: '01234-567',
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        contato: {
          email: 'joao@email.com',
          telefone: '(11) 99999-9999'
        }
      };

      // Mock para verificar se CPF já existe (retorna vazio = não existe)
      const mockSnapshot = { empty: true };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      // Mock para operações de criação
      mockDb.collection().doc().set.mockResolvedValue();
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue()
      };
      mockDb.batch.mockReturnValue(mockBatch);

      const result = await criarCliente(clienteData);

      expect(result.success).toBe(true);
      expect(mockDb.collection).toHaveBeenCalledWith('clientes');
      expect(mockDb.collection().where).toHaveBeenCalledWith('id', '==', '12345678901');
      expect(mockDb.collection().doc).toHaveBeenCalledWith('12345678901');
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    test('deve retornar erro quando CPF já existe', async () => {
      const clienteData = {
        cpf: '123.456.789-01',
        dadosPessoais: {
          nome: 'João Silva',
          dataNascimento: '1990-01-01'
        },
        endereco: {
          cep: '01234-567',
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        contato: {
          email: 'joao@email.com',
          telefone: '(11) 99999-9999'
        }
      };

      // Mock para verificar se CPF já existe (retorna com dados = já existe)
      const mockSnapshot = { empty: false };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await criarCliente(clienteData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('CPF já cadastrado no sistema.');
    });

    test('deve criar cliente com dados bancários', async () => {
      const clienteData = {
        cpf: '123.456.789-01',
        dadosPessoais: {
          nome: 'João Silva',
          dataNascimento: '1990-01-01'
        },
        endereco: {
          cep: '01234-567',
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        contato: {
          email: 'joao@email.com',
          telefone: '(11) 99999-9999'
        },
        dadosBancarios: {
          banco: 'Banco do Brasil',
          agencia: '1234',
          agenciaDigito: '5',
          conta: '56789',
          contaDigito: '0'
        }
      };

      const mockSnapshot = { empty: true };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);
      
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue()
      };
      mockDb.batch.mockReturnValue(mockBatch);

      const result = await criarCliente(clienteData);

      expect(result.success).toBe(true);
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          banco: 'Banco do Brasil',
          agencia: '1234',
          isPrincipal: true
        })
      );
    });

    test('deve criar cliente com CNH', async () => {
      const clienteData = {
        cpf: '123.456.789-01',
        dadosPessoais: {
          nome: 'João Silva',
          dataNascimento: '1990-01-01'
        },
        endereco: {
          cep: '01234-567',
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        contato: {
          email: 'joao@email.com',
          telefone: '(11) 99999-9999'
        },
        documentos: {
          cnh: {
            numero: '12345678901',
            categoria: 'AB',
            dataValidade: '2030-01-01'
          }
        }
      };

      const mockSnapshot = { empty: true };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);
      
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue()
      };
      mockDb.batch.mockReturnValue(mockBatch);

      const result = await criarCliente(clienteData);

      expect(result.success).toBe(true);
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          tipo: 'CNH',
          numero: '12345678901',
          categoria: 'AB'
        })
      );
    });

    test('deve capturar erros de Firestore', async () => {
      const clienteData = {
        cpf: '123.456.789-01',
        dadosPessoais: { nome: 'João Silva' },
        endereco: { cidade: 'São Paulo' },
        contato: { email: 'joao@email.com' }
      };

      mockDb.collection().where().limit().get.mockRejectedValue(new Error('Erro do Firestore'));

      const result = await criarCliente(clienteData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro do Firestore');
    });
  });

  describe('buscarClientePorCPF', () => {
    test('deve buscar cliente existente', async () => {
      const cpf = '12345678901';
      const mockClienteDoc = {
        exists: true,
        id: cpf,
        data: () => ({
          id: cpf,
          nomeCompleto: 'João Silva',
          tipo: 'PF',
          status: 'ativo'
        })
      };

      const mockSubcolecoes = {
        enderecos: { docs: [{ id: 'principal', data: () => ({ rua: 'Rua Teste' }) }] },
        contatos: { docs: [{ id: 'principal', data: () => ({ email: 'joao@email.com' }) }] },
        documentos: { docs: [] },
        'dados-bancarios': { docs: [] }
      };

      mockDb.collection().doc().get.mockResolvedValue(mockClienteDoc);
      mockDb.collection().doc().collection().get
        .mockResolvedValueOnce(mockSubcolecoes.enderecos)
        .mockResolvedValueOnce(mockSubcolecoes.contatos)
        .mockResolvedValueOnce(mockSubcolecoes.documentos)
        .mockResolvedValueOnce(mockSubcolecoes['dados-bancarios']);

      const result = await buscarClientePorCPF(cpf);

      expect(result.success).toBe(true);
      expect(result.cliente.id).toBe(cpf);
      expect(result.cliente.nomeCompleto).toBe('João Silva');
      expect(result.cliente.enderecos).toBeDefined();
      expect(result.cliente.contatos).toBeDefined();
    });

    test('deve retornar erro quando cliente não existe', async () => {
      const cpf = '12345678901';
      const mockClienteDoc = { exists: false };

      mockDb.collection().doc().get.mockResolvedValue(mockClienteDoc);

      const result = await buscarClientePorCPF(cpf);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cliente não encontrado.');
    });

    test('deve formatar CPF corretamente', async () => {
      const cpfFormatado = '123.456.789-01';
      const cpfLimpo = '12345678901';

      const mockClienteDoc = { exists: false };
      mockDb.collection().doc().get.mockResolvedValue(mockClienteDoc);

      await buscarClientePorCPF(cpfFormatado);

      expect(mockDb.collection().doc).toHaveBeenCalledWith(cpfLimpo);
    });

    test('deve capturar erros de Firestore', async () => {
      const cpf = '12345678901';
      mockDb.collection().doc().get.mockRejectedValue(new Error('Erro do Firestore'));

      const result = await buscarClientePorCPF(cpf);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro do Firestore');
    });
  });

  describe('atualizarCliente', () => {
    test('deve atualizar dados do cliente', async () => {
      const cpf = '12345678901';
      const updates = {
        dadosPessoais: { nome: 'João Silva Santos' },
        status: 'inativo'
      };

      const mockClienteDoc = { exists: true };
      mockDb.collection().doc().get.mockResolvedValue(mockClienteDoc);
      mockDb.collection().doc().update.mockResolvedValue();

      const result = await atualizarCliente(cpf, updates);

      expect(result.success).toBe(true);
      expect(mockDb.collection().doc().update).toHaveBeenCalledWith(
        expect.objectContaining({
          nomeCompleto: 'João Silva Santos',
          status: 'inativo'
        })
      );
    });

    test('deve retornar erro quando cliente não existe', async () => {
      const cpf = '12345678901';
      const updates = { status: 'inativo' };

      const mockClienteDoc = { exists: false };
      mockDb.collection().doc().get.mockResolvedValue(mockClienteDoc);

      const result = await atualizarCliente(cpf, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cliente não encontrado.');
    });

    test('deve capturar erros de Firestore', async () => {
      const cpf = '12345678901';
      const updates = { status: 'inativo' };

      mockDb.collection().doc().get.mockRejectedValue(new Error('Erro do Firestore'));

      const result = await atualizarCliente(cpf, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro do Firestore');
    });
  });

  describe('deletarCliente', () => {
    test('deve deletar cliente e subcoleções', async () => {
      const cpf = '12345678901';

      const mockClienteDoc = { exists: true };
      const mockSubcolecoes = {
        enderecos: { docs: [{ ref: { delete: jest.fn() } }] },
        contatos: { docs: [{ ref: { delete: jest.fn() } }] },
        documentos: { docs: [] },
        'dados-bancarios': { docs: [] }
      };

      mockDb.collection().doc().get.mockResolvedValue(mockClienteDoc);
      mockDb.collection().doc().collection().get
        .mockResolvedValueOnce(mockSubcolecoes.enderecos)
        .mockResolvedValueOnce(mockSubcolecoes.contatos)
        .mockResolvedValueOnce(mockSubcolecoes.documentos)
        .mockResolvedValueOnce(mockSubcolecoes['dados-bancarios']);

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue()
      };
      mockDb.batch.mockReturnValue(mockBatch);

      const result = await deletarCliente(cpf);

      expect(result.success).toBe(true);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    test('deve retornar erro quando cliente não existe', async () => {
      const cpf = '12345678901';
      const mockClienteDoc = { exists: false };

      mockDb.collection().doc().get.mockResolvedValue(mockClienteDoc);

      const result = await deletarCliente(cpf);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cliente não encontrado.');
    });

    test('deve capturar erros de Firestore', async () => {
      const cpf = '12345678901';
      mockDb.collection().doc().get.mockRejectedValue(new Error('Erro do Firestore'));

      const result = await deletarCliente(cpf);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro do Firestore');
    });
  });

  describe('listarClientes', () => {
    test('deve listar clientes sem filtros', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'cliente1',
            data: () => ({ nome: 'João', tipo: 'PF' })
          },
          {
            id: 'cliente2', 
            data: () => ({ nome: 'Maria', tipo: 'PF' })
          }
        ],
        size: 2
      };

      mockDb.collection().limit().get.mockResolvedValue(mockSnapshot);

      const result = await listarClientes({ limite: 10 });

      expect(result.clientes).toHaveLength(2);
      expect(result.clientes[0].nome).toBe('João');
      expect(mockDb.collection().limit).toHaveBeenCalledWith(10);
    });

    test('deve aplicar filtros de busca', async () => {
      const filtros = { nome: 'João', tipo: 'PF' };
      const mockSnapshot = {
        docs: [
          { id: 'cliente1', data: () => ({ nome: 'João Silva', tipo: 'PF' }) }
        ],
        size: 1
      };

      mockDb.collection().where().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await listarClientes({ limite: 10, filtros });

      expect(result.clientes).toHaveLength(1);
      expect(mockDb.collection().where).toHaveBeenCalledWith('nomeCompleto', '>=', 'João');
      expect(mockDb.collection().where().where).toHaveBeenCalledWith('tipo', '==', 'PF');
    });

    test('deve implementar paginação', async () => {
      const mockUltimoDoc = { id: 'ultimo-doc' };
      const mockSnapshot = {
        docs: [
          { id: 'cliente2', data: () => ({ nome: 'Maria' }) }
        ],
        size: 1
      };

      mockDb.collection().startAfter().limit().get.mockResolvedValue(mockSnapshot);

      const result = await listarClientes({ 
        limite: 5, 
        ultimoDoc: mockUltimoDoc 
      });

      expect(result.clientes).toHaveLength(1);
      expect(mockDb.collection().startAfter).toHaveBeenCalledWith(mockUltimoDoc);
    });

    test('deve capturar erros de Firestore', async () => {
      mockDb.collection().limit().get.mockRejectedValue(new Error('Erro do Firestore'));

      const result = await listarClientes({ limite: 10 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro do Firestore');
    });
  });
});