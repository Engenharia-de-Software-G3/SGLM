// Mock do uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123')
}));

// Mock do firebaseConfig
const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    where: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(),
      })),
      get: jest.fn(),
    })),
    get: jest.fn(),
    limit: jest.fn(() => ({
      get: jest.fn(),
    })),
    startAfter: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  })),
};

jest.mock('../../firebaseConfig.js', () => ({
  db: mockDb,
}));

const {
  criarVeiculo,
  atualizarPlaca,
  registrarVenda,
  atualizarQuilometragemVeiculo,
  buscarPorChassi,
  listarVeiculos,
} = require('../../scripts/firestore/firestoreVeiculos.js');

describe('FirestoreVeiculos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarVeiculo', () => {
    test('deve criar veículo com dados básicos', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic',
        marca: 'Honda',
        renavam: '123456789',
        numeroDocumento: 'DOC123456',
        anoFabricacao: '2020',
        anoModelo: '2021',
        quilometragem: '15000',
        quilometragemNaCompra: '0',
        dataCompra: '2023-01-15',
        local: 'Sede Principal',
        nome: 'Civic Principal',
        observacoes: 'Veículo em perfeito estado'
      };

      // Mock para verificar se chassi já existe (retorna vazio = não existe)
      const mockSnapshot = { empty: true };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      // Mock para criação do documento
      mockDb.collection().doc().set.mockResolvedValue();

      const result = await criarVeiculo(veiculoData);

      expect(result.success).toBe(true);
      expect(result.id).toBe('mock-uuid-123');
      expect(mockDb.collection).toHaveBeenCalledWith('veiculos');
      expect(mockDb.collection().where).toHaveBeenCalledWith('chassi', '==', '1HGBH41JXMN109186');
      expect(mockDb.collection().doc).toHaveBeenCalledWith('mock-uuid-123');
      expect(mockDb.collection().doc().set).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-uuid-123',
          chassi: '1HGBH41JXMN109186',
          placa: 'ABC1234', // Sem hífen
          modelo: 'Honda Civic',
          marca: 'Honda',
          quilometragem: 15000,
          status: 'disponivel'
        })
      );
    });

    test('deve retornar erro quando chassi já existe', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic'
      };

      // Mock para verificar se chassi já existe (retorna com dados = já existe)
      const mockSnapshot = { empty: false };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await criarVeiculo(veiculoData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Chassi já cadastrado no sistema.');
      expect(mockDb.collection().doc().set).not.toHaveBeenCalled();
    });

    test('deve processar dados opcionais corretamente', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic',
        marca: 'Honda',
        renavam: '123456789',
        numeroDocumento: 'DOC123456',
        anoFabricacao: '2020',
        anoModelo: '2021',
        quilometragem: '25000',
        quilometragemNaCompra: '5000',
        dataCompra: '2023-01-15',
        dataVenda: '2024-01-15',
        local: 'Filial Norte',
        nome: 'Civic Norte',
        observacoes: 'Veículo vendido'
      };

      const mockSnapshot = { empty: true };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);
      mockDb.collection().doc().set.mockResolvedValue();

      const result = await criarVeiculo(veiculoData);

      expect(result.success).toBe(true);
      expect(mockDb.collection().doc().set).toHaveBeenCalledWith(
        expect.objectContaining({
          anoModelo: {
            fabricacao: 2020,
            modelo: 2021
          },
          quilometragem: 25000,
          quilometragemNaCompra: 5000,
          dataVenda: expect.stringContaining('2024-01-15')
        })
      );
    });

    test('deve capturar erros de Firestore', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic'
      };

      mockDb.collection().where().limit().get.mockRejectedValue(new Error('Erro do Firestore'));

      const result = await criarVeiculo(veiculoData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro do Firestore');
    });
  });

  describe('atualizarPlaca', () => {
    test('deve atualizar placa de veículo existente', async () => {
      const chassi = '1HGBH41JXMN109186';
      const novaPlaca = 'XYZ-9876';

      const mockSnapshot = {
        empty: false,
        docs: [{
          ref: {
            update: jest.fn().mockResolvedValue()
          }
        }]
      };

      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await atualizarPlaca(chassi, novaPlaca);

      expect(result.success).toBe(true);
      expect(mockDb.collection().where).toHaveBeenCalledWith('chassi', '==', chassi);
      expect(mockSnapshot.docs[0].ref.update).toHaveBeenCalledWith({
        placa: 'XYZ9876', // Sem hífen
        dataAtualizacao: expect.any(String)
      });
    });

    test('deve retornar erro quando veículo não é encontrado', async () => {
      const chassi = '1HGBH41JXMN109186';
      const novaPlaca = 'XYZ-9876';

      const mockSnapshot = { empty: true };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await atualizarPlaca(chassi, novaPlaca);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Veículo não encontrado.');
    });

    test('deve capturar erros de Firestore', async () => {
      const chassi = '1HGBH41JXMN109186';
      const novaPlaca = 'XYZ-9876';

      mockDb.collection().where().limit().get.mockRejectedValue(new Error('Erro do Firestore'));

      const result = await atualizarPlaca(chassi, novaPlaca);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro do Firestore');
    });
  });

  describe('registrarVenda', () => {
    test('deve registrar venda de veículo', async () => {
      const chassi = '1HGBH41JXMN109186';
      const dataVenda = '2024-01-15';

      const mockSnapshot = {
        empty: false,
        docs: [{
          ref: {
            update: jest.fn().mockResolvedValue()
          }
        }]
      };

      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await registrarVenda(chassi, dataVenda);

      expect(result.success).toBe(true);
      expect(mockSnapshot.docs[0].ref.update).toHaveBeenCalledWith({
        status: 'vendido',
        dataVenda: expect.stringContaining('2024-01-15'),
        dataAtualizacao: expect.any(String)
      });
    });

    test('deve retornar erro quando veículo não é encontrado', async () => {
      const chassi = '1HGBH41JXMN109186';
      const dataVenda = '2024-01-15';

      const mockSnapshot = { empty: true };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await registrarVenda(chassi, dataVenda);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Veículo não encontrado.');
    });
  });

  describe('atualizarQuilometragemVeiculo', () => {
    test('deve atualizar quilometragem de veículo', async () => {
      const chassi = '1HGBH41JXMN109186';
      const novaQuilometragem = 75000;

      const mockSnapshot = {
        empty: false,
        docs: [{
          ref: {
            update: jest.fn().mockResolvedValue()
          }
        }]
      };

      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await atualizarQuilometragemVeiculo(chassi, novaQuilometragem);

      expect(result.success).toBe(true);
      expect(mockSnapshot.docs[0].ref.update).toHaveBeenCalledWith({
        quilometragem: 75000,
        dataAtualizacao: expect.any(String)
      });
    });

    test('deve retornar erro quando veículo não é encontrado', async () => {
      const chassi = '1HGBH41JXMN109186';
      const novaQuilometragem = 75000;

      const mockSnapshot = { empty: true };
      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await atualizarQuilometragemVeiculo(chassi, novaQuilometragem);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Veículo não encontrado.');
    });
  });

  describe('buscarPorChassi', () => {
    test('deve buscar veículo por chassi', async () => {
      const chassi = '1HGBH41JXMN109186';
      const mockVeiculoData = {
        id: 'veiculo123',
        chassi: chassi,
        placa: 'ABC1234',
        modelo: 'Honda Civic',
        status: 'disponivel'
      };

      const mockSnapshot = {
        empty: false,
        docs: [{
          id: 'veiculo123',
          data: () => mockVeiculoData
        }]
      };

      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await buscarPorChassi(chassi);

      expect(result).toEqual({
        id: 'veiculo123',
        ...mockVeiculoData
      });
      expect(mockDb.collection().where).toHaveBeenCalledWith('chassi', '==', chassi);
    });

    test('deve retornar null quando veículo não é encontrado', async () => {
      const chassi = '1HGBH41JXMN109186';
      const mockSnapshot = { empty: true };

      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      const result = await buscarPorChassi(chassi);

      expect(result).toBeNull();
    });

    test('deve capturar erros de Firestore', async () => {
      const chassi = '1HGBH41JXMN109186';

      mockDb.collection().where().limit().get.mockRejectedValue(new Error('Erro do Firestore'));

      // Espera que a função lance o erro para ser capturado pelo código chamador
      await expect(buscarPorChassi(chassi)).rejects.toThrow('Erro do Firestore');
    });
  });

  describe('listarVeiculos', () => {
    test('deve listar veículos sem filtros', async () => {
      const mockVeiculos = [
        {
          id: 'veiculo1',
          chassi: '1HGBH41JXMN109186',
          placa: 'ABC1234',
          modelo: 'Honda Civic'
        },
        {
          id: 'veiculo2',
          chassi: '9BWZZZ377VT004251',
          placa: 'XYZ9876',
          modelo: 'Toyota Corolla'
        }
      ];

      const mockSnapshot = {
        docs: mockVeiculos.map(veiculo => ({
          id: veiculo.id,
          data: () => veiculo
        })),
        size: 2
      };

      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        }))
      };

      mockDb.collection.mockReturnValue(mockQuery);

      const result = await listarVeiculos({ limite: 10 });

      expect(result.veiculos).toHaveLength(2);
      expect(result.veiculos[0].modelo).toBe('Honda Civic');
      expect(result.veiculos[1].modelo).toBe('Toyota Corolla');
    });

    test('deve aplicar filtros de busca', async () => {
      const filtros = { placa: 'ABC', status: 'disponivel' };
      const mockSnapshot = {
        docs: [{
          id: 'veiculo1',
          data: () => ({
            id: 'veiculo1',
            placa: 'ABC1234',
            status: 'disponivel'
          })
        }],
        size: 1
      };

      const mockQuery = {
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: jest.fn().mockResolvedValue(mockSnapshot)
            }))
          }))
        }))
      };

      mockDb.collection.mockReturnValue(mockQuery);

      const result = await listarVeiculos({ limite: 10, filtros });

      expect(result.veiculos).toHaveLength(1);
      expect(mockQuery.where).toHaveBeenCalled();
    });

    test('deve implementar paginação', async () => {
      const mockUltimoDoc = { id: 'ultimo-doc' };
      const mockSnapshot = {
        docs: [{
          id: 'veiculo2',
          data: () => ({ modelo: 'Toyota Corolla' })
        }],
        size: 1
      };

      const mockQuery = {
        startAfter: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn().mockResolvedValue(mockSnapshot)
          }))
        }))
      };

      mockDb.collection.mockReturnValue(mockQuery);

      const result = await listarVeiculos({ 
        limite: 5, 
        ultimoDoc: mockUltimoDoc 
      });

      expect(result.veiculos).toHaveLength(1);
      expect(mockQuery.startAfter).toHaveBeenCalledWith(mockUltimoDoc);
    });

    test('deve capturar erros de Firestore', async () => {
      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockRejectedValue(new Error('Erro do Firestore'))
        }))
      };

      mockDb.collection.mockReturnValue(mockQuery);

      await expect(listarVeiculos({ limite: 10 })).rejects.toThrow('Erro do Firestore');
    });

    test('deve retornar último documento para paginação', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'veiculo1',
            data: () => ({ modelo: 'Honda Civic' })
          }
        ],
        size: 1
      };

      // Simular que há mais documentos
      const mockQuery = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            ...mockSnapshot,
            docs: [...mockSnapshot.docs, { id: 'extra' }] // Simular documento extra
          })
        }))
      };

      mockDb.collection.mockReturnValue(mockQuery);

      const result = await listarVeiculos({ limite: 1 });

      expect(result.ultimoDoc).toBeDefined();
    });
  });
});