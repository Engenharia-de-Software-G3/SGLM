const { criarContratoJuridico, buscarContratoPorId } = require('../scripts/firestore/firestoreContratos.js');

// Mock das dependências
jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
      })),
    })),
  },
}));

jest.mock('../scripts/firestore/firestoreClientes.js', () => ({
  buscarClientePorCPF: jest.fn(),
}));

jest.mock('../scripts/firestore/firestoreVeiculos.js', () => ({
  buscarPorId: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

const { db } = require('../firebaseConfig.js');
const { buscarClientePorCPF } = require('../scripts/firestore/firestoreClientes.js');
const { buscarPorId } = require('../scripts/firestore/firestoreVeiculos.js');

describe('firestoreContratos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarContratoJuridico', () => {
    const mockCliente = {
      id: 'cliente123',
      nomeCompleto: 'João Silva',
      cpf: '12345678901',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999'
    };

    const mockVeiculo = {
      id: 'veiculo123',
      placa: 'ABC-1234',
      chassi: 'chassi123',
      marca: 'Honda',
      modelo: 'CB600F'
    };

    const dadosContrato = {
      cpfCliente: '12345678901',
      idVeiculo: 'veiculo123',
      termosContrato: {
        valor: 1000,
        prazo: 12,
        observacoes: 'Contrato de locação'
      }
    };

    test('deve criar contrato com sucesso', async () => {
      // Setup mocks
      buscarClientePorCPF.mockResolvedValue({
        success: true,
        cliente: mockCliente
      });
      buscarPorId.mockResolvedValue(mockVeiculo);
      
      const mockSet = jest.fn().mockResolvedValue();
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          set: mockSet
        }))
      });

      // Execute
      const resultado = await criarContratoJuridico(dadosContrato);

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.id).toBe('mock-uuid-123');
      expect(buscarClientePorCPF).toHaveBeenCalledWith('12345678901');
      expect(buscarPorId).toHaveBeenCalledWith('veiculo123');
      expect(mockSet).toHaveBeenCalled();
    });

    test('deve retornar erro quando cliente não é encontrado', async () => {
      // Setup mocks
      buscarClientePorCPF.mockResolvedValue({
        success: false,
        error: 'Cliente não encontrado'
      });

      // Execute
      const resultado = await criarContratoJuridico(dadosContrato);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Cliente não encontrado');
      expect(buscarPorId).not.toHaveBeenCalled();
    });

    test('deve retornar erro quando veículo não é encontrado', async () => {
      // Setup mocks
      buscarClientePorCPF.mockResolvedValue({
        success: true,
        cliente: mockCliente
      });
      buscarPorId.mockResolvedValue(null);

      // Execute
      const resultado = await criarContratoJuridico(dadosContrato);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Veículo não encontrado.');
      expect(buscarPorId).toHaveBeenCalledWith('veiculo123');
    });

    test('deve retornar erro quando falha ao salvar no Firestore', async () => {
      // Setup mocks
      buscarClientePorCPF.mockResolvedValue({
        success: true,
        cliente: mockCliente
      });
      buscarPorId.mockResolvedValue(mockVeiculo);
      
      const mockSet = jest.fn().mockRejectedValue(new Error('Erro no Firestore'));
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          set: mockSet
        }))
      });

      // Execute
      const resultado = await criarContratoJuridico(dadosContrato);

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain('Erro no Firestore');
    });
  });

  describe('buscarContratoPorId', () => {
    test('deve buscar contrato por ID com sucesso', async () => {
      const mockContrato = {
        id: 'contrato123',
        cliente: { nome: 'João Silva' },
        veiculo: { placa: 'ABC-1234' }
      };

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockContrato
      });

      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: mockGet
        }))
      });

      // Execute
      const resultado = await buscarContratoPorId('contrato123');

      // Assert
      expect(resultado.success).toBe(true);
      expect(resultado.contrato).toEqual(mockContrato);
      expect(db.collection).toHaveBeenCalledWith('contratos');
    });

    test('deve retornar erro quando contrato não existe', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        exists: false
      });

      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: mockGet
        }))
      });

      // Execute
      const resultado = await buscarContratoPorId('contrato-inexistente');

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Contrato não encontrado.');
    });

    test('deve retornar erro quando falha ao acessar o Firestore', async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error('Erro no Firestore'));

      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: mockGet
        }))
      });

      // Execute
      const resultado = await buscarContratoPorId('contrato123');

      // Assert
      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain('Erro no Firestore');
    });
  });
});