const { criarFornecedor, listarFornecedores, buscarPorCnpj } = require('../scripts/firestore/firestoreFornecedores.js');

// Mock das dependências
jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(),
    batch: jest.fn(() => ({
      set: jest.fn(),
      commit: jest.fn(),
    })),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

const { db } = require('../firebaseConfig.js');

describe('firestoreFornecedores', () => {
  let mockBatch;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockBatch = {
      set: jest.fn().mockReturnThis(),
      commit: jest.fn().mockResolvedValue(),
    };
    
    db.batch.mockReturnValue(mockBatch);
  });

  describe('criarFornecedor', () => {
    const fornecedorData = {
      nome: 'Oficina Central LTDA',
      cnpj: '12.345.678/0001-90',
      servicos: ['Manutenção preventiva', 'Troca de óleo'],
      contato: {
        telefone: '(11) 99999-9999',
        email: 'contato@oficina.com'
      },
      endereco: {
        rua: 'Rua das Oficinas, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      }
    };

    test('deve criar fornecedor com sucesso', async () => {
      // Setup mocks - CNPJ não existe
      const mockQuerySnapshot = {
        empty: true
      };
      
      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockQuerySnapshot)
        }))
      };

      const mockCollection = {
        where: jest.fn(() => mockQuery),
        doc: jest.fn(() => ({
          set: jest.fn().mockResolvedValue(),
          collection: jest.fn(() => ({
            doc: jest.fn(() => 'mock-doc-ref')
          }))
        }))
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await criarFornecedor(fornecedorData);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.id).toBe('mock-uuid-123');
      expect(mockCollection.where).toHaveBeenCalledWith('cnpj', '==', '12.345.678/0001-90');
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    test('deve retornar erro quando CNPJ já existe', async () => {
      // Setup mocks - CNPJ já existe
      const mockQuerySnapshot = {
        empty: false
      };
      
      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockQuerySnapshot)
        }))
      };

      const mockCollection = {
        where: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await criarFornecedor(fornecedorData);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('CNPJ já cadastrado no sistema.');
      expect(mockBatch.commit).not.toHaveBeenCalled();
    });

    test('deve retornar erro quando falha ao salvar no Firestore', async () => {
      // Setup mocks - CNPJ não existe mas falha ao salvar
      const mockQuerySnapshot = {
        empty: true
      };
      
      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockQuerySnapshot)
        }))
      };

      const mockDocRef = {
        set: jest.fn().mockRejectedValue(new Error('Erro no Firestore')),
        collection: jest.fn(() => ({
          doc: jest.fn(() => 'mock-doc-ref')
        }))
      };

      const mockCollection = {
        where: jest.fn(() => mockQuery),
        doc: jest.fn(() => mockDocRef)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await criarFornecedor(fornecedorData);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain('Erro no Firestore');
    });

    test('deve retornar erro quando falha na verificação de CNPJ', async () => {
      // Setup mocks - falha na consulta
      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockRejectedValue(new Error('Erro na consulta'))
        }))
      };

      const mockCollection = {
        where: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await criarFornecedor(fornecedorData);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain('Erro na consulta');
    });

    test('deve processar fornecedor com serviços vazios', async () => {
      const fornecedorSemServicos = {
        ...fornecedorData,
        servicos: []
      };

      // Setup mocks
      const mockQuerySnapshot = {
        empty: true
      };
      
      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockQuerySnapshot)
        }))
      };

      const mockDocRef = {
        set: jest.fn().mockResolvedValue(),
        collection: jest.fn(() => ({
          doc: jest.fn(() => 'mock-doc-ref')
        }))
      };

      const mockCollection = {
        where: jest.fn(() => mockQuery),
        doc: jest.fn(() => mockDocRef)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await criarFornecedor(fornecedorSemServicos);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.id).toBe('mock-uuid-123');
    });

    test('deve processar múltiplos serviços', async () => {
      const fornecedorComMuitosServicos = {
        ...fornecedorData,
        servicos: ['Serviço 1', 'Serviço 2', 'Serviço 3', 'Serviço 4']
      };

      // Setup mocks
      const mockQuerySnapshot = {
        empty: true
      };
      
      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockQuerySnapshot)
        }))
      };

      const mockDocRef = {
        set: jest.fn().mockResolvedValue(),
        collection: jest.fn(() => ({
          doc: jest.fn(() => 'mock-doc-ref')
        }))
      };

      const mockCollection = {
        where: jest.fn(() => mockQuery),
        doc: jest.fn(() => mockDocRef)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await criarFornecedor(fornecedorComMuitosServicos);

      // Assert
      expect(resultado.success).toBe(true);
      expect(mockBatch.set).toHaveBeenCalledTimes(6); // 4 serviços + 1 contato + 1 endereço
    });
  });

  describe('listarFornecedores', () => {
    const mockFornecedores = [
      { id: '1', nome: 'Fornecedor A', cnpj: '11.111.111/0001-01' },
      { id: '2', nome: 'Fornecedor B', cnpj: '22.222.222/0001-02' }
    ];

    test('deve listar fornecedores com paginação', async () => {
      const mockSnapshot = {
        docs: mockFornecedores.map(f => ({ 
          data: () => f 
        }))
      };

      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await listarFornecedores({ limite: 10 });

      expect(resultado).toHaveProperty('fornecedores');
      expect(resultado).toHaveProperty('ultimoDoc');
      expect(Array.isArray(resultado.fornecedores)).toBe(true);
      expect(resultado.fornecedores).toHaveLength(2);
      expect(mockCollection.orderBy).toHaveBeenCalledWith('nome');
    });

    test('deve filtrar por nome', async () => {
      const mockSnapshot = {
        docs: [{ data: () => mockFornecedores[0] }]
      };

      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await listarFornecedores({ 
        limite: 10, 
        filtros: { nome: 'Fornecedor A' } 
      });

      expect(resultado.fornecedores).toHaveLength(1);
      expect(mockQuery.where).toHaveBeenCalledWith('nome', '>=', 'Fornecedor A');
      expect(mockQuery.where).toHaveBeenCalledWith('nome', '<=', 'Fornecedor A\uf8ff');
    });

    test('deve filtrar por CNPJ', async () => {
      const mockSnapshot = {
        docs: [{ data: () => mockFornecedores[0] }]
      };

      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await listarFornecedores({ 
        limite: 10, 
        filtros: { cnpj: '11.111.111/0001-01' } 
      });

      expect(resultado.fornecedores).toHaveLength(1);
      expect(mockQuery.where).toHaveBeenCalledWith('cnpj', '==', '11.111.111/0001-01');
    });

    test('deve usar ultimoDoc para paginação', async () => {
      const mockUltimoDoc = { id: 'ultimo' };
      const mockSnapshot = {
        docs: [{ data: () => mockFornecedores[0] }]
      };

      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        startAfter: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await listarFornecedores({ 
        limite: 10, 
        ultimoDoc: mockUltimoDoc 
      });

      expect(mockQuery.startAfter).toHaveBeenCalledWith(mockUltimoDoc);
    });

    test('deve lançar erro quando Firestore falha', async () => {
      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      await expect(listarFornecedores({ limite: 10 }))
        .rejects.toThrow('Erro no Firestore');
    });
  });

  describe('buscarPorCnpj', () => {
    test('deve retornar fornecedor quando encontrado', async () => {
      const mockFornecedor = { id: '1', nome: 'Fornecedor A', cnpj: '11.111.111/0001-01' };
      const mockSnapshot = {
        empty: false,
        docs: [{ data: () => mockFornecedor }]
      };

      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        }))
      };

      const mockCollection = {
        where: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await buscarPorCnpj('11.111.111/0001-01');

      expect(resultado).toEqual(mockFornecedor);
      expect(mockCollection.where).toHaveBeenCalledWith('cnpj', '==', '11.111.111/0001-01');
    });

    test('deve retornar null quando não encontrado', async () => {
      const mockSnapshot = {
        empty: true
      };

      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        }))
      };

      const mockCollection = {
        where: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await buscarPorCnpj('99.999.999/0001-99');

      expect(resultado).toBeNull();
    });
  });
});