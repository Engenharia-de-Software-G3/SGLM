const { 
  adicionarManutencao, 
  listarManutencoes, 
  listarManutencao, 
  deletarManutencao,
  removerManutencaoPermanente
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
    test('deve finalizar manutenção com sucesso', async () => {
      const idManutencao = 'manut123';
      const manutencaoData = { placaVeiculo: 'ABC1234' };

      const mockDoc = {
        get: jest.fn().mockResolvedValue({ 
          exists: true,
          data: () => manutencaoData
        }),
        update: jest.fn().mockResolvedValue()
      };

      const mockVeiculoDoc = {
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

      const mockManutencoesCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection
        .mockReturnValueOnce(mockManutencoesCollection)
        .mockReturnValueOnce(mockVeiculosCollection);

      // Execute
      const resultado = await deletarManutencao(idManutencao);

      // Assert
      expect(resultado.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalled();
      expect(mockVeiculoDoc.ref.update).toHaveBeenCalled();
    });

    test('deve retornar erro quando manutenção não existe', async () => {
      const idManutencao = 'manut-inexistente';

      const mockDoc = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        update: jest.fn()
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
      expect(mockDoc.update).not.toHaveBeenCalled();
    });

    test('deve retornar erro quando falha ao finalizar', async () => {
      const idManutencao = 'manut123';
      const manutencaoData = { placaVeiculo: 'ABC1234' };

      const mockDoc = {
        get: jest.fn().mockResolvedValue({ 
          exists: true,
          data: () => manutencaoData
        }),
        update: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      // Execute
      const resultado = await deletarManutencao(idManutencao);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Erro no Firestore');
    });
  });

  describe('listarManutencoes', () => {
    test('deve listar manutenções com paginação usando ultimoDoc', async () => {
      const mockManutencoes = [
        { id: 'manut1', nomeServico: 'Troca de óleo', valor: 150 },
        { id: 'manut2', nomeServico: 'Revisão', valor: 300 }
      ];

      const mockSnapshot = {
        docs: mockManutencoes.map(m => ({
          id: m.id,
          data: () => m
        }))
      };

      const mockUltimoDoc = { id: 'ultimo' };
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        startAfter: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await listarManutencoes({ limite: 10, ultimoDoc: mockUltimoDoc });

      expect(resultado.manutencoes).toHaveLength(2);
      expect(mockQuery.startAfter).toHaveBeenCalledWith(mockUltimoDoc);
    });

    test('deve lançar erro quando Firestore falha em listarManutencoes', async () => {
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Firestore error'))
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      db.collection.mockReturnValue(mockCollection);

      await expect(listarManutencoes(10)).rejects.toThrow('Firestore error');
    });
  });

  describe('listarManutencao (por veículo)', () => {
    test('deve listar manutenções por veículo com ultimoDoc', async () => {
      const veiculoId = 'veiculo123';
      const mockManutencoes = [
        { id: 'manut1', nomeServico: 'Troca de óleo', valor: 150 }
      ];

      const mockSnapshot = {
        docs: mockManutencoes.map(m => ({
          id: m.id,
          data: () => m
        }))
      };

      const mockUltimoDoc = { id: 'ultimo' };
      const mockSubQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        startAfter: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockSubCollection = {
        orderBy: jest.fn(() => mockSubQuery)
      };

      const mockDoc = {
        collection: jest.fn(() => mockSubCollection)
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await listarManutencao(veiculoId, { limite: 10, ultimoDoc: mockUltimoDoc });

      expect(resultado.manutencoes).toHaveLength(1);
      expect(mockSubQuery.startAfter).toHaveBeenCalledWith(mockUltimoDoc);
      expect(resultado.ultimoDoc).toBeDefined();
    });

    test('deve lançar erro quando Firestore falha em listarManutencao', async () => {
      const veiculoId = 'veiculo123';
      const mockSubQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Firestore error'))
      };

      const mockSubCollection = {
        orderBy: jest.fn(() => mockSubQuery)
      };

      const mockDoc = {
        collection: jest.fn(() => mockSubCollection)
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      await expect(listarManutencao(veiculoId, { limite: 10 }))
        .rejects.toThrow('Firestore error');
    });
  });

  describe('removerManutencaoPermanente', () => {
    test('deve remover manutenção permanentemente', async () => {
      const idManutencao = 'manut123';
      
      const mockDoc = {
        get: jest.fn().mockResolvedValue({ 
          exists: true,
          data: () => ({ id: idManutencao })
        }),
        delete: jest.fn().mockResolvedValue()
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await removerManutencaoPermanente(idManutencao);

      expect(resultado.success).toBe(true);
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    test('deve retornar erro quando manutenção não existe para remoção', async () => {
      const idManutencao = 'inexistente';
      
      const mockDoc = {
        get: jest.fn().mockResolvedValue({ exists: false }),
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await removerManutencaoPermanente(idManutencao);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Manutenção não encontrada.');
    });

    test('deve retornar erro quando Firestore falha em removerManutencaoPermanente', async () => {
      const idManutencao = 'manut123';
      
      const mockDoc = {
        get: jest.fn().mockRejectedValue(new Error('Firestore error'))
      };

      const mockCollection = {
        doc: jest.fn(() => mockDoc)
      };

      db.collection.mockReturnValue(mockCollection);

      const resultado = await removerManutencaoPermanente(idManutencao);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Firestore error');
    });
  });
});