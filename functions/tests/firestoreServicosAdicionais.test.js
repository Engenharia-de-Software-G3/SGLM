const { criarServicoAdicional, listarServicosAdicionais } = require('../scripts/firestore/firestoreServicosAdicionais.js');

// Mock simples do Firebase
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockStartAfter = jest.fn();

jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: mockDoc,
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          where: mockWhere,
          startAfter: mockStartAfter,
          get: mockGet
        }))
      }))
    }))
  }
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('firestoreServicosAdicionais', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarServicoAdicional', () => {
    it('deve criar serviço adicional com sucesso', async () => {
      mockSet.mockResolvedValue();

      const servicoData = {
        chassiVeiculo: 'ABC123',
        nome: 'Troca de óleo',
        data: '2023-12-25',
        valor: 150
      };

      const resultado = await criarServicoAdicional(servicoData);

      expect(resultado).toEqual({ success: true });
      expect(mockSet).toHaveBeenCalled();
    });

    it('deve retornar erro quando Firestore falha', async () => {
      mockSet.mockRejectedValue(new Error('Firestore error'));

      const servicoData = {
        chassiVeiculo: 'ABC123',
        nome: 'Troca de óleo',
        data: '2023-12-25',
        valor: 150
      };

      const resultado = await criarServicoAdicional(servicoData);

      expect(resultado).toEqual({ success: false, error: 'Firestore error' });
    });
  });

  describe('listarServicosAdicionais', () => {
    it('deve listar serviços com sucesso', async () => {
      const mockSnapshot = {
        docs: [
          { id: 'doc1', data: () => ({ id: 'serv1', nome: 'Serviço 1' }) }
        ]
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await listarServicosAdicionais({});

      expect(resultado).toHaveProperty('servicosAdicionais');
      expect(resultado).toHaveProperty('ultimoDoc');
    });

    it('deve lançar erro quando Firestore falha', async () => {
      mockGet.mockRejectedValue(new Error('Firestore error'));

      await expect(listarServicosAdicionais({})).rejects.toThrow('Firestore error');
    });
  });
});