const { 
  adicionarManutencao, 
  listarManutencoes, 
  listarManutencao, 
  deletarManutencao 
} = require('../scripts/firestore/firestoreManutencao.js');

// Mock das dependências
jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-manut-123'),
}));

const { db } = require('../firebaseConfig.js');

describe('firestoreManutencao', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('adicionarManutencao', () => {
    const manutencaoData = {
      placaVeiculo: 'ABC-1234',
      nomeServico: 'Troca de óleo',
      valor: 150.00,
      quilometragem: 50000
    };

    test('deve adicionar manutenção com sucesso', async () => {
      // Mock do veículo encontrado
      const mockVeiculoDoc = {
        data: () => ({
          id: 'veiculo123',
          placa: 'ABC1234',
          quilometragem: 50000
        }),
        ref: {
          update: jest.fn().mockResolvedValue()
        }
      };

      const mockVeiculosSnapshot = {
        empty: false,
        docs: [mockVeiculoDoc]
      };

      const mockVeiculosQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculosSnapshot)
        }))
      };

      const mockVeiculosCollection = {
        where: jest.fn(() => mockVeiculosQuery)
      };

      const mockManutencoesDoc = {
        set: jest.fn().mockResolvedValue()
      };

      const mockManutencoesCollection = {
        doc: jest.fn(() => mockManutencoesDoc)
      };

      db.collection
        .mockReturnValueOnce(mockVeiculosCollection) // primeira chamada para veículos
        .mockReturnValueOnce(mockManutencoesCollection); // segunda chamada para manutenções

      // Execute
      const resultado = await adicionarManutencao(manutencaoData);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.id).toBe('mock-uuid-manut-123');
      expect(mockVeiculosCollection.where).toHaveBeenCalledWith('placa', '==', 'ABC1234');
      expect(mockManutencoesDoc.set).toHaveBeenCalled();
      expect(mockVeiculoDoc.ref.update).toHaveBeenCalled();
    });

    test('deve retornar erro quando veículo não é encontrado', async () => {
      const mockVeiculosSnapshot = {
        empty: true
      };

      const mockVeiculosQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculosSnapshot)
        }))
      };

      const mockVeiculosCollection = {
        where: jest.fn(() => mockVeiculosQuery)
      };

      db.collection.mockReturnValue(mockVeiculosCollection);

      // Execute
      const resultado = await adicionarManutencao(manutencaoData);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Veículo não encontrado');
    });

    test('deve retornar erro quando falha ao salvar', async () => {
      const mockVeiculoDoc = {
        data: () => ({ quilometragem: 50000 }),
        ref: { update: jest.fn() }
      };

      const mockVeiculosSnapshot = {
        empty: false,
        docs: [mockVeiculoDoc]
      };

      const mockVeiculosQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculosSnapshot)
        }))
      };

      const mockVeiculosCollection = {
        where: jest.fn(() => mockVeiculosQuery)
      };

      const mockManutencoesDoc = {
        set: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
      };

      const mockManutencoesCollection = {
        doc: jest.fn(() => mockManutencoesDoc)
      };

      db.collection
        .mockReturnValueOnce(mockVeiculosCollection)
        .mockReturnValueOnce(mockManutencoesCollection);

      // Execute
      const resultado = await adicionarManutencao(manutencaoData);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain('Erro no Firestore');
    });
  });

  describe('listarManutencoes', () => {
    test('deve listar todas as manutenções', async () => {
      const mockManutencoes = [
        { id: 'manut1', nomeServico: 'Troca de óleo' },
        { id: 'manut2', nomeServico: 'Revisão' }
      ];

      const mockDocs = mockManutencoes.map(manut => ({
        data: () => manut
      }));

      const mockSnapshot = {
        docs: mockDocs
      };

      const mockQuery = {
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => mockQuery)
        }))
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await listarManutencoes();

      // Assert
      expect(resultado).toEqual({ manutencoes: mockManutencoes });
      expect(db.collection).toHaveBeenCalledWith('manutencoes');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('data', 'desc');
    });

    test('deve retornar lista vazia quando não há manutenções', async () => {
      const mockSnapshot = {
        docs: []
      };

      const mockQuery = {
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => mockQuery)
        }))
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await listarManutencoes();

      // Assert
      expect(resultado).toEqual({ manutencoes: [] });
    });
  });

  describe('listarManutencao', () => {
    test('deve listar manutenções de um veículo específico', async () => {
      const veiculoId = 'veiculo123';
      const mockManutencoes = [
        { id: 'manut1', veiculoId: 'veiculo123', nomeServico: 'Troca de óleo' }
      ];

      const mockDocs = mockManutencoes.map(manut => ({
        data: () => manut,
        id: manut.id
      }));

      const mockSnapshot = {
        docs: mockDocs
      };

      const mockQuery = {
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockSubCollection = {
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => mockQuery)
        }))
      };

      const mockDocRef = {
        collection: jest.fn(() => mockSubCollection)
      };

      const mockCollection = {
        doc: jest.fn(() => mockDocRef)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await listarManutencao(veiculoId);

      // Assert
      expect(resultado.manutencoes).toEqual(mockManutencoes);
      expect(resultado.ultimoDoc).toBeDefined();
      expect(mockCollection.doc).toHaveBeenCalledWith(veiculoId);
      expect(mockDocRef.collection).toHaveBeenCalledWith('manutencoes');
    });
  });

  describe('deletarManutencao', () => {
    test('deve deletar manutenção com sucesso', async () => {
      const idManutencao = 'manut123';

      const mockDoc = {
        get: jest.fn().mockResolvedValue({ exists: true }),
        delete: jest.fn().mockResolvedValue()
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await deletarManutencao(idManutencao);

      // Assert
      expect(resultado.success).toBe(true);
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    test('deve retornar erro quando manutenção não existe', async () => {
      const idManutencao = 'manut-inexistente';

      const mockDoc = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        delete: jest.fn()
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await deletarManutencao(idManutencao);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Manutenção não encontrada.');
      expect(mockDoc.delete).not.toHaveBeenCalled();
    });

    test('deve retornar erro quando falha ao deletar', async () => {
      const idManutencao = 'manut123';

      const mockDoc = {
        get: jest.fn().mockResolvedValue({ exists: true }),
        delete: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await deletarManutencao(idManutencao);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain('Erro no Firestore');
    });
  });
});