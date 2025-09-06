const { 
  criarCliente, 
  buscarClientePorCPF, 
  deletarCliente,
  listarClientes,
  atualizarCliente 
} = require('../scripts/firestore/firestoreClientes.js');

// Mocks mais robustos
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockCommit = jest.fn();
const mockBatchSet = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchDelete = jest.fn();
const mockLimit = jest.fn();

jest.mock('../firebaseConfig.js', () => {
  const mockBatch = jest.fn(() => ({
    set: mockBatchSet,
    update: mockBatchUpdate,
    delete: mockBatchDelete,
    commit: mockCommit
  }));

  // Mock para subcoleção
  const mockSubDoc = jest.fn(() => ({ 
    set: mockBatchSet, 
    get: mockGet,
    ref: { delete: mockDelete }
  }));
  const mockSubCollection = jest.fn(() => ({ 
    doc: mockSubDoc, 
    get: mockGet 
  }));

  // Mock para documento principal
  const mockDoc = jest.fn(() => ({ 
    set: mockSet, 
    get: mockGet,
    update: mockUpdate,
    delete: mockDelete,
    collection: mockSubCollection,
    ref: { 
      delete: mockDelete,
      collection: mockSubCollection
    }
  }));

  // Mock para chains complexos do where
  const mockLimit = jest.fn(() => ({ get: mockGet }));
  const mockWhere2 = jest.fn(() => ({ limit: mockLimit, get: mockGet }));
  const mockWhere1 = jest.fn(() => ({ where: mockWhere2, limit: mockLimit, get: mockGet }));

  // Mock para query builders
  const mockStartAfter = jest.fn(() => ({ get: mockGet }));
  const mockOrderBy = jest.fn(() => ({ 
    limit: jest.fn(() => ({
      where: mockWhere1,
      startAfter: mockStartAfter,
      get: mockGet
    })),
    where: mockWhere1,
    get: mockGet
  }));
  
  return {
    db: {
      collection: jest.fn(() => ({
        doc: mockDoc,
        where: mockWhere1,
        orderBy: mockOrderBy,
        get: mockGet
      })),
      batch: mockBatch
    }
  };
});

describe('firestoreClientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarCliente', () => {
    const clienteValido = {
      cpf: '123.456.789-01',
      dadosPessoais: {
        nome: 'João Silva',
        dataNascimento: '1990-01-01'
      },
      endereco: {
        cep: '01234-567',
        rua: 'Rua A',
        numero: '123',
        bairro: 'Centro',
        cidade: 'SP',
        estado: 'SP'
      },
      contato: {
        email: 'joao@test.com',
        telefone: '(11) 99999-9999'
      }
    };

    it('deve criar cliente completo com sucesso', async () => {
      mockGet.mockResolvedValue({ empty: true }); // CPF não existe
      mockSet.mockResolvedValue();
      mockCommit.mockResolvedValue();

      const resultado = await criarCliente(clienteValido);

      expect(resultado.success).toBe(true);
      expect(mockCommit).toHaveBeenCalled();
    });

    it('deve criar cliente com documentos opcionais', async () => {
      const clienteComDocumentos = {
        ...clienteValido,
        documentos: {
          cnh: {
            numero: '12345678901',
            categoria: 'AB',
            dataValidade: '2025-12-31'
          }
        },
        dadosBancarios: {
          banco: 'Banco do Brasil',
          agencia: '1234',
          agenciaDigito: '5',
          conta: '567890',
          contaDigito: '1'
        }
      };

      mockGet.mockResolvedValue({ empty: true });
      mockSet.mockResolvedValue();
      mockCommit.mockResolvedValue();

      const resultado = await criarCliente(clienteComDocumentos);

      expect(resultado).toEqual({ success: true });
      expect(mockBatchSet).toHaveBeenCalled();
    });

    it('deve retornar erro quando CPF já existe', async () => {
      mockGet.mockResolvedValue({ empty: false });

      const resultado = await criarCliente(clienteValido);

      expect(resultado).toEqual({
        success: false,
        error: 'CPF já cadastrado no sistema.'
      });
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      const resultado = await criarCliente(clienteValido);

      expect(resultado).toEqual({
        success: false,
        error: 'Firestore error'
      });
    });
  });

  describe('buscarClientePorCPF', () => {
    it('deve buscar cliente com todas as subcoleções', async () => {
      const mockClienteData = {
        id: '12345678901',
        nomeCompleto: 'João Silva',
        tipo: 'PF'
      };

      // Mock documento principal
      mockGet.mockResolvedValueOnce({ 
        exists: true, 
        data: () => mockClienteData,
        id: '12345678901'
      });

      // Mock subcoleções
      const mockSubcollectionSnapshots = [
        { // endereços
          empty: false,
          docs: [{ 
            id: 'principal', 
            data: () => ({ cep: '01234-567', rua: 'Rua A' }) 
          }]
        },
        { // contatos
          empty: false,
          docs: [{ 
            id: 'principal', 
            data: () => ({ email: 'joao@test.com', telefone: '(11) 99999-9999' }) 
          }]
        },
        { // documentos
          empty: true,
          docs: []
        },
        { // dados-bancarios
          empty: false,
          docs: [{ 
            id: 'principal', 
            data: () => ({ 
              banco: 'BB', 
              agencia: '1234', 
              agenciaDigito: '5',
              conta: '567890',
              contaDigito: '1'
            }) 
          }]
        }
      ];

      mockSubcollectionSnapshots.forEach(snapshot => {
        mockGet.mockResolvedValueOnce(snapshot);
      });

      const resultado = await buscarClientePorCPF('123.456.789-01');

      expect(resultado.success).toBe(true);
      expect(resultado.cliente).toEqual(expect.objectContaining({
        id: '12345678901',
        nomeCompleto: 'João Silva',
        cpf: '123.456.789-01',
        enderecos: expect.any(Object),
        contatos: expect.any(Object)
      }));
    });

    it('deve retornar erro quando cliente não existe', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const resultado = await buscarClientePorCPF('999.999.999-99');

      expect(resultado).toEqual({
        success: false,
        error: 'Cliente não encontrado.'
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      const resultado = await buscarClientePorCPF('123.456.789-01');

      expect(resultado).toEqual({
        success: false,
        error: 'Firestore error'
      });
    });
  });

  describe('deletarCliente', () => {
    it('deve retornar erro quando cliente não existe', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const resultado = await deletarCliente('123.456.789-01');

      expect(resultado).toEqual({
        success: false,
        error: 'Cliente não encontrado.'
      });
    });

    it('deve retornar erro quando cliente tem locações ativas', async () => {
      mockGet
        .mockResolvedValueOnce({ exists: true }) // cliente existe
        .mockResolvedValueOnce({ empty: false }); // tem locações ativas
      mockLimit.mockReturnValue({ get: mockGet });

      const resultado = await deletarCliente('123.456.789-01');

      expect(resultado).toEqual({
        success: false,
        error: 'Não é possível deletar o cliente pois ele possui locações ativas. Finalize ou cancele as locações antes de deletar o cliente.'
      });
    });

    it('deve deletar cliente sem locações ativas', async () => {
      mockGet
        .mockResolvedValueOnce({ exists: true }) // cliente existe
        .mockResolvedValueOnce({ empty: true }); // sem locações ativas
      mockLimit.mockReturnValue({ get: mockGet });
      
      // Mock subcoleções vazias
      ['endereços', 'contatos', 'documentos', 'dados-bancarios'].forEach(() => {
        mockGet.mockResolvedValueOnce({ docs: [] });
      });
      
      mockCommit.mockResolvedValue();
      mockDelete.mockResolvedValue();

      const resultado = await deletarCliente('123.456.789-01');

      expect(resultado).toEqual({ success: true });
      expect(mockDelete).toHaveBeenCalled();
    });

    it('deve deletar cliente com subcoleções não vazias', async () => {
      mockGet
        .mockResolvedValueOnce({ exists: true }) // cliente existe
        .mockResolvedValueOnce({ empty: true }); // sem locações ativas
      mockLimit.mockReturnValue({ get: mockGet });
      
      // Mock subcoleções com documentos
      const mockSubDocs = [
        { ref: { delete: mockDelete } },
        { ref: { delete: mockDelete } }
      ];
      
      ['endereços', 'contatos', 'documentos', 'dados-bancarios'].forEach(() => {
        mockGet.mockResolvedValueOnce({ docs: mockSubDocs });
      });
      
      mockCommit.mockResolvedValue();
      mockDelete.mockResolvedValue();

      const resultado = await deletarCliente('123.456.789-01');

      expect(resultado).toEqual({ success: true });
      expect(mockBatchDelete).toHaveBeenCalled();
      expect(mockCommit).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      const resultado = await deletarCliente('123.456.789-01');

      expect(resultado).toEqual({
        success: false,
        error: 'Firestore error'
      });
    });
  });

  describe('listarClientes', () => {
    const mockDocs = [
      {
        id: '12345678901',
        data: () => ({ id: '12345678901', nomeCompleto: 'João Silva', tipo: 'PF' }),
        ref: {
          collection: jest.fn(() => ({
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ exists: false })
            }))
          }))
        }
      }
    ];

    it('deve listar clientes com paginação', async () => {
      const mockSnapshot = { docs: mockDocs };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await listarClientes({ limite: 10 });

      expect(resultado).toHaveProperty('clientes');
      expect(resultado).toHaveProperty('ultimoDoc');
      expect(Array.isArray(resultado.clientes)).toBe(true);
    });

    it('deve filtrar por CPF específico', async () => {
      mockGet.mockResolvedValue({ 
        exists: true,
        id: '12345678901',
        data: () => ({ id: '12345678901', nomeCompleto: 'João Silva' }),
        ref: {
          collection: jest.fn(() => ({
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ exists: false })
            }))
          }))
        }
      });

      const resultado = await listarClientes({ filtros: { cpf: '123.456.789-01' } });

      expect(resultado.clientes).toHaveLength(1);
      expect(resultado.clientes[0]).toEqual(expect.objectContaining({
        cpf: '123.456.789-01',
        nomeCompleto: 'João Silva'
      }));
    });

    it('deve retornar lista vazia quando CPF não encontrado', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const resultado = await listarClientes({ filtros: { cpf: '999.999.999-99' } });

      expect(resultado.clientes).toHaveLength(0);
      expect(resultado.ultimoDoc).toBeNull();
    });

    it('deve filtrar por nome', async () => {
      const mockSnapshot = { docs: mockDocs };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await listarClientes({ 
        limite: 10, 
        filtros: { nome: 'João' } 
      });

      expect(resultado).toHaveProperty('clientes');
      expect(resultado).toHaveProperty('ultimoDoc');
    });

    it('deve filtrar por tipo', async () => {
      const mockSnapshot = { docs: mockDocs };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await listarClientes({ 
        limite: 10, 
        filtros: { tipo: 'PF' } 
      });

      expect(resultado).toHaveProperty('clientes');
      expect(resultado).toHaveProperty('ultimoDoc');
    });

    it('deve usar ultimoDoc para paginação', async () => {
      const mockSnapshot = { docs: mockDocs };
      const mockUltimoDoc = { id: 'ultimo' };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await listarClientes({ 
        limite: 10, 
        ultimoDoc: mockUltimoDoc 
      });

      expect(resultado).toHaveProperty('clientes');
      expect(resultado).toHaveProperty('ultimoDoc');
    });

    it('deve tratar erro ao buscar dados bancários (filtro CPF)', async () => {
      mockGet.mockResolvedValueOnce({ 
        exists: true,
        id: '12345678901',
        data: () => ({ id: '12345678901', nomeCompleto: 'João Silva' }),
        ref: {
          collection: jest.fn().mockImplementation((colName) => ({
            doc: jest.fn(() => ({
              get: colName === 'dados-bancarios' 
                ? jest.fn().mockRejectedValue(new Error('Erro dados bancários'))
                : jest.fn().mockResolvedValue({ exists: false })
            }))
          }))
        }
      });

      const resultado = await listarClientes({ filtros: { cpf: '123.456.789-01' } });

      expect(resultado.clientes).toHaveLength(1);
      expect(resultado.clientes[0]).not.toHaveProperty('dadosBancarios');
    });

    it('deve tratar erro ao buscar contatos (filtro CPF)', async () => {
      mockGet.mockResolvedValueOnce({ 
        exists: true,
        id: '12345678901',
        data: () => ({ id: '12345678901', nomeCompleto: 'João Silva' }),
        ref: {
          collection: jest.fn().mockImplementation((colName) => ({
            doc: jest.fn(() => ({
              get: colName === 'contatos' 
                ? jest.fn().mockRejectedValue(new Error('Erro contatos'))
                : jest.fn().mockResolvedValue({ exists: false })
            }))
          }))
        }
      });

      const resultado = await listarClientes({ filtros: { cpf: '123.456.789-01' } });

      expect(resultado.clientes).toHaveLength(1);
      expect(resultado.clientes[0]).not.toHaveProperty('email');
    });

    it('deve tratar erro ao buscar dados bancários (listagem geral)', async () => {
      const mockDocsWithError = [
        {
          id: '12345678901',
          data: () => ({ id: '12345678901', nomeCompleto: 'João Silva', tipo: 'PF' }),
          ref: {
            collection: jest.fn().mockImplementation((colName) => ({
              doc: jest.fn(() => ({
                get: colName === 'dados-bancarios' 
                  ? jest.fn().mockRejectedValue(new Error('Erro dados bancários'))
                  : jest.fn().mockResolvedValue({ exists: false })
              }))
            }))
          }
        }
      ];
      
      const mockSnapshot = { docs: mockDocsWithError };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await listarClientes({ limite: 10 });

      expect(resultado.clientes).toHaveLength(1);
      expect(resultado.clientes[0]).not.toHaveProperty('dadosBancarios');
    });

    it('deve tratar erro ao buscar contatos (listagem geral)', async () => {
      const mockDocsWithError = [
        {
          id: '12345678901',
          data: () => ({ id: '12345678901', nomeCompleto: 'João Silva', tipo: 'PF' }),
          ref: {
            collection: jest.fn().mockImplementation((colName) => ({
              doc: jest.fn(() => ({
                get: colName === 'contatos' 
                  ? jest.fn().mockRejectedValue(new Error('Erro contatos'))
                  : jest.fn().mockResolvedValue({ exists: false })
              }))
            }))
          }
        }
      ];
      
      const mockSnapshot = { docs: mockDocsWithError };
      mockGet.mockResolvedValue(mockSnapshot);

      const resultado = await listarClientes({ limite: 10 });

      expect(resultado.clientes).toHaveLength(1);
      expect(resultado.clientes[0]).not.toHaveProperty('email');
    });

    it('deve lançar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      await expect(listarClientes({})).rejects.toThrow('Firestore error');
    });
  });

  describe('atualizarCliente', () => {
    it('deve atualizar dados pessoais do cliente', async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockCommit.mockResolvedValue();

      const updates = {
        dadosPessoais: {
          nome: 'João Silva Santos',
          dataNascimento: '1990-05-15'
        }
      };

      const resultado = await atualizarCliente('12345678901', updates);

      expect(resultado).toEqual({ success: true });
      expect(mockBatchUpdate).toHaveBeenCalled();
      expect(mockCommit).toHaveBeenCalled();
    });

    it('deve atualizar endereço do cliente', async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockCommit.mockResolvedValue();

      const updates = {
        endereco: {
          cep: '04567-890',
          rua: 'Nova Rua',
          numero: '456'
        }
      };

      const resultado = await atualizarCliente('12345678901', updates);

      expect(resultado).toEqual({ success: true });
      expect(mockBatchSet).toHaveBeenCalled();
      expect(mockCommit).toHaveBeenCalled();
    });

    it('deve atualizar contato do cliente', async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockCommit.mockResolvedValue();

      const updates = {
        contato: {
          email: 'novo@email.com',
          telefone: '(11) 88888-8888'
        }
      };

      const resultado = await atualizarCliente('12345678901', updates);

      expect(resultado).toEqual({ success: true });
      expect(mockBatchSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          email: 'novo@email.com',
          telefone: '(11) 88888-8888'
        }),
        { merge: true }
      );
    });

    it('deve atualizar documentos do cliente', async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockCommit.mockResolvedValue();

      const updates = {
        documentos: {
          cnh: {
            numero: '98765432109',
            categoria: 'C',
            dataValidade: '2026-12-31'
          }
        }
      };

      const resultado = await atualizarCliente('12345678901', updates);

      expect(resultado).toEqual({ success: true });
      expect(mockBatchSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          numero: '98765432109',
          categoria: 'C',
          dataValidade: '2026-12-31'
        }),
        { merge: true }
      );
    });

    it('deve atualizar dados bancários', async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockCommit.mockResolvedValue();

      const updates = {
        dadosBancarios: {
          banco: 'Novo Banco',
          agencia: '5678',
          agenciaDigito: '9',
          conta: '123456',
          contaDigito: '7'
        }
      };

      const resultado = await atualizarCliente('12345678901', updates);

      expect(resultado).toEqual({ success: true });
      expect(mockBatchSet).toHaveBeenCalledWith(
        expect.anything(), 
        expect.objectContaining({
          banco: 'Novo Banco',
          dataAtualizacao: expect.any(String)
        }),
        { merge: true }
      );
    });

    it('deve retornar erro quando cliente não existe', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const resultado = await atualizarCliente('999999999999', { 
        dadosPessoais: { nome: 'Teste' } 
      });

      expect(resultado).toEqual({
        success: false,
        error: 'Cliente não encontrado.'
      });
    });

    it('deve retornar erro quando Firestore falha', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      const resultado = await atualizarCliente('12345678901', { 
        dadosPessoais: { nome: 'Teste' } 
      });

      expect(resultado).toEqual({
        success: false,
        error: 'Firestore error'
      });
    });
  });
});