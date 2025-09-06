const { 
  criarVeiculo, 
  buscarPorId, 
  atualizarVeiculo, 
  buscaVeiculo,
  listarVeiculos,
  listarQuilometragemVeiculo,
  atualizarQuilometragemVeiculo,
  buscarPorChassi
} = require('../scripts/firestore/firestoreVeiculos.js');


// Mock Firebase
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet, update: mockUpdate }));
const mockWhere = jest.fn(() => ({ limit: jest.fn(() => ({ get: mockGet })) }));

jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: mockDoc,
      where: mockWhere,
      limit: jest.fn(() => ({ get: mockGet })),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({ get: mockGet })),
        where: mockWhere,
        get: mockGet
      })),
      get: mockGet
    }))
  }
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('firestoreVeiculos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarVeiculo', () => {
    const veiculoValido = {
      chassi: 'ABC123',
      placa: 'ABC-1234',
      modelo: 'CB600F',
      cor: 'Azul',
      marca: 'Honda',
      renavam: '123456',
      anoModelo: { fabricacao: 2020, modelo: 2021 },
      quilometragem: '50000',
      dataCompra: '2023-01-01',
      local: 'SP',
      nome: 'Moto 1'
    };

    it('deve criar veículo com sucesso', async () => {
      mockGet
        .mockResolvedValueOnce({ empty: true }) // chassi único
        .mockResolvedValueOnce({ empty: true }); // placa única
      mockSet.mockResolvedValue();

      const resultado = await criarVeiculo(veiculoValido);

      expect(resultado).toEqual({ success: true, id: 'test-uuid' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        chassi: 'ABC123',
        placa: 'ABC1234', // sem hífen
        quilometragem: 50000 // convertido para número
      }));
    });

    it('deve retornar erro quando chassi já existe', async () => {
      mockGet.mockResolvedValueOnce({ empty: false }); // chassi já existe

      const resultado = await criarVeiculo(veiculoValido);

      expect(resultado).toEqual({
        success: false,
        error: 'Chassi já cadastrado no sistema.'
      });
    });

    it('deve retornar erro quando placa já existe', async () => {
      mockGet
        .mockResolvedValueOnce({ empty: true })  // chassi único
        .mockResolvedValueOnce({ empty: false }); // placa já existe

      const resultado = await criarVeiculo(veiculoValido);

      expect(resultado).toEqual({
        success: false,
        error: 'Placa já cadastrada no sistema.'
      });
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar veículo quando encontrado', async () => {
      const mockVeiculo = { id: 'v1', marca: 'Honda' };
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockVeiculo }]
      });

      const resultado = await buscarPorId('v1');

      expect(resultado).toEqual(mockVeiculo);
    });

    it('deve retornar null quando não encontrado', async () => {
      mockGet.mockResolvedValue({ empty: true });

      const resultado = await buscarPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('buscaVeiculo', () => {
    it('deve buscar veículo com sucesso', async () => {
      const mockVeiculo = { id: 'v1', marca: 'Honda', placa: 'ABC1234' };
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({ data: () => mockVeiculo })
      };
      
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ ref: mockDocRef }]
      });

      const resultado = await buscaVeiculo('v1');

      expect(resultado).toEqual({ success: true, veiculo: mockVeiculo });
    });

    it('deve retornar erro quando veículo não encontrado', async () => {
      mockGet.mockResolvedValue({ empty: true });

      const resultado = await buscaVeiculo('inexistente');

      expect(resultado).toEqual({
        success: false,
        error: 'Veículo não encontrado.'
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      const resultado = await buscaVeiculo('v1');

      expect(resultado).toEqual({
        success: false,
        error: 'Firestore error'
      });
    });
  });

  describe('atualizarVeiculo', () => {
    it('deve atualizar veículo com sucesso', async () => {
      const mockDocRef = {
        update: jest.fn().mockResolvedValue()
      };
      
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ ref: mockDocRef }]
      });

      const updates = {
        marca: 'Yamaha',
        quilometragem: '60000',
        placa: 'DEF-5678'
      };

      const resultado = await atualizarVeiculo('v1', updates);

      expect(resultado).toEqual({ success: true });
      expect(mockDocRef.update).toHaveBeenCalledWith(expect.objectContaining({
        marca: 'Yamaha',
        quilometragem: 60000,
        placa: 'DEF5678',
        dataAtualizacao: expect.any(String)
      }));
    });

    it('deve retornar erro quando ID ausente', async () => {
      const resultado = await atualizarVeiculo('', { marca: 'Honda' });

      expect(resultado).toEqual({
        success: false,
        error: 'ID do veículo ou dados de atualização ausentes.'
      });
    });

    it('deve retornar erro quando updates vazio', async () => {
      const resultado = await atualizarVeiculo('v1', {});

      expect(resultado).toEqual({
        success: false,
        error: 'ID do veículo ou dados de atualização ausentes.'
      });
    });

    it('deve retornar erro quando veículo não encontrado', async () => {
      mockGet.mockResolvedValue({ empty: true });

      const resultado = await atualizarVeiculo('inexistente', { marca: 'Honda' });

      expect(resultado).toEqual({
        success: false,
        error: 'Veículo não encontrado.'
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      const resultado = await atualizarVeiculo('v1', { marca: 'Honda' });

      expect(resultado).toEqual({
        success: false,
        error: 'Firestore error'
      });
    });
  });


  describe('listarQuilometragemVeiculo', () => {
    it('deve retornar quilometragem do veículo', async () => {
      const mockVeiculo = { quilometragem: 50000 };
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockVeiculo }]
      });

      const resultado = await listarQuilometragemVeiculo('ABC123');

      expect(resultado).toBe(50000);
    });

    it('deve retornar null quando veículo não encontrado', async () => {
      mockGet.mockResolvedValue({ empty: true });

      const resultado = await listarQuilometragemVeiculo('inexistente');

      expect(resultado).toBeNull();
    });

    it('deve lançar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      await expect(listarQuilometragemVeiculo('ABC123')).rejects.toThrow('Firestore error');
    });
  });

  describe('atualizarQuilometragemVeiculo', () => {
    const mockDocRef = {
      update: jest.fn().mockResolvedValue()
    };

    it('deve atualizar quilometragem com sucesso', async () => {
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ id: 'doc1' }]
      });
      
      mockDoc.mockReturnValue(mockDocRef);

      const resultado = await atualizarQuilometragemVeiculo('ABC123', 60000);

      expect(resultado).toEqual({ success: true });
      expect(mockDocRef.update).toHaveBeenCalledWith({ quilometragem: 60000 });
    });

    it('deve retornar erro quando veículo não encontrado', async () => {
      mockGet.mockResolvedValue({ empty: true });

      const resultado = await atualizarQuilometragemVeiculo('inexistente', 50000);

      expect(resultado).toEqual({
        success: false,
        error: 'Veículo não encontrado.'
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      const resultado = await atualizarQuilometragemVeiculo('ABC123', 50000);

      expect(resultado).toEqual({
        success: false,
        error: 'Firestore error'
      });
    });
  });
});