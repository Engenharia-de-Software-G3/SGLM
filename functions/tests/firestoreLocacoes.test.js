const { 
  criarLocacao, 
  buscaLocacao, 
  listarLocacoes, 
  atualizarLocacao, 
  excluirLocacao 
} = require('../scripts/firestore/firestoreLocacoes.js');

// Mock simples do Firebase
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockDoc = jest.fn(() => ({ 
  get: mockGet, 
  set: mockSet,
  exists: true,
  data: () => ({ id: '123' })
}));
const mockWhere = jest.fn(() => ({ limit: jest.fn(() => ({ get: mockGet })), get: mockGet }));

// Mock para subcoleção de veículo
const mockVeiculoDoc = {
  data: () => ({ status: 'disponivel' }),
  ref: { update: mockUpdate }
};

jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: mockDoc,
      where: mockWhere
    }))
  }
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('firestoreLocacoes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarLocacao', () => {
    const locacaoValida = {
      cpfLocatario: '123.456.789-01',
      placaVeiculo: 'ABC-1234',
      dataInicio: '25/12/2023',
      dataFim: '31/12/2023',
      valor: 500,
      periocidadePagamento: 'mensal',
      metodoPagamento: 'cartao'
    };

    it('deve criar locação com sucesso', async () => {
      // Mock cliente existe
      mockGet.mockResolvedValueOnce({ exists: true });
      // Mock veículo disponível
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [mockVeiculoDoc]
      });
      mockSet.mockResolvedValue();
      mockUpdate.mockResolvedValue();

      const resultado = await criarLocacao(locacaoValida);

      expect(resultado).toEqual({ success: true, id: 'test-uuid' });
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'alugado'
      }));
    });

    it('deve retornar erro quando cliente não existe', async () => {
      mockGet.mockResolvedValueOnce({ exists: false });

      const resultado = await criarLocacao(locacaoValida);

      expect(resultado).toEqual({
        success: false,
        error: 'Cliente não encontrado'
      });
    });

    it('deve retornar erro quando veículo não disponível', async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [{ 
          data: () => ({ status: 'alugado' }),
          ref: { update: mockUpdate }
        }]
      });

      const resultado = await criarLocacao(locacaoValida);

      expect(resultado).toEqual({
        success: false,
        error: 'Veículo não está disponível para locação'
      });
    });

    it('deve retornar erro quando veículo não encontrado', async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockGet.mockResolvedValueOnce({ empty: true }); // veículo não encontrado

      const resultado = await criarLocacao(locacaoValida);

      expect(resultado).toEqual({
        success: false,
        error: 'Veículo não encontrado'
      });
    });
  });

  describe('buscaLocacao', () => {
    it('deve buscar locação com sucesso', async () => {
      const mockLocacao = { id: 'loc1', clienteId: '123' };
      const mockSnapshot = {
        empty: false,
        docs: [{ 
          ref: { get: jest.fn().mockResolvedValue({ data: () => mockLocacao }) }
        }]
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await buscaLocacao('loc1');

      expect(resultado).toEqual({ success: true, locacao: mockLocacao });
    });

    it('deve retornar erro quando não encontrada', async () => {
      mockGet.mockResolvedValue({ empty: true });

      const resultado = await buscaLocacao('inexistente');

      expect(resultado).toEqual({
        success: false,
        error: 'Locação não encontrada'
      });
    });
  });

  describe('listarLocacoes', () => {
    it('deve listar locações com paginação', async () => {
      const mockLocacoes = [
        { id: '1', clienteId: '123', dataInicio: '2023-12-01T00:00:00Z', dataFim: '2023-12-31T00:00:00Z' },
        { id: '2', clienteId: '456', dataInicio: '2023-11-01T00:00:00Z', dataFim: '2023-11-30T00:00:00Z' }
      ];

      const mockSnapshot = {
        docs: mockLocacoes.map(l => ({
          id: l.id,
          data: () => l
        }))
      };

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue(mockCollection);

      const resultado = await listarLocacoes({ limite: 10 });

      expect(resultado).toHaveProperty('locacoes');
      expect(resultado).toHaveProperty('ultimoDoc');
      expect(Array.isArray(resultado.locacoes)).toBe(true);
      expect(resultado.locacoes).toHaveLength(2);
    });

    it('deve usar ultimoDoc para paginação', async () => {
      const mockSnapshot = { docs: [] };
      const mockLastDoc = { id: 'ultimo' };

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        startAfter: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery),
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockLastDoc)
        }))
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue(mockCollection);

      const resultado = await listarLocacoes({ limite: 10, ultimoDoc: 'ultimo' });

      expect(mockQuery.startAfter).toHaveBeenCalledWith(mockLastDoc);
    });

    it('deve lançar erro quando Firestore falha', async () => {
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
      };

      const mockCollection = {
        orderBy: jest.fn(() => mockQuery)
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue(mockCollection);

      await expect(listarLocacoes({ limite: 10 }))
        .rejects.toThrow('Erro no Firestore');
    });
  });

  describe('atualizarLocacao', () => {
    it('deve atualizar locação com sucesso', async () => {
      const mockLocacaoRef = {
        get: jest.fn().mockResolvedValue({ exists: true }),
        update: jest.fn().mockResolvedValue()
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue({
        doc: jest.fn(() => mockLocacaoRef)
      });

      const updateData = {
        valor: 600,
        dataInicio: '01/01/2024',
        dataFim: '31/01/2024'
      };

      const resultado = await atualizarLocacao('loc1', updateData);

      expect(resultado).toEqual({ success: true });
      expect(mockLocacaoRef.update).toHaveBeenCalledWith(expect.objectContaining({
        valor: 600,
        dataAtualizacao: expect.any(String)
      }));
    });

    it('deve retornar erro quando locação não encontrada', async () => {
      const mockLocacaoRef = {
        get: jest.fn().mockResolvedValue({ exists: false })
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue({
        doc: jest.fn(() => mockLocacaoRef)
      });

      const resultado = await atualizarLocacao('inexistente', { valor: 600 });

      expect(resultado).toEqual({
        success: false,
        error: 'Locação não encontrada'
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const mockLocacaoRef = {
        get: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue({
        doc: jest.fn(() => mockLocacaoRef)
      });

      const resultado = await atualizarLocacao('loc1', { valor: 600 });

      expect(resultado).toEqual({
        success: false,
        error: 'Erro no Firestore'
      });
    });
  });

  describe('excluirLocacao', () => {
    it('deve finalizar locação ativa com sucesso', async () => {
      const mockLocacaoRef = {
        get: jest.fn().mockResolvedValue({ 
          exists: true,
          data: () => ({ status: 'ativa', veiculoId: 'veiculo123' })
        }),
        update: jest.fn().mockResolvedValue()
      };

      const mockVeiculoRef = {
        update: jest.fn().mockResolvedValue()
      };

      require('../firebaseConfig.js').db.collection.mockImplementation((collection) => {
        if (collection === 'locacoes') {
          return { doc: jest.fn(() => mockLocacaoRef) };
        } else if (collection === 'veiculos') {
          return { doc: jest.fn(() => mockVeiculoRef) };
        }
      });

      const resultado = await excluirLocacao('loc1');

      expect(resultado).toEqual({ success: true });
      expect(mockLocacaoRef.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'finalizada',
        dataFinalizacao: expect.any(String),
        dataAtualizacao: expect.any(String)
      }));
      expect(mockVeiculoRef.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'disponivel',
        dataAtualizacao: expect.any(String)
      }));
    });

    it('deve finalizar locação não ativa sem atualizar veículo', async () => {
      const mockLocacaoRef = {
        get: jest.fn().mockResolvedValue({ 
          exists: true,
          data: () => ({ status: 'finalizada', veiculoId: 'veiculo123' })
        }),
        update: jest.fn().mockResolvedValue()
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue({
        doc: jest.fn(() => mockLocacaoRef)
      });

      const resultado = await excluirLocacao('loc1');

      expect(resultado).toEqual({ success: true });
      expect(mockLocacaoRef.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'finalizada'
      }));
    });

    it('deve retornar erro quando locação não encontrada', async () => {
      const mockLocacaoRef = {
        get: jest.fn().mockResolvedValue({ exists: false })
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue({
        doc: jest.fn(() => mockLocacaoRef)
      });

      const resultado = await excluirLocacao('inexistente');

      expect(resultado).toEqual({
        success: false,
        error: 'Locação não encontrada'
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const mockLocacaoRef = {
        get: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
      };

      require('../firebaseConfig.js').db.collection.mockReturnValue({
        doc: jest.fn(() => mockLocacaoRef)
      });

      const resultado = await excluirLocacao('loc1');

      expect(resultado).toEqual({
        success: false,
        error: 'Erro no Firestore'
      });
    });
  });
});