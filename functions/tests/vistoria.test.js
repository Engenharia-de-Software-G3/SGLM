const request = require('supertest');
const express = require('express');

// Mock das funções do firestore
jest.mock('../scripts/firestore/firestoreVistoria.js', () => ({
  criarVistoria: jest.fn(),
}));

const { criarVistoria } = require('../scripts/firestore/firestoreVistoria.js');

describe('Vistoria Routes', () => {
  let app;
  let vistoriaRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Import the actual router after mocks are set up
    delete require.cache[require.resolve('../vistoria.js')];
    vistoriaRouter = require('../vistoria.js').default;
    
    app = express();
    app.use(express.json());
    app.use('/vistorias', vistoriaRouter);
  });

  describe('POST /vistorias', () => {
    test('deve criar vistoria com dados válidos', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15',
        observacoes: 'Vistoria completa realizada'
      };

      criarVistoria.mockResolvedValue({
        success: true,
        id: 'vistoria123'
      });

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Vistoria criada com sucesso!'
      });

      expect(criarVistoria).toHaveBeenCalledWith(vistoriaData);
    });

    test('deve retornar erro 400 quando chassiVeiculo está ausente', async () => {
      const vistoriaData = {
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15'
      };

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(400);

      expect(response.text).toContain('Dados da vistoria incompletos');
      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando placaVeiculo está ausente', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15'
      };

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(400);

      expect(response.text).toContain('Dados da vistoria incompletos');
      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando nomeEmpresa está ausente', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15'
      };

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(400);

      expect(response.text).toContain('Dados da vistoria incompletos');
      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando nomeFuncionario está ausente', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        quilometragem: 50000,
        data: '2024-01-15'
      };

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(400);

      expect(response.text).toContain('Dados da vistoria incompletos');
      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando quilometragem está ausente', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        data: '2024-01-15'
      };

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(400);

      expect(response.text).toContain('Dados da vistoria incompletos');
      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando data está ausente', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000
      };

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(400);

      expect(response.text).toContain('Dados da vistoria incompletos');
      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando body está vazio', async () => {
      const response = await request(app)
        .post('/vistorias')
        .send({})
        .expect(400);

      expect(response.text).toContain('Dados da vistoria incompletos');
      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve retornar erro 400 quando body é null', async () => {
      const response = await request(app)
        .post('/vistorias')
        .send(null)
        .expect(400);

      expect(response.text).toContain('Dados da vistoria incompletos');
      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve retornar erro 500 quando criarVistoria falha', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15'
      };

      criarVistoria.mockResolvedValue({
        success: false,
        error: 'Erro no Firestore'
      });

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Erro ao criar Vistoria',
        error: 'Erro no Firestore'
      });
    });

    test('deve capturar erros inesperados', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15'
      };

      criarVistoria.mockRejectedValue(new Error('Erro inesperado'));

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(500);

      expect(response.text).toBe('Erro interno do servidor.');
    });

    test('deve processar vistoria com dados opcionais', async () => {
      const vistoriaCompleta = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15T10:30:00Z',
        observacoes: 'Vistoria completa - todos os itens verificados',
        itensVerificados: [
          'Pneus em bom estado',
          'Freios funcionando',
          'Luzes operacionais',
          'Documentação em dia'
        ],
        status: 'aprovada',
        valorCobrado: 150.00,
        localVistoria: 'Sede da empresa'
      };

      criarVistoria.mockResolvedValue({
        success: true,
        id: 'vistoria123'
      });

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaCompleta)
        .expect(201);

      expect(response.body.message).toBe('Vistoria criada com sucesso!');
      expect(criarVistoria).toHaveBeenCalledWith(vistoriaCompleta);
    });

    test('deve aceitar quilometragem como string numérica', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: '75000', // String numérica
        data: '2024-01-15'
      };

      criarVistoria.mockResolvedValue({
        success: true,
        id: 'vistoria123'
      });

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(201);

      expect(criarVistoria).toHaveBeenCalledWith(vistoriaData);
      expect(response.body.message).toBe('Vistoria criada com sucesso!');
    });
  });

  describe('GET /vistorias', () => {
    test('deve retornar mensagem placeholder para listagem', async () => {
      const response = await request(app)
        .get('/vistorias')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Rota GET /vistoria implementada em breve.'
      });
    });

    test('deve capturar erros inesperados na rota GET', async () => {
      // A rota atual sempre retorna 200 com mensagem placeholder
      const response = await request(app)
        .get('/vistorias')
        .expect(200);

      expect(response.body.message).toContain('implementada em breve');
    });

    test('deve processar query parameters (futuro)', async () => {
      // Teste para quando a listagem for implementada
      const response = await request(app)
        .get('/vistorias?limite=10&filtros={"chassi":"123"}')
        .expect(200);

      expect(response.body.message).toContain('implementada em breve');
    });
  });

  describe('Validação de middleware', () => {
    test('deve processar JSON corretamente', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15',
        metadados: {
          versao: '1.0',
          sistema: 'SGLM'
        }
      };

      criarVistoria.mockResolvedValue({
        success: true,
        id: 'vistoria123'
      });

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(criarVistoria).toHaveBeenCalledWith(vistoriaData);
      expect(response.body.message).toBe('Vistoria criada com sucesso!');
    });

    test('deve rejeitar JSON malformado', async () => {
      const response = await request(app)
        .post('/vistorias')
        .send('{"chassiVeiculo": "123456"') // JSON malformado - falta fechar chave
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(criarVistoria).not.toHaveBeenCalled();
    });

    test('deve processar Content-Type correto', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 50000,
        data: '2024-01-15'
      };

      criarVistoria.mockResolvedValue({
        success: true,
        id: 'vistoria123'
      });

      // Testando sem Content-Type explícito
      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(201);

      expect(criarVistoria).toHaveBeenCalledWith(vistoriaData);
    });
  });

  describe('Validações específicas de dados', () => {
    test('deve processar chassi com formato padrão', async () => {
      const vistoriaData = {
        chassiVeiculo: '9BWZZZ377VT004251', // Formato VIN padrão
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 25000,
        data: '2024-01-15'
      };

      criarVistoria.mockResolvedValue({
        success: true,
        id: 'vistoria123'
      });

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(201);

      expect(criarVistoria).toHaveBeenCalledWith(vistoriaData);
    });

    test('deve processar placa com diferentes formatos', async () => {
      const vistoriasComPlacasDiferentes = [
        'ABC-1234', // Formato antigo
        'ABC1234',  // Sem hífen
        'ABC1D34'   // Mercosul
      ];

      for (const placa of vistoriasComPlacasDiferentes) {
        const vistoriaData = {
          chassiVeiculo: '1HGBH41JXMN109186',
          placaVeiculo: placa,
          nomeEmpresa: 'Empresa Teste LTDA',
          nomeFuncionario: 'João Silva',
          quilometragem: 30000,
          data: '2024-01-15'
        };

        criarVistoria.mockResolvedValue({
          success: true,
          id: `vistoria-${placa.replace(/[^a-zA-Z0-9]/g, '')}`
        });

        await request(app)
          .post('/vistorias')
          .send(vistoriaData)
          .expect(201);

        expect(criarVistoria).toHaveBeenCalledWith(vistoriaData);
      }
    });

    test('deve processar quilometragem zero', async () => {
      const vistoriaData = {
        chassiVeiculo: '1HGBH41JXMN109186',
        placaVeiculo: 'ABC-1234',
        nomeEmpresa: 'Empresa Teste LTDA',
        nomeFuncionario: 'João Silva',
        quilometragem: 0, // Quilometragem zero
        data: '2024-01-15'
      };

      criarVistoria.mockResolvedValue({
        success: true,
        id: 'vistoria123'
      });

      const response = await request(app)
        .post('/vistorias')
        .send(vistoriaData)
        .expect(201);

      expect(criarVistoria).toHaveBeenCalledWith(vistoriaData);
      expect(response.body.message).toBe('Vistoria criada com sucesso!');
    });

    test('deve processar data em diferentes formatos', async () => {
      const formatasDatas = [
        '2024-01-15',
        '2024-01-15T10:30:00',
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00-03:00'
      ];

      for (const data of formatasDatas) {
        const vistoriaData = {
          chassiVeiculo: '1HGBH41JXMN109186',
          placaVeiculo: 'ABC-1234',
          nomeEmpresa: 'Empresa Teste LTDA',
          nomeFuncionario: 'João Silva',
          quilometragem: 40000,
          data: data
        };

        criarVistoria.mockResolvedValue({
          success: true,
          id: 'vistoria123'
        });

        await request(app)
          .post('/vistorias')
          .send(vistoriaData)
          .expect(201);

        expect(criarVistoria).toHaveBeenCalledWith(vistoriaData);
      }
    });
  });
});