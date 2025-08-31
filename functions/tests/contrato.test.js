const request = require('supertest');
const express = require('express');

// Mocks do Firestore e helpers
jest.mock('../scripts/firestore/firestoreContratos.js', () => ({
    criarContratoJuridico: jest.fn(),
    buscarContratoPorId: jest.fn(),
}));

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

const { criarContratoJuridico, buscarContratoPorId } = require('../scripts/firestore/firestoreContratos.js');

describe('Contratos Routes', () => {
    let app;
    let contratoRouter;

    beforeEach(() => {
        jest.clearAllMocks();

        // Import the actual router after mocks are set up
        delete require.cache[require.resolve('../contrato.js')];
        contratoRouter = require('../contrato.js').default;

        app = express();
        app.use(express.json());
        app.use('/contratos', contratoRouter);
    });

    // -------------------
    // TESTES POST /
    // -------------------
    describe('POST /contratos', () => {
        const contratoValido = {
            cpfCliente: '12345678901',
            chassiVeiculo: 'chassi123',
            termosContrato: { valor: 1000, prazo: 12 },
        };

        test('deve criar contrato com sucesso', async () => {
            criarContratoJuridico.mockResolvedValue({ success: true, id: 'uuid-fake-123' });

            const response = await request(app).post('/contratos').send(contratoValido).expect(201);
            expect(response.body).toEqual({ message: 'Contrato criado com sucesso!', id: 'uuid-fake-123' });
            expect(criarContratoJuridico).toHaveBeenCalledWith(contratoValido);
        });

        test('deve retornar 400 quando campos obrigatórios não são fornecidos', async () => {
            const response = await request(app).post('/contratos').send({}).expect(400);
            expect(response.text).toContain('Dados do contrato incompletos');
        });

        test('deve retornar 404 quando criarContratoJuridico retorna erro de não encontrado', async () => {
            criarContratoJuridico.mockResolvedValue({ success: false, error: 'Cliente não encontrado.' });

            const response = await request(app).post('/contratos').send(contratoValido).expect(404);
            expect(response.body).toEqual({ message: 'Erro ao criar contrato', error: 'Cliente não encontrado.' });
        });

        test('deve retornar 500 quando criarContratoJuridico retorna outro erro', async () => {
            criarContratoJuridico.mockResolvedValue({ success: false, error: 'Erro inesperado.' });

            const response = await request(app).post('/contratos').send(contratoValido).expect(500);
            expect(response.body).toEqual({ message: 'Erro ao criar contrato', error: 'Erro inesperado.' });
        });

        test('deve retornar 500 quando ocorre exceção', async () => {
            criarContratoJuridico.mockImplementation(() => {
                throw new Error('Falha inesperada');
            });

            const response = await request(app).post('/contratos').send(contratoValido).expect(500);
            expect(response.text).toBe('Erro interno do servidor.');
        });
    });

    // -------------------
    // TESTES GET /:id
    // -------------------
    describe('GET /contratos/:id', () => {
        const idContrato = 'uuid-fake-123';
        const contratoMock = { id: idContrato, termos: { valor: 1000 } };

        test('deve buscar contrato com sucesso', async () => {
            buscarContratoPorId.mockResolvedValue({ success: true, contrato: contratoMock });

            const response = await request(app).get(`/contratos/${idContrato}`).expect(200);
            expect(response.body).toEqual(contratoMock);
            expect(buscarContratoPorId).toHaveBeenCalledWith(idContrato);
        });

        test('deve retornar 404 quando contrato não existe', async () => {
            buscarContratoPorId.mockResolvedValue({ success: false, error: 'Contrato não encontrado.' });

            const response = await request(app).get(`/contratos/${idContrato}`).expect(404);
            expect(response.body).toEqual({ message: 'Erro ao buscar contrato', error: 'Contrato não encontrado.' });
        });

        test('deve retornar 500 quando ocorre outro erro', async () => {
            buscarContratoPorId.mockResolvedValue({ success: false, error: 'Erro inesperado.' });

            const response = await request(app).get(`/contratos/${idContrato}`).expect(500);
            expect(response.body).toEqual({ message: 'Erro ao buscar contrato', error: 'Erro inesperado.' });
        });

        test('deve retornar 500 quando ocorre exceção', async () => {
            buscarContratoPorId.mockImplementation(() => {
                throw new Error('Falha inesperada');
            });

            const response = await request(app).get(`/contratos/${idContrato}`).expect(500);
            expect(response.text).toBe('Erro interno do servidor.');
        });

    });




});
