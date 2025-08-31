const { criarFornecedor } = require('../scripts/firestore/firestoreFornecedores.js');

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
});