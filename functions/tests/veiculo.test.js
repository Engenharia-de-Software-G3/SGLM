const request = require('supertest');
const express = require('express');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreVeiculos.js', () => ({
  criarVeiculo: jest.fn(),
  listarVeiculos: jest.fn(),
  buscarPorId: jest.fn(),
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
  buscarPorId, atualizarVeiculo,
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
    mockRouter.put('/:idVeiculo', async (req, res) => {
      try {
        const { idVeiculo } = req.params;
        const updates = req.body;
        
        if (!idVeiculo || !updates || Object.keys(updates).length === 0) {
          return res.status(400).send('Id do veículo e/ou dados de atualização ausentes.');
        }
        
        const veiculoExistente = await buscarPorId(idVeiculo);
        if (!veiculoExistente) {
          return res.status(404).send('Veículo não encontrado.');
        }
        
        if (updates.quilometragem && isNaN(parseInt(updates.quilometragem))) {
          return res.status(400).send('Quilometragem deve ser um número válido.');
        }
        
        let sucessoGeral = true;
        let ultimoErro = null;
        
        if (updates) {
          const resultado = await atualizarVeiculo(idVeiculo, updates);
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
    mockRouter.delete('/:idVeiculo', async (req, res) => {
      try {
        const { idVeiculo } = req.params;
        
        const snapshot = await db.collection('veiculos').where('id', '==', idVeiculo).limit(1).get();
        
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

    test('deve criar veículo mesmo sem ano e cor (opcionais)', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109187',
        placa: 'DEF-5678',
        modelo: 'Toyota Corolla'
      };

      criarVeiculo.mockResolvedValue({
        success: true,
        id: 'veiculo124'
      });

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(201);

      expect(response.body).toEqual({
        message: 'Veículo criado com sucesso!',
        id: 'veiculo124'
      });

      expect(criarVeiculo).toHaveBeenCalledWith(veiculoData);
    });

    test('deve retornar erro 400 para placa em formato inválido', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: '123-ABCD',
        modelo: 'Civic'
      };

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.text).toContain('Placa em formato inválido');
    });

    test('deve retornar erro 400 quando placa já existe', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109188',
        placa: 'ABC-1234',
        modelo: 'Civic'
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Placa já existe'
      });

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.body).toEqual({
        message: 'Erro ao criar veículo',
        error: 'Placa já existe'
      });
    });

    test('deve retornar erro 400 quando ano é uma string', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109190',
        placa: 'JKL-3456',
        modelo: 'Civic',
        ano: 'dois mil e vinte'
      };

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.text).toContain('Ano deve ser um número');
    });

    test('deve retornar 415 quando Content-Type não é application/json', async () => {
      const response = await request(app)
          .post('/veiculos')
          .set('Content-Type', 'text/plain')
          .send('chassi=1HGBH41JXMN109186&placa=ABC-1234')
          .expect(415); // Unsupported Media Type, se aplicável

      expect(response.text).toContain('Content-Type deve ser application/json');
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

    test('deve retornar erro 400 quando limite é zero', async () => {
      const response = await request(app)
          .get('/veiculos?limite=0')
          .expect(400);

      expect(response.body.error).toBe('O valor de "limite" deve ser maior que zero.');
      expect(listarVeiculos).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando limite é negativo', async () => {
      const response = await request(app)
          .get('/veiculos?limite=-5')
          .expect(400);

      expect(response.body.error).toBe('O valor de "limite" deve ser maior que zero.');
      expect(listarVeiculos).not.toHaveBeenCalled();
    });

    test('deve tratar filtros com tipos incorretos como inválidos', async () => {
      const filtros = { placa: 123 }; // tipo incorreto, deveria ser string

      const response = await request(app)
          .get(`/veiculos?filtros=${encodeURIComponent(JSON.stringify(filtros))}`)
          .expect(400); // ou 200 se o sistema só ignora silenciosamente

      expect(response.body.error).toBe('Formato inválido nos filtros');
    });

    test('deve retornar erro 400 se ultimoDocId existe mas listarVeiculos retorna null', async () => {
      const mockDoc = {
        exists: true,
        id: 'docId123'
      };

      db.collection.mockReturnValue({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockDoc)
        }))
      });

      listarVeiculos.mockResolvedValue(null);

      const response = await request(app)
          .get('/veiculos?ultimoDocId=docId123')
          .expect(400);

      expect(response.body.error).toBe('Erro ao recuperar veículos');
    });

    test('deve aplicar filtro com caracteres especiais', async () => {
      const filtros = { modelo: 'Civic EXL 2.0 Álcool' };
      const mockResult = { veiculos: [], ultimoDoc: null };

      listarVeiculos.mockResolvedValue(mockResult);

      await request(app)
          .get(`/veiculos?filtros=${encodeURIComponent(JSON.stringify(filtros))}`)
          .expect(200);

      expect(listarVeiculos).toHaveBeenCalledWith({
        limite: 10,
        ultimoDoc: null,
        filtros
      });
    });


  });

  describe('PUT /veiculos/:idVeiculo', () => {

    test('deve retornar erro 400 quando chassi está ausente', async () => {
      const response = await request(app)
        .put('/veiculos/')
        .send({ placa: 'XYZ-9876' })
        .expect(404); // Express retorna 404 para rota sem parâmetro
    });

    test('deve retornar erro 400 quando não há dados para atualizar', async () => {
      const idVeiculo = 'veiculo123';

      const response = await request(app)
        .put(`/veiculos/${idVeiculo}`)
        .send({})
        .expect(400);

      expect(response.text).toContain('Id do veículo e/ou dados de atualização ausentes');
      expect(buscarPorId).not.toHaveBeenCalled();
    });

    test('deve retornar erro 404 quando veículo não é encontrado', async () => {
      const idVeiculo = 'veiculo1123';
      const updates = { placa: 'XYZ-9876' };

      buscarPorId.mockResolvedValue(null);

      const response = await request(app)
        .put(`/veiculos/${idVeiculo}`)
        .send(updates)
        .expect(404);

      expect(response.text).toBe('Veículo não encontrado.');
    });

    test('deve retornar erro 400 para quilometragem inválida', async () => {
      const idVeiculo = 'veiculo123';
      const updates = { quilometragem: 'abc' };

      buscarPorId.mockResolvedValue({ id: 'veiculo123', idVeiculo });

      const response = await request(app)
        .put(`/veiculos/${idVeiculo}`)
        .send(updates)
        .expect(400);

      expect(response.text).toBe('Quilometragem deve ser um número válido.');
    });

    test('deve capturar erros inesperados', async () => {
      const idVeiculo = 'veiculo123';
      const updates = { placa: 'XYZ-9876' };

      buscarPorId.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .put(`/veiculos/${idVeiculo}`)
        .send(updates)
        .expect(500);

      expect(response.body.message).toBe('Erro ao atualizar veículo');
    });

    test('deve ignorar campos inválidos no payload', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = {
        placa: 'XYZ-9876',
        cor: 'azul metálico', // campo inválido para PUT
        outroCampo: 'qualquer coisa'
      };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });
      atualizarPlaca.mockResolvedValue({ success: true });

      const response = await request(app)
          .put(`/veiculos/${chassi}`)
          .send(updates)
          .expect(200);

      expect(response.body.message).toBe('Veículo atualizado com sucesso!');
      expect(atualizarPlaca).toHaveBeenCalledWith(chassi, updates.placa);
      // os outros campos não devem causar erro nem serem processados
    });

    test('deve retornar erro 400 para dataVenda inválida', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { dataVenda: '15-01-2024' }; // formato inválido

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });

      const response = await request(app)
          .put(`/veiculos/${chassi}`)
          .send(updates)
          .expect(400);

      expect(response.text).toBe('Data de venda inválida. Use o formato YYYY-MM-DD.');
    });

    test('deve retornar erro 400 para valores vazios', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { placa: '' };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });

      const response = await request(app)
          .put(`/veiculos/${chassi}`)
          .send(updates)
          .expect(400);

      expect(response.text).toBe('Valor de placa inválido.');
    });

    test('deve retornar erro 400 para placa já existente', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = { placa: 'XYZ-9876' };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });
      atualizarPlaca.mockResolvedValue({ success: false, error: 'Placa já existe' });

      const response = await request(app)
          .put(`/veiculos/${chassi}`)
          .send(updates)
          .expect(400);

      expect(response.body.error).toBe('Placa já existe');
    });

    test('deve retornar erro se uma das atualizações falhar', async () => {
      const chassi = '1HGBH41JXMN109186';
      const updates = {
        placa: 'XYZ-9876',
        quilometragem: 60000
      };

      buscarPorChassi.mockResolvedValue({ id: 'veiculo123', chassi });
      atualizarPlaca.mockResolvedValue({ success: false, error: 'Placa já existe' });

      const response = await request(app)
          .put(`/veiculos/${chassi}`)
          .send(updates)
          .expect(500); // ou 400, depende da implementação

      expect(response.body.error).toBe('Placa já existe');
    });
  });

  describe('DELETE /veiculos/:idVeiculo', () => {
    test('deve deletar veículo com sucesso', async () => {
      const idVeiculo = 'veiculo123';
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
        .delete(`/veiculos/${idVeiculo}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Veículo deletado com sucesso!'
      });

      expect(mockSnapshot.docs[0].ref.delete).toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando id está ausente', async () => {
      await request(app)
        .delete('/veiculos/')
        .expect(404); // Express retorna 404 para rota sem parâmetro
    });

    test('deve retornar erro 404 quando veículo não é encontrado', async () => {
      const idVeiculo = 'veiculo123';
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
        .delete(`/veiculos/${idVeiculo}`)
        .expect(404);

      expect(response.text).toBe('Veículo não encontrado.');
    });

    test('deve capturar erros inesperados', async () => {
      const idVeiculo = 'veiculo123';

      db.collection.mockReturnValue({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn().mockRejectedValue(new Error('Erro no Firestore'))
          }))
        }))
      });

      const response = await request(app)
        .delete(`/veiculos/${idVeiculo}`)
        .expect(500);

      expect(response.body.message).toBe('Erro ao deletar veículo');
    });

    test('deve deletar todos os documentos com o mesmo chassi (duplicados)', async () => {
      const chassi = '1HGBH41JXMN109186';
      const mockDocs = [
        { ref: { delete: jest.fn().mockResolvedValue() } },
        { ref: { delete: jest.fn().mockResolvedValue() } }
      ];
      const mockSnapshot = {
        empty: false,
        docs: mockDocs
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

      expect(response.body.message).toBe('Veículo deletado com sucesso!');
      expect(mockDocs[0].ref.delete).toHaveBeenCalled();
      expect(mockDocs[1].ref.delete).toHaveBeenCalled();
    });

    test('deve retornar erro 500 se falhar ao deletar veículo', async () => {
      const chassi = '1HGBH41JXMN109186';
      const mockSnapshot = {
        empty: false,
        docs: [{
          ref: {
            delete: jest.fn().mockRejectedValue(new Error('Falha ao deletar'))
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

    test('deve validar formato da placa', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: '12345678', // formato inválido
        modelo: 'Honda Civic'
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Placa em formato inválido'
      });

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.body.error).toBe('Placa em formato inválido');
    });

    test('deve validar ano como número entre 1900 e ano atual', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic',
        ano: 1800 // inválido
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Ano do veículo inválido'
      });

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.body.error).toBe('Ano do veículo inválido');
    });

    test('deve retornar erro para valor negativo', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic',
        valor: -10000
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Valor do veículo deve ser positivo'
      });

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.body.error).toBe('Valor do veículo deve ser positivo');
    });

    test('deve retornar erro para status inválido', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic',
        status: 'em_transporte' // inválido
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Status inválido. Valores permitidos: disponivel, vendido, reservado'
      });

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.body.error).toBe('Status inválido. Valores permitidos: disponivel, vendido, reservado');
    });

    test('deve retornar erro para quilometragem como string', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic',
        quilometragem: 'vinte mil'
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Quilometragem deve ser um número válido'
      });

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.body.error).toBe('Quilometragem deve ser um número válido');
    });

    test('deve retornar erro para observações muito longas', async () => {
      const veiculoData = {
        chassi: '1HGBH41JXMN109186',
        placa: 'ABC-1234',
        modelo: 'Honda Civic',
        observacoes: 'A'.repeat(2001) // supondo limite de 2000 caracteres
      };

      criarVeiculo.mockResolvedValue({
        success: false,
        error: 'Observações excedem o limite de 2000 caracteres'
      });

      const response = await request(app)
          .post('/veiculos')
          .send(veiculoData)
          .expect(400);

      expect(response.body.error).toBe('Observações excedem o limite de 2000 caracteres');
    });
  });
});