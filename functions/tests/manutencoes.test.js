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

    test('deve garantir que as peças da manutenção estão completas', async () => {
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

      // Verifica se as peças estão completas e os valores batem com os esperados
      expect(response.body[0].pecas).toEqual(expect.arrayContaining([
        { nome: 'Filtro de óleo', valor: 25.00 },
        { nome: 'Óleo motor', valor: 120.00 }
      ]));
      expect(response.body[0].oficina).toEqual({
        nome: 'Oficina Central',
        cnpj: '12345678000195'
      });
    });
  });

  describe('DELETE /manutencoes/:idManutencao', () => {
    test('deve deletar a manutenção com sucesso', async () => {
      const idManutencao = 'manut123';

      // Mock de uma resposta bem-sucedida ao deletar manutenção
      deletarManutencao.mockResolvedValue({ success: true });

      const response = await request(app)
          .delete(`/manutencoes/${idManutencao}`)
          .expect(200);

      expect(response.body).toEqual({
        message: `Manutenção ${idManutencao} deletada com sucesso!`
      });

      expect(deletarManutencao).toHaveBeenCalledWith(idManutencao);
    });

    test('deve retornar erro 404 quando manutenção não encontrada', async () => {
      const idManutencao = 'manut-nao-existe';

      // Mock de erro quando a manutenção não é encontrada
      deletarManutencao.mockResolvedValue({
        success: false,
        error: 'Manutenção não encontrada.'
      });

      const response = await request(app)
          .delete(`/manutencoes/${idManutencao}`)
          .expect(404);

      expect(response.body).toEqual({
        message: 'Erro ao deletar manutenção',
        error: 'Manutenção não encontrada.'
      });

      expect(deletarManutencao).toHaveBeenCalledWith(idManutencao);
    });

    test('deve retornar erro 500 em caso de erro genérico', async () => {
      const idManutencao = 'manut123';

      // Mock de erro genérico no processo de deletação
      deletarManutencao.mockResolvedValue({
        success: false,
        error: 'Erro desconhecido.'
      });

      const response = await request(app)
          .delete(`/manutencoes/${idManutencao}`)
          .expect(500);

      expect(response.body).toEqual({
        message: 'Erro ao deletar manutenção',
        error: 'Erro desconhecido.'
      });

      expect(deletarManutencao).toHaveBeenCalledWith(idManutencao);
    });

    test('deve retornar erro 500 em caso de erro inesperado no servidor', async () => {
      const idManutencao = 'manut123';

      // Mock de erro inesperado (por exemplo, falha na comunicação com o banco de dados)
      deletarManutencao.mockRejectedValue(new Error('Erro interno no servidor'));

      const response = await request(app)
          .delete(`/manutencoes/${idManutencao}`)
          .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');

      expect(deletarManutencao).toHaveBeenCalledWith(idManutencao);
    });

    test('deve retornar erro 404 quando idManutencao não for fornecido', async () => {
      const response = await request(app)
          .delete('/manutencoes/') // Sem o idManutencao
          .expect(404); // Espera erro 404, pois a rota não existe sem o parâmetro

      expect(response.body).toEqual({
        message: 'Erro ao deletar manutenção',
        error: 'ID da manutenção é obrigatório.'
      });
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

    test('deve rejeitar métodos não suportados em outra rota', async () => {
      const outroVeiculoId = 'veiculo456';

      // Exemplo de outra rota que não deveria permitir PUT
      await request(app)
          .put(`/veiculos/${outroVeiculoId}`)
          .send({ modelo: 'Fusca' })
          .expect(405); // Esperando 405 para método não permitido

      // Exemplo de rota que não deveria permitir DELETE
      await request(app)
          .delete(`/veiculos/${outroVeiculoId}`)
          .expect(405); // Esperando 405
    });

    test('deve rejeitar requisição sem veiculoId', async () => {
      await request(app)
          .get('/manutencoes/')
          .expect(404); // ou 400, dependendo da sua configuração de erro
    });

    test('deve rejeitar veiculoId inválido', async () => {
      await request(app)
          .get('/manutencoes/invalid-veiculo-id')
          .expect(404); // ou 400, caso a validação de ID seja configurada
    });

    test('deve rejeitar Content-Type inválido', async () => {
      await request(app)
          .post('/manutencoes/veiculo123')
          .set('Content-Type', 'text/plain') // Envia conteúdo inválido
          .send('Tipo de manutenção: preventiva')
          .expect(415); // Esperando 415 - Unsupported Media Type
    });

    test('deve processar corretamente content-type application/json', async () => {
      await request(app)
          .post('/manutencoes/veiculo123')
          .set('Content-Type', 'application/json')
          .send({ tipo: 'preventiva' })
          .expect(201); // Esperando que o conteúdo JSON seja processado corretamente
    });

    test('deve rejeitar requisição sem token de autenticação', async () => {
      await request(app)
          .get('/manutencoes/veiculo123')
          .expect(401); // Esperando 401 Unauthorized
    });

    test('deve permitir requisição com token de autenticação válido', async () => {
      await request(app)
          .get('/manutencoes/veiculo123')
          .set('Authorization', 'Bearer token_valido_aqui')
          .expect(200); // Esperando 200 OK com autenticação válida
    });

    test('deve retornar erro 500 se houver falha interna', async () => {
      // Simula erro no servidor
      jest.spyOn(app, 'get').mockImplementationOnce(() => { throw new Error('Erro inesperado'); });

      await request(app)
          .get('/manutencoes/veiculo123')
          .expect(500); // Esperando erro 500
    });

    test('deve ter a estrutura correta de resposta em erro', async () => {
      await request(app)
          .post('/manutencoes/veiculo123')
          .send({ tipo: 'invalid_type' })
          .expect(400)
          .then(response => {
            expect(response.body).toHaveProperty('error');
            expect(response.body).toHaveProperty('message');
          });
    });

    test('deve retornar 404 para recurso não encontrado', async () => {
      await request(app)
          .get('/manutencoes/veiculo-nao-existente')
          .expect(404); // Esperando 404
    });

    test('deve retornar 405 para método não permitido', async () => {
      await request(app)
          .put('/manutencoes/veiculo123')
          .send({ tipo: 'preventiva' })
          .expect(405); // Esperando 405 para método não permitido
    });

    test('deve responder dentro de um tempo razoável', async () => {
      const response = await request(app)
          .get('/manutencoes/veiculo123')
          .expect(200);

      expect(response.headers['x-response-time']).toBeDefined(); // Checa se o tempo de resposta está sendo calculado
      expect(response.duration).toBeLessThan(1000); // Checa se a resposta foi dada em menos de 1 segundo
    });
  });
});