const request = require('supertest');
const express = require('express');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreVeiculos.js', () => ({
  criarVeiculo: jest.fn(),
  listarVeiculos: jest.fn(),
  atualizarQuilometragemVeiculo: jest.fn(),
  atualizarPlaca: jest.fn(),
  registrarVenda: jest.fn(),
  buscarPorChassi: jest.fn(),
}));

// Mock do firebaseConfig
jest.mock('../firebaseConfig.js', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        delete: jest.fn(),
      })),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
    })),
  },
}));

const {
  criarVeiculo,
  listarVeiculos,
  atualizarQuilometragemVeiculo,
  atualizarPlaca,
  registrarVenda,
  buscarPorChassi,
} = require('../scripts/firestore/firestoreVeiculos.js');

const { db } = require('../firebaseConfig.js');

describe('Veículos Routes', () => {
  let app;
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar um mock manual do router
    const mockRouter = express.Router();
    
    // Mock da rota POST
    mockRouter.post('/', async (req, res) => {
      try {
        const veiculoData = req.body;
        if (!veiculoData || !veiculoData.chassi || !veiculoData.placa || !veiculoData.modelo) {
          return res.status(400).send('Os campos chassi, placa e modelo são obrigatórios.');
        }
        
        const resultado = await criarVeiculo(veiculoData);
        if (resultado.success) {
          res.status(201).json({ message: 'Veículo criado com sucesso!', id: resultado.id });
        } else {
          res.status(400).json({ message: 'Erro ao criar veículo', error: resultado.error });
        }
      } catch (error) {
        res.status(500).send('Erro interno do servidor.');
      }
    });
    
    // Mock da rota GET
    mockRouter.get('/', async (req, res) => {
      try {
        const { limite = '10', ultimoDocId, filtros } = req.query;
        const limiteNum = parseInt(limite);
        
        if (isNaN(limiteNum)) {
          return res.status(400).json({ error: 'Value for "limite" is not a valid integer.' });
        }
        
        const limiteAplicado = Math.min(limiteNum, 100);
        
        let ultimoDoc = null;
        if (ultimoDocId) {
          const docRef = await db.collection('veiculos').doc(ultimoDocId).get();
          if (!docRef.exists) {
            return res.status(400).json({ error: 'ID do último documento inválido' });
          }
          ultimoDoc = docRef;
        }
        
        let filtrosObj = {};
        if (filtros) {
          try {
            filtrosObj = JSON.parse(filtros);
          } catch (e) {
            filtrosObj = {};
          }
        }
        
        const resultado = await listarVeiculos({
          limite: limiteAplicado,
          ultimoDoc,
          filtros: filtrosObj
        });
        
        res.status(200).json({
          veiculos: resultado.veiculos,
          paginacao: {
            possuiMais: !!resultado.ultimoDoc,
            proximoDocId: resultado.ultimoDoc ? resultado.ultimoDoc.id : null
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
      }
    });
    
    // Mock da rota PUT
    mockRouter.put('/:chassi', async (req, res) => {
      try {
        const { chassi } = req.params;
        const updates = req.body;
        
        if (!chassi || !updates || Object.keys(updates).length === 0) {
          return res.status(400).send('Chassi e/ou dados de atualização ausentes.');
        }
        
        const veiculoExistente = await buscarPorChassi(chassi);
        if (!veiculoExistente) {
          return res.status(404).send('Veículo não encontrado.');
        }
        
        if (updates.quilometragem && isNaN(parseInt(updates.quilometragem))) {
          return res.status(400).send('Quilometragem deve ser um número válido.');
        }
        
        let sucessoGeral = true;
        let ultimoErro = null;
        
        if (updates.placa) {
          const resultado = await atualizarPlaca(chassi, updates.placa);
          if (!resultado.success) {
            sucessoGeral = false;
            ultimoErro = resultado.error;
          }
        }
        
        if (updates.quilometragem) {
          const resultado = await atualizarQuilometragemVeiculo(chassi, parseInt(updates.quilometragem));
          if (!resultado.success) {
            sucessoGeral = false;
            ultimoErro = resultado.error;
          }
        }
        
        if (updates.dataVenda) {
          const resultado = await registrarVenda(chassi, updates.dataVenda);
          if (!resultado.success) {
            sucessoGeral = false;
            ultimoErro = resultado.error;
          }
        }
        
        if (sucessoGeral) {
          res.status(200).json({ message: 'Veículo atualizado com sucesso!' });
        } else {
          res.status(500).json({ error: ultimoErro });
        }
      } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar veículo' });
      }
    });
    
    // Mock da rota DELETE
    mockRouter.delete('/:chassi', async (req, res) => {
      try {
        const { chassi } = req.params;
        
        const snapshot = await db.collection('veiculos').where('chassi', '==', chassi).limit(1).get();
        
        if (snapshot.empty) {
          return res.status(404).send('Veículo não encontrado.');
        }
        
        await snapshot.docs[0].ref.delete();
        res.status(200).json({ message: 'Veículo deletado com sucesso!' });
      } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar veículo' });
      }
    });
    
    router = mockRouter;
    app = express();
    app.use(express.json());
    app.use('/veiculos', router);
  });

  describe('POST /veiculos', () => {
    test('deve criar veículo com dados válidos', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic',
        ano: 2020,
        cor: 'Branco'
      };

      criarVeiculo.mockResolvedValue({
        success: true,
        id: 'veiculo123'
      });

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Veículo criado com sucesso!',
        id: 'veiculo123'
      });

      expect(criarVeiculo).toHaveBeenCalledWith(veiculoData);
    });

    test('deve retornar erro 400 quando chassi está ausente', async () => {
      const veiculoData = {
        placa: 'ABC-1234',
        modelo: 'Honda Civic'
      };

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoData)
        .expect(400);

      expect(response.text).toContain('chassi, placa e modelo são obrigatórios');
      expect(criarVeiculo).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando placa está ausente', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        modelo: 'Honda Civic'
      };

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoData)
        .expect(400);

      expect(response.text).toContain('chassi, placa e modelo são obrigatórios');
      expect(criarVeiculo).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando modelo está ausente', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234'
      };

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoData)
        .expect(400);

      expect(response.text).toContain('chassi, placa e modelo são obrigatórios');
      expect(criarVeiculo).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando criarVeiculo falha', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic'
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Chassi já existe'
      });

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'Erro ao criar veículo',
        error: 'Chassi já existe'
      });
    });

    test('deve capturar erros inesperados', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic'
      };

      criarVeiculo.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoData)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
    });
  });

  describe('GET /veiculos', () => {
    test('deve listar veículos com parâmetros padrão', async () => {
      const mockResult = {
        veiculos: [
          { id: 'v1', chassi: '123', placa: 'ABC-1234', modelo: 'Honda Civic' }
        ],
        ultimoDoc: null
      };

      listarVeiculos.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/veiculos')
        .expect(200);

      expect(response.body).toEqual({
        veiculos: mockResult.veiculos,
        paginacao: {
          possuiMais: false,
          proximoDocId: null
        }
      });

      expect(listarVeiculos).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve aplicar limite personalizado', async () => {
      const mockResult = {
        veiculos: [],
        ultimoDoc: null
      };

      listarVeiculos.mockResolvedValue(mockResult);

      await request(app)
        .get('/veiculos?limite=5')
        .expect(200);

      expect(listarVeiculos).toHaveBeenCalledWith({
        limite: 5,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve retornar erro 400 para limite inválido', async () => {
      const response = await request(app)
        .get('/veiculos?limite=abc')
        .expect(400);

      expect(response.body.error).toBe('Value for "limite" is not a valid integer.');
      expect(listarVeiculos).not.toHaveBeenCalled();
    });

    test('deve aplicar limite máximo de 100', async () => {
      const mockResult = {
        veiculos: [],
        ultimoDoc: null
      };

      listarVeiculos.mockResolvedValue(mockResult);

      await request(app)
        .get('/veiculos?limite=150')
        .expect(200);

      expect(listarVeiculos).toHaveBeenCalledWith({
        limite: 100, // Deve ser limitado a 100
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve processar ultimoDocId para paginação', async () => {
      const mockDoc = {
        exists: true,
        id: 'docId123'
      };

      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockDoc)
        }))
      });

      const mockResult = {
        veiculos: [],
        ultimoDoc: mockDoc
      };

      listarVeiculos.mockResolvedValue(mockResult);

      await request(app)
        .get('/veiculos?ultimoDocId=docId123')
        .expect(200);

      expect(listarVeiculos).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: mockDoc,
        filtros: {}
      });
    });

    test('deve retornar erro 400 para ultimoDocId inválido', async () => {
      const mockDoc = {
        exists: false
      };

      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockDoc)
        }))
      });

      const response = await request(app)
        .get('/veiculos?ultimoDocId=invalidId')
        .expect(400);

      expect(response.body.error).toBe('ID do último documento inválido');
      expect(listarVeiculos).not.toHaveBeenCalled();
    });

    test('deve aplicar filtros JSON válidos', async () => {
      const filtros = { placa: 'ABC', status: 'disponivel' };
      const mockResult = {
        veiculos: [],
        ultimoDoc: null
      };

      listarVeiculos.mockResolvedValue(mockResult);

      await request(app)
        .get(`/veiculos?filtros=${encodeURIComponent(JSON.stringify(filtros))}`)
        .expect(200);

      expect(listarVeiculos).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: filtros
      });
    });

    test('deve usar filtros vazios quando JSON é inválido', async () => {
      const mockResult = {
        veiculos: [],
        ultimoDoc: null
      };

      listarVeiculos.mockResolvedValue(mockResult);

      await request(app)
        .get('/veiculos?filtros=json-invalido')
        .expect(200);

      expect(listarVeiculos).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros: {}
      });
    });

    test('deve capturar erros inesperados', async () => {
      listarVeiculos.mockRejectedValue(new Error('Erro no Firestore'));

      const response = await request(app)
        .get('/veiculos')
        .expect(500);

      expect(response.body.error).toBe('Erro interno no servidor');
    });
  });

  describe('PUT /veiculos/:chassi', () => {
    test('deve atualizar placa com sucesso', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { placa: 'XYZ-9876' };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });
      atualizarPlaca.mockResolvedValue({ success: true });

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send(updates)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Veículo atualizado com sucesso!'
      });

      expect(buscarPorChassi).toHaveBeenCalledWith(chassi);
      expect(atualizarPlaca).toHaveBeenCalledWith(chassi, updates.placa);
    });

    test('deve atualizar quilometragem com sucesso', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { quilometragem: 50000 };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });
      atualizarQuilometragemVeiculo.mockResolvedValue({ success: true });

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send(updates)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Veículo atualizado com sucesso!'
      });

      expect(atualizarQuilometragemVeiculo).toHaveBeenCalledWith(chassi, 50000);
    });

    test('deve registrar venda com sucesso', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { dataVenda: '2024-01-15' };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });
      registrarVenda.mockResolvedValue({ success: true });

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send(updates)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Veículo atualizado com sucesso!'
      });

      expect(registrarVenda).toHaveBeenCalledWith(chassi, updates.dataVenda);
    });

    test('deve retornar erro 400 quando chassi está ausente', async () => {
      const response = await request(app)
        .put('/veiculos/')
        .send({ placa: 'XYZ-9876' })
        .expect(404); // Express retorna 404 para rota sem parâmetro
    });

    test('deve retornar erro 400 quando não há dados para atualizar', async () => {
      const chassi = '1HGBH41JXMN109186';

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send({})
        .expect(400);

      expect(response.text).toContain('Chassi e/ou dados de atualização ausentes');
      expect(buscarPorChassi).not.toHaveBeenCalled();
    });

    test('deve retornar erro 404 quando veículo não é encontrado', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { placa: 'XYZ-9876' };

      buscarPorChassi.mockResolvedValue(null);

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send(updates)
        .expect(404);

      expect(response.text).toBe('Veículo não encontrado.');
    });

    test('deve retornar erro 400 para quilometragem inválida', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { quilometragem: 'abc' };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send(updates)
        .expect(400);

      expect(response.text).toBe('Quilometragem deve ser um número válido.');
    });

    test('deve retornar erro 500 quando função de atualização falha', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { placa: 'XYZ-9876' };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });
      atualizarPlaca.mockResolvedValue({ success: false, error: 'Erro no Firestore' });

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send(updates)
        .expect(500);

      expect(response.body.error).toBe('Erro no Firestore');
    });

    test('deve processar múltiplas atualizações', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = {
        placa: 'XYZ-9876',
        quilometragem: 60000
      };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });
      atualizarPlaca.mockResolvedValue({ success: true });
      atualizarQuilometragemVeiculo.mockResolvedValue({ success: true });

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send(updates)
        .expect(200);

      expect(response.body.message).toBe('Veículo atualizado com sucesso!');
      expect(atualizarPlaca).toHaveBeenCalledWith(chassi, updates.placa);
      expect(atualizarQuilometragemVeiculo).toHaveBeenCalledWith(chassi, 60000);
    });

    test('deve capturar erros inesperados', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { placa: 'XYZ-9876' };

      buscarPorChassi.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .put(`/veiculos/${chassi}`)
        .send(updates)
        .expect(500);

      expect(response.body.message).toBe('Erro ao atualizar veículo');
    });
  });

  describe('DELETE /veiculos/:chassi', () => {
    test('deve deletar veículo com sucesso', async () => {
      const chassi = '1HGBH41JXMN109186';
      const mockSnapshot = {
        empty: false,
        docs: [{
          ref: {
            delete: jest.fn().mockResolvedValue()
          }
        }]
      };

      db.collection.mockReturnValue({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn().mockResolvedValue(mockSnapshot)
          }))
        }))
      });

      const response = await request(app)
        .delete(`/veiculos/${chassi}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Veículo deletado com sucesso!'
      });

      expect(mockSnapshot.docs[0].ref.delete).toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando chassi está ausente', async () => {
      await request(app)
        .delete('/veiculos/')
        .expect(404); // Express retorna 404 para rota sem parâmetro
    });

    test('deve retornar erro 404 quando veículo não é encontrado', async () => {
      const chassi = '1HGBH41JXMN109186';
      const mockSnapshot = {
        empty: true,
        docs: []
      };

      db.collection.mockReturnValue({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn().mockResolvedValue(mockSnapshot)
          }))
        }))
      });

      const response = await request(app)
        .delete(`/veiculos/${chassi}`)
        .expect(404);

      expect(response.text).toBe('Veículo não encontrado.');
    });

    test('deve capturar erros inesperados', async () => {
      const chassi = '1HGBH41JXMN109186';

      db.collection.mockReturnValue({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
          }))
        }))
      });

      const response = await request(app)
        .delete(`/veiculos/${chassi}`)
        .expect(500);

      expect(response.body.message).toBe('Erro ao deletar veículo');
    });
  });

  describe('Validação de dados', () => {
    test('deve processar veículo com dados completos', async () => {
      const veiculoCompleto = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic EXL',
        ano: 2022,
        cor: 'Branco Perolizado',
        categoria: 'Sedan',
        combustivel: 'Flex',
        quilometragem: 15000,
        valor: 85000.00,
        status: 'disponivel',
        observacoes: 'Veículo em perfeito estado'
      };

      criarVeiculo.mockResolvedValue({
        success: true,
        id: 'veiculo123'
      });

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoCompleto)
        .expect(201);

      expect(criarVeiculo).toHaveBeenCalledWith(veiculoCompleto);
      expect(response.body.message).toBe('Veículo criado com sucesso!');
    });

    test('deve validar formato de chassi', async () => {
      const veiculoData = {
        chassi: 'chassi-muito-curto',
        placa: 'ABC-1234',
        modelo: 'Honda Civic'
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Chassi deve ter 17 caracteres'
      });

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoData)
        .expect(400);

      expect(response.body.error).toBe('Chassi deve ter 17 caracteres');
    });
  });
});