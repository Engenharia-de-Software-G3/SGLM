const { verificarDocumentoExistente, formatarDataFirestore } = require('../scripts/firestore/firestoreUtils.js');

// Mock das dependências
jest.mock('../firebaseConfig.js', () => {
  const mockGet = jest.fn();
  const mockWhere = jest.fn(() => ({ get: mockGet }));
  const mockCollection = jest.fn(() => ({ where: mockWhere }));
  
  return {
    db: {
      collection: mockCollection,
      __mocks: { mockGet, mockWhere, mockCollection }
    },
  };
});

const { db } = require('../firebaseConfig.js');
const { mockGet, mockWhere, mockCollection } = db.__mocks;

describe('firestoreUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarDocumentoExistente', () => {
    it('deve retornar true quando documento CPF existe', async () => {
      const mockSnapshot = {
        empty: false
      };
      
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await verificarDocumentoExistente('CPF', '12345678901');

      expect(mockCollection).toHaveBeenCalledWith('clientes');
      expect(mockWhere).toHaveBeenCalledWith('cpf', '==', '12345678901');
      expect(resultado).toBe(true);
    });

    it('deve retornar true quando documento CNPJ existe', async () => {
      const mockSnapshot = {
        empty: false
      };
      
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await verificarDocumentoExistente('CNPJ', '12345678000195');

      expect(mockCollection).toHaveBeenCalledWith('clientes');
      expect(mockWhere).toHaveBeenCalledWith('cnpj', '==', '12345678000195');
      expect(resultado).toBe(true);
    });

    it('deve retornar false quando documento CPF não existe', async () => {
      const mockSnapshot = {
        empty: true
      };
      
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await verificarDocumentoExistente('CPF', '98765432109');

      expect(mockCollection).toHaveBeenCalledWith('clientes');
      expect(mockWhere).toHaveBeenCalledWith('cpf', '==', '98765432109');
      expect(resultado).toBe(false);
    });

    it('deve retornar false quando documento CNPJ não existe', async () => {
      const mockSnapshot = {
        empty: true
      };
      
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await verificarDocumentoExistente('CNPJ', '98765432000199');

      expect(mockCollection).toHaveBeenCalledWith('clientes');
      expect(mockWhere).toHaveBeenCalledWith('cnpj', '==', '98765432000199');
      expect(resultado).toBe(false);
    });

    it('deve lançar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      await expect(verificarDocumentoExistente('CPF', '12345678901')).rejects.toThrow('Firestore error');
    });
  });

  describe('formatarDataFirestore', () => {
    it('deve formatar data string para ISO', () => {
      const dataString = '2023-12-25';
      const resultado = formatarDataFirestore(dataString);
      
      expect(resultado).toBe('2023-12-25T00:00:00.000Z');
    });

    it('deve formatar data com hora para ISO', () => {
      const dataString = '2023-12-25T15:30:00Z';
      const resultado = formatarDataFirestore(dataString);
      
      expect(resultado).toBe('2023-12-25T15:30:00.000Z');
    });

    it('deve formatar timestamp para ISO', () => {
      const timestamp = 1703520000000; // 2023-12-25T12:00:00.000Z
      const resultado = formatarDataFirestore(timestamp);
      
      expect(resultado).toMatch(/2023-12-25T\d{2}:00:00\.000Z/);
    });

    it('deve retornar Invalid Date para string inválida', () => {
      const dataInvalida = 'data-invalida';
      
      expect(() => formatarDataFirestore(dataInvalida)).toThrow();
    });

    it('deve formatar null como epoch', () => {
      const resultado = formatarDataFirestore(null);
      
      expect(resultado).toBe('1970-01-01T00:00:00.000Z');
    });

    it('deve lançar erro para undefined', () => {
      expect(() => formatarDataFirestore(undefined)).toThrow();
    });
  });
});