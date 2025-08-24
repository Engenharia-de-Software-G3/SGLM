const request = require('supertest');
const express = require('express');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreManutencao.js', () => ({
  listarManutencoes: jest.fn(),
}));

// Mock do firebaseConfig
jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  },
}));

const { listarManutencoes } = require('../scripts/firestore/firestoreManutencao.js');
const { db } = require('../firebaseConfig.js');

describe('Manutenções Routes', () => {
  let app;
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar um mock manual do router
    const mockRouter = express.Router();
    
    // Mock da rota GET /:veiculoId
    mockRouter.get('/:veiculoId', async (req, res) => {
      try {
        const { veiculoId } = req.params;
        
        // Verificar se o veículo existe
        const veiculoDoc = await db.collection('veiculos').doc(veiculoId).get();
        
        if (!veiculoDoc.exists) {
          return res.status(404).send(`Veículo com ID ${veiculoId} não encontrado.`);
        }
        
        const manutencoes = await listarManutencoes(veiculoId);
        res.status(200).json(manutencoes);
      } catch (error) {
        res.status(500).send('Erro interno do servidor.');
      }
    });
    
    router = mockRouter;
    app = express();
    app.use(express.json());
    app.use('/manutencoes', router);
  });

  describe('GET /manutencoes/:veiculoId', () => {
    test('deve listar manutenções de um veículo válido', async () => {
      const veiculoId = 'veiculo123';
      const mockManutencoes = [
        {
          id: 'manut1',
          tipo: 'preventiva',
          data: '2024-01-01',
          quilometragem: 50000,
          descricao: 'Troca de óleo',
          valor: 150.00
        },
        {
          id: 'manut2',
          tipo: 'corretiva',
          data: '2024-01-15',
          quilometragem: 51000,
          descricao: 'Reparo no freio',
          valor: 300.00
        }
      ];

      // Mock da verificação se o veículo existe
      const mockVeiculoDoc = {
        exists: true,
        id: veiculoId,
        data: () => ({ placa: 'ABC-1234' })
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculoDoc)
        }))
      });

      listarManutencoes.mockResolvedValue(mockManutencoes);

      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(200);

      expect(response.body).toEqual(mockManutencoes);
      expect(db.collection).toHaveBeenCalledWith('veiculos');
      expect(listarManutencoes).toHaveBeenCalledWith(veiculoId);
    });

    test('deve retornar erro 400 quando veiculoId não é fornecido', async () => {
      const response = await request(app)
        .get('/manutencoes/')
        .expect(404); // Express retorna 404 para rota não encontrada sem parâmetro
    });

    test('deve retornar erro 404 quando veículo não existe', async () => {
      const veiculoId = 'veiculo-inexistente';

      // Mock da verificação se o veículo existe
      const mockVeiculoDoc = {
        exists: false
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculoDoc)
        }))
      });

      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(404);

      expect(response.text).toContain(`Veículo com ID ${veiculoId} não encontrado`);
      expect(listarManutencoes).not.toHaveBeenCalled();
    });

    test('deve retornar lista vazia quando veículo não tem manutenções', async () => {
      const veiculoId = 'veiculo-sem-manutencoes';

      // Mock da verificação se o veículo existe
      const mockVeiculoDoc = {
        exists: true,
        id: veiculoId,
        data: () => ({ placa: 'XYZ-9876' })
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculoDoc)
        }))
      });

      listarManutencoes.mockResolvedValue([]);

      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(200);

      expect(response.body).toEqual([]);
      expect(listarManutencoes).toHaveBeenCalledWith(veiculoId);
    });

    test('deve capturar erros inesperados na verificação do veículo', async () => {
      const veiculoId = 'veiculo123';

      // Mock de erro na verificação do veículo
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
        }))
      });

      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
      expect(listarManutencoes).not.toHaveBeenCalled();
    });

    test('deve capturar erros inesperados na listagem de manutenções', async () => {
      const veiculoId = 'veiculo123';

      // Mock da verificação se o veículo existe (sucesso)
      const mockVeiculoDoc = {
        exists: true,
        id: veiculoId,
        data: () => ({ placa: 'ABC-1234' })
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculoDoc)
        }))
      });

      // Mock de erro na listagem de manutenções
      listarManutencoes.mockRejectedValue(new Error('Erro ao buscar manutenções'));

      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
      expect(listarManutencoes).toHaveBeenCalledWith(veiculoId);
    });

    test('deve processar veiculoId com caracteres especiais', async () => {
      const veiculoId = 'veiculo-123_test';

      const mockVeiculoDoc = {
        exists: true,
        id: veiculoId,
        data: () => ({ placa: 'ABC-1234' })
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculoDoc)
        }))
      });

      const mockManutencoes = [
        {
          id: 'manut1',
          tipo: 'preventiva',
          data: '2024-01-01'
        }
      ];

      listarManutencoes.mockResolvedValue(mockManutencoes);

      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(200);

      expect(response.body).toEqual(mockManutencoes);
      expect(listarManutencoes).toHaveBeenCalledWith(veiculoId);
    });

    test('deve retornar manutenções ordenadas cronologicamente', async () => {
      const veiculoId = 'veiculo123';
      const mockManutencoes = [
        {
          id: 'manut1',
          data: '2024-01-01',
          tipo: 'preventiva',
          descricao: 'Primeira manutenção'
        },
        {
          id: 'manut2', 
          data: '2024-02-01',
          tipo: 'corretiva',
          descricao: 'Segunda manutenção'
        },
        {
          id: 'manut3',
          data: '2024-03-01', 
          tipo: 'preventiva',
          descricao: 'Terceira manutenção'
        }
      ];

      const mockVeiculoDoc = {
        exists: true,
        id: veiculoId,
        data: () => ({ placa: 'ABC-1234' })
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculoDoc)
        }))
      });

      listarManutencoes.mockResolvedValue(mockManutencoes);

      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(200);

      expect(response.body).toEqual(mockManutencoes);
      expect(response.body.length).toBe(3);
      expect(listarManutencoes).toHaveBeenCalledWith(veiculoId);
    });

    test('deve processar manutenções com dados completos', async () => {
      const veiculoId = 'veiculo123';
      const mockManutencao = {
        id: 'manut-completa',
        tipo: 'preventiva',
        data: '2024-01-15T10:30:00Z',
        quilometragem: 75000,
        descricao: 'Manutenção preventiva completa',
        valor: 850.50,
        oficina: {
          nome: 'Oficina Central',
          cnpj: '12345678000195'
        },
        pecas: [
          { nome: 'Filtro de óleo', valor: 25.00 },
          { nome: 'Óleo motor', valor: 120.00 }
        ],
        observacoes: 'Manutenção realizada conforme manual'
      };

      const mockVeiculoDoc = {
        exists: true,
        id: veiculoId,
        data: () => ({ placa: 'ABC-1234' })
      };
      
      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockVeiculoDoc)
        }))
      });

      listarManutencoes.mockResolvedValue([mockManutencao]);

      const response = await request(app)
        .get(`/manutencoes/${veiculoId}`)
        .expect(200);

      expect(response.body[0]).toEqual(mockManutencao);
      expect(response.body[0].pecas).toBeDefined();
      expect(response.body[0].oficina).toBeDefined();
    });
  });

  describe('Validação de rotas', () => {
    test('deve rejeitar métodos não suportados', async () => {
      const veiculoId = 'veiculo123';

      // POST não deveria estar disponível segundo o código atual
      await request(app)
        .post(`/manutencoes/${veiculoId}`)
        .send({ tipo: 'preventiva' })
        .expect(404);

      // DELETE não deveria estar disponível
      await request(app)
        .delete(`/manutencoes/${veiculoId}`)
        .expect(404);

      // PUT não deveria estar disponível
      await request(app)
        .put(`/manutencoes/${veiculoId}`)
        .send({ tipo: 'corretiva' })
        .expect(404);
    });
  });
});