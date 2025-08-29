import request from 'supertest';
import express from 'express';
import router from './router';

const app = express();
app.use(express.json());
app.use('/contratos', router);

// Mock das funções do firestoreContratos
jest.mock('../scripts/firestore/firestoreContratos.js', () => ({
    criarContratoJuridico: jest.fn(),
    buscarContratoPorId: jest.fn(),
}));

// Mock do firebaseConfig.js
jest.mock('../firebaseConfig.js', () => ({
    db: {
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),  // Aqui mockamos o método get()
            })),
        })),
    },
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
}));



describe('POST /contratos', () => {

    it('deve criar um contrato com dados válidos', async () => {
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '12345678901',
                chassiVeiculo: 'ABC1234567890',
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(201);  // Espera-se o status 201 (Created)
        expect(response.body).toHaveProperty('message', 'Contrato criado com sucesso!');
        expect(response.body).toHaveProperty('id');
    });

    it('deve retornar erro se CPF estiver faltando', async () => {
        const response = await request(app)
            .post('/contratos')
            .send({
                chassiVeiculo: 'ABC1234567890',
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(400);  // Espera-se o status 400 (Bad Request)
        expect(response.body.message).toBe(
            'Dados do contrato incompletos (cpfCliente, chassiVeiculo e termosContrato são obrigatórios).'
        );
    });

    it('deve retornar erro se Chassi do veículo estiver faltando', async () => {
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '12345678901',
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'Dados do contrato incompletos (cpfCliente, chassiVeiculo e termosContrato são obrigatórios).'
        );
    });

    it('deve retornar erro se Termos do contrato estiverem faltando', async () => {
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '12345678901',
                chassiVeiculo: 'ABC1234567890',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'Dados do contrato incompletos (cpfCliente, chassiVeiculo e termosContrato são obrigatórios).'
        );
    });

    it('deve retornar erro de servidor (500) se ocorrer algum erro inesperado', async () => {
        // Você pode simular um erro no banco ou em algum outro processo
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '12345678901',
                chassiVeiculo: 'ABC1234567890',
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Erro interno do servidor.');
    });

    it('deve retornar erro se o CPF for inválido', async () => {
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '123',  // CPF inválido
                chassiVeiculo: 'ABC1234567890',
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(400);  // Espera-se o status 400
        expect(response.body.message).toBe('CPF inválido.');
    });

    it('deve retornar erro se o Chassi do veículo for inválido', async () => {
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '12345678901',
                chassiVeiculo: 'INVALIDCHASSI',  // Chassi inválido
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(400);  // Espera-se o status 400
        expect(response.body.message).toBe('Chassi do veículo inválido.');
    });

    it('deve retornar erro se os termos do contrato forem inválidos', async () => {
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '12345678901',
                chassiVeiculo: 'ABC1234567890',
                termosContrato: 'Invalid Termo',  // Termos no formato errado
            });

        expect(response.status).toBe(400);  // Espera-se o status 400
        expect(response.body.message).toBe('Formato de termos do contrato inválido.');
    });

    it('deve retornar erro se o CPF já estiver cadastrado', async () => {
        // Supondo que a função `criarContratoJuridico` faça essa verificação
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '12345678901',  // CPF que já está registrado
                chassiVeiculo: 'ABC1234567890',
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(400);  // Espera-se o status 400
        expect(response.body.message).toBe('CPF já cadastrado.');
    });

    it('deve retornar erro 500 se ocorrer uma falha ao interagir com o banco de dados', async () => {
        // Simulando um erro na função `criarContratoJuridico`
        jest.mock('../scripts/firestore/firestoreContratos.js', () => ({
            criarContratoJuridico: jest.fn().mockRejectedValue(new Error('Erro ao conectar ao Firestore')),
        }));

        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '12345678901',
                chassiVeiculo: 'ABC1234567890',
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(500);  // Espera-se o status 500
        expect(response.body.message).toBe('Erro ao conectar ao Firestore.');
    });

    it('deve criar o contrato e interagir com o banco de dados corretamente', async () => {
        const contratoMock = {
            cpfCliente: '12345678901',
            chassiVeiculo: 'ABC1234567890',
            termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
        };

        const mockId = '12345';

        // Mockando a função de criação do contrato para retornar um id
        jest.mock('../scripts/firestore/firestoreContratos.js', () => ({
            criarContratoJuridico: jest.fn().mockResolvedValue({ success: true, id: mockId }),
        }));

        const response = await request(app)
            .post('/contratos')
            .send(contratoMock);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', mockId);  // Garantindo que o ID do contrato foi gerado corretamente
        expect(response.body).toHaveProperty('message', 'Contrato criado com sucesso!');
    });

    it('deve retornar erro se os dados do contrato forem muito grandes', async () => {
        const contratoGrande = {
            cpfCliente: '12345678901',
            chassiVeiculo: 'ABC1234567890',
            termosContrato: { term: 'A'.repeat(1000), value: 'R$ 100.000' },  // Termo muito longo
        };

        const response = await request(app)
            .post('/contratos')
            .send(contratoGrande);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Dados do contrato excedem o limite permitido.');
    });

    it('deve retornar erro se algum campo for enviado em branco', async () => {
        const response = await request(app)
            .post('/contratos')
            .send({
                cpfCliente: '',
                chassiVeiculo: 'ABC1234567890',
                termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('CPF não pode estar vazio.');
    });

});

describe('GET /contratos/:id', () => {
    // Mock da função buscarContratoPorId
    const contratoMock = {
        id: '12345',
        cpfCliente: '12345678901',
        chassiVeiculo: 'ABC1234567890',
        termosContrato: { term: 'Termo 1', value: 'R$ 100.000' },
    };

    beforeEach(() => {
        // Limpa os mocks antes de cada teste
        jest.clearAllMocks();
    });

    it('deve retornar um contrato se o ID for válido', async () => {
        // Simulando a resposta válida da função buscarContratoPorId
        jest.mock('./scripts/firestore/firestoreContratos.js', () => ({
            buscarContratoPorId: jest.fn().mockResolvedValue({
                success: true,
                contrato: contratoMock,
            }),
        }));

        const response = await request(app).get(`/contratos/${contratoMock.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(contratoMock);  // Espera-se que o contrato retornado seja o mesmo mockado
    });

    it('deve retornar erro 404 se o contrato não for encontrado', async () => {
        const idContratoInvalido = '99999';  // ID inválido que não existe

        // Mockando a função buscarContratoPorId para simular erro de contrato não encontrado
        jest.mock('./scripts/firestore/firestoreContratos.js', () => ({
            buscarContratoPorId: jest.fn().mockResolvedValue({
                success: false,
                error: 'Contrato não encontrado.',
            }),
        }));

        const response = await request(app).get(`/contratos/${idContratoInvalido}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Erro ao buscar contrato');
        expect(response.body).toHaveProperty('error', 'Contrato não encontrado.');
    });

    it('deve retornar erro 500 em caso de erro inesperado', async () => {
        const idContrato = '12345';

        // Mockando a função buscarContratoPorId para simular um erro interno
        jest.mock('./scripts/firestore/firestoreContratos.js', () => ({
            buscarContratoPorId: jest.fn().mockRejectedValue(new Error('Erro interno')),
        }));

        const response = await request(app).get(`/contratos/${idContrato}`);

        expect(response.status).toBe(500);
        expect(response.text).toBe('Erro interno do servidor.');
    });

    it('deve retornar erro 400 se o ID for mal formatado', async () => {
        const idMalFormatado = 'abc123';  // ID não numérico ou inválido

        const response = await request(app).get(`/contratos/${idMalFormatado}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'ID inválido');
    });

    it('deve retornar erro 400 se o ID não for fornecido', async () => {
        const response = await request(app).get('/contratos/');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'ID do contrato é obrigatório');
    });

    it('deve retornar erro 503 em caso de falha temporária de banco de dados', async () => {
        const idContrato = '12345';

        // Simulando uma falha intermitente de banco de dados (service unavailable)
        jest.mock('./scripts/firestore/firestoreContratos.js', () => ({
            buscarContratoPorId: jest.fn().mockRejectedValue(new Error('Falha temporária do banco de dados')),
        }));

        const response = await request(app).get(`/contratos/${idContrato}`);

        expect(response.status).toBe(503);
        expect(response.text).toBe('Serviço temporariamente indisponível.');
    });

});
