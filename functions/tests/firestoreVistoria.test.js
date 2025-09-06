const { criarVistoria, listarVistoriasVeiculo } = require('../scripts/firestore/firestoreVistoria.js');

// Mock simples do Firebase
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockWhere = jest.fn(() => ({ get: mockGet, startAfter: jest.fn(() => ({ get: mockGet })) }));

jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: mockDoc,
      where: mockWhere,
      get: mockGet
    }))
  }
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('firestoreVistoria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarVistoria', () => {
    const vistoriaValida = {
      chassiVeiculo: 'ABC123',
      placaVeiculo: 'ABC-1234',
      nomeEmpresa: 'Empresa Test',
      nomeFuncionario: 'João',
      quilometragem: 50000,
      data: '2023-12-25'
    };

    it('deve criar vistoria com sucesso', async () => {
      mockSet.mockResolvedValue();

      const resultado = await criarVistoria(vistoriaValida);

      expect(resultado).toEqual({ success: true });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        chassi: 'ABC123',
        placa: 'ABC1234', // sem hífen
        quilometragem: 50000
      }));
    });

    it('deve retornar erro para dados inválidos', async () => {
      const vistoriaInvalida = { ...vistoriaValida, placaVeiculo: '' };

      const resultado = await criarVistoria(vistoriaInvalida);

      expect(resultado).toEqual({
        success: false,
        error: 'Dados da vistoria inválidos.'
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      mockSet.mockRejectedValue(new Error('Firestore error'));

      const resultado = await criarVistoria(vistoriaValida);

      expect(resultado).toEqual({ success: false, error: 'Firestore error' });
    });
  });

  describe('listarVistoriasVeiculo', () => {
    it('deve listar vistorias com sucesso', async () => {
      const mockSnapshot = {
        docs: [
          { data: () => ({ id: 'v1', chassi: 'ABC123' }) }
        ]
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await listarVistoriasVeiculo({});

      expect(resultado).toEqual({
        success: true,
        vistorias: [{ id: 'v1', chassi: 'ABC123' }],
        ultimoDoc: mockSnapshot.docs[0]
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      mockGet.mockRejectedValue(new Error('Firestore error'));

      const resultado = await listarVistoriasVeiculo({});

      expect(resultado).toEqual({ success: false, error: 'Firestore error' });
    });
  });
});