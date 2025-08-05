// api.test.js - Testes automatizados para a API do Sistema de Locação
// Execute com: npm test

const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5001/slmg-es/us-central1/api';

// Configurar timeout para os testes
jest.setTimeout(30000);

// Dados de teste únicos para evitar conflitos
const timestamp = Date.now();
const clienteTeste = {
  cpf: '08832661489',
  dadosPessoais: {
    nome: `Cliente Teste Jest ${timestamp}`,
    dataNascimento: '1985-05-15',
  },
  endereco: {
    cep: '01234567',
    rua: 'Rua Jest Test',
    numero: '123',
    bairro: 'Bairro Test',
    cidade: 'São Paulo',
    estado: 'SP',
  },
  contato: {
    email: `jest.test.${timestamp}@email.com`,
    telefone: '11999888777',
  },
  documentos: {
    cnh: {
      numero: '11122233344',
      categoria: 'AB',
      dataValidade: '2026-12-31',
    },
  },
};

const veiculoTeste = {
  chassi: `1HGBH41JXMN${timestamp.toString().slice(-6)}`,
  placa: `TST${timestamp.toString().slice(-4)}`,
  modelo: 'Modelo Jest',
  marca: 'Marca Jest',
  renavam: '88888888888',
  anoFabricacao: 2020,
  anoModelo: 2020,
  quilometragem: 5000,
  quilometragemNaCompra: 0,
  dataCompra: '2020-01-01',
  local: 'Local Teste',
  nome: 'Veículo Jest',
  observacoes: 'Teste automatizado',
};

// Variáveis globais para compartilhar entre testes
let locacaoId = null;
let placaAtualizada = veiculoTeste.placa;

describe('TESTES DE CLIENTES', () => {
  test('Deve criar um novo cliente', async () => {
    // Primeiro, limpar cliente se existir
    try {
      await axios.delete(`${BASE_URL}/clientes/${clienteTeste.cpf}?exclusaoCompleta=true`);
    } catch (error) {
      // Ignorar se não existir
    }

    const response = await axios.post(`${BASE_URL}/clientes`, clienteTeste);

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('sucesso');
    expect(response.data.data.cpf).toBe(clienteTeste.cpf);
  });

  test('Deve buscar cliente por CPF', async () => {
    const response = await axios.get(
      `${BASE_URL}/clientes/${clienteTeste.cpf}?incluirSubcolecoes=true`,
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.nomeCompleto).toContain('Cliente Teste Jest');
    expect(response.data.data.enderecos).toBeDefined();
    expect(response.data.data.contatos).toBeDefined();
  });

  test('Deve verificar elegibilidade do cliente', async () => {
    const response = await axios.get(`${BASE_URL}/clientes/${clienteTeste.cpf}/elegibilidade`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.elegivel).toBe(true);
    expect(response.data.data.problemas).toHaveLength(0);
  });

  test('Deve listar clientes', async () => {
    const response = await axios.get(`${BASE_URL}/clientes?limite=5`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.clientes)).toBe(true);
    expect(response.data.data.clientes.length).toBeGreaterThan(0);
  });

  test('Deve buscar clientes por nome', async () => {
    const response = await axios.get(`${BASE_URL}/clientes/buscar-nome?nome=Jest&limite=5`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.clientes)).toBe(true);
  });

  test('Deve atualizar dados do cliente', async () => {
    const updates = {
      contato: {
        telefone: '11888777666',
      },
    };

    const response = await axios.put(`${BASE_URL}/clientes/${clienteTeste.cpf}`, updates);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('atualizado');
  });

  test('Deve alterar status do cliente', async () => {
    const response = await axios.patch(`${BASE_URL}/clientes/${clienteTeste.cpf}/status`, {
      status: 'ativo',
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('Não deve criar cliente com CPF duplicado', async () => {
    try {
      await axios.post(`${BASE_URL}/clientes`, clienteTeste);
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.error).toContain('já');
    }
  });

  test('Não deve encontrar cliente inexistente', async () => {
    try {
      await axios.get(`${BASE_URL}/clientes/79953697434`);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.success).toBe(false);
    }
  });
});

describe('TESTES DE VEÍCULOS', () => {
  test('Deve criar um novo veículo', async () => {
    // Primeiro, limpar veículo se existir
    try {
      await axios.delete(`${BASE_URL}/veiculos/${veiculoTeste.chassi}?exclusaoFisica=true`);
    } catch (error) {
      // Ignorar se não existir
    }

    const response = await axios.post(`${BASE_URL}/veiculos`, veiculoTeste);

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('sucesso');
    expect(response.data.data.chassi).toBe(veiculoTeste.chassi);
  });

  test('Deve buscar veículo por chassi', async () => {
    const response = await axios.get(`${BASE_URL}/veiculos/chassi/${veiculoTeste.chassi}`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.chassi).toBe(veiculoTeste.chassi);
    expect(response.data.data.modelo).toBe(veiculoTeste.modelo);
  });

  test('Deve buscar veículo por placa', async () => {
    const response = await axios.get(`${BASE_URL}/veiculos/placa/${placaAtualizada}`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.placa).toContain(placaAtualizada.substring(0, 3));
  });

  test('Deve consultar quilometragem do veículo', async () => {
    const response = await axios.get(`${BASE_URL}/veiculos/${veiculoTeste.chassi}/quilometragem`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.quilometragem).toBeGreaterThanOrEqual(veiculoTeste.quilometragem);
    expect(response.data.data.chassi).toBe(veiculoTeste.chassi);
  });

  test('Deve listar veículos', async () => {
    const response = await axios.get(`${BASE_URL}/veiculos?limite=5&incluirEstatisticas=true`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.veiculos)).toBe(true);
    expect(response.data.data.veiculos.length).toBeGreaterThan(0);
  });

  test('Deve listar apenas veículos disponíveis', async () => {
    const response = await axios.get(`${BASE_URL}/veiculos/disponiveis`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.veiculos)).toBe(true);

    // Verificar se todos os veículos estão disponíveis
    if (response.data.data.veiculos.length > 0) {
      response.data.data.veiculos.forEach((veiculo) => {
        expect(veiculo.status).toBe('disponivel');
      });
    }
  });

  test('Deve gerar relatório da frota', async () => {
    const response = await axios.get(`${BASE_URL}/veiculos/relatorio`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.totalVeiculos).toBeGreaterThan(0);
    expect(response.data.data.porStatus).toBeDefined();
    expect(response.data.data.porMarca).toBeDefined();
  });

  test('Deve atualizar quilometragem do veículo', async () => {
    const novaQuilometragem = 6000;
    const response = await axios.patch(
      `${BASE_URL}/veiculos/${veiculoTeste.chassi}/quilometragem`,
      {
        quilometragem: novaQuilometragem,
      },
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('atualizada');
  });

  test('Deve atualizar placa do veículo', async () => {
    const novaPlaca = `TST${timestamp.toString().slice(-3)}9`;
    placaAtualizada = novaPlaca; // Atualizar variável global

    const response = await axios.patch(`${BASE_URL}/veiculos/${veiculoTeste.chassi}/placa`, {
      placa: novaPlaca,
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('atualizada');
  });

  test('Deve alterar status do veículo', async () => {
    const response = await axios.patch(`${BASE_URL}/veiculos/${veiculoTeste.chassi}/status`, {
      status: 'disponivel',
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('Deve atualizar dados gerais do veículo', async () => {
    const updates = {
      local: 'Novo Local',
      observacoes: 'Observações atualizadas pelo Jest',
    };

    const response = await axios.put(`${BASE_URL}/veiculos/${veiculoTeste.chassi}`, updates);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('Não deve criar veículo com chassi duplicado', async () => {
    try {
      await axios.post(`${BASE_URL}/veiculos`, veiculoTeste);
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.error).toContain('já');
    }
  });

  test('Não deve encontrar veículo inexistente', async () => {
    try {
      await axios.get(`${BASE_URL}/veiculos/chassi/CHASSIINEXISTENTE`);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('Não deve atualizar quilometragem com valor menor', async () => {
    try {
      await axios.patch(`${BASE_URL}/veiculos/${veiculoTeste.chassi}/quilometragem`, {
        quilometragem: 1000, // Menor que a atual
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.error).toContain('menor');
    }
  });
});

describe('TESTES DE LOCAÇÕES', () => {
  const locacaoTeste = {
    cpfLocatario: '08832661489',
    placaVeiculo: '', // Será definida dinamicamente
    dataInicio: '20/12/2024',
    dataFim: '27/12/2024',
    valor: 500.0,
    servicosAdicionaisIds: ['GPS', 'SEGURO'],
  };

  beforeAll(() => {
    // Garantir que a placa atualizada seja usada
    locacaoTeste.placaVeiculo = placaAtualizada;
  });

  test('Deve criar uma nova locação', async () => {
    // Garantir que cliente e veículo existem e estão disponíveis
    try {
      await axios.get(`${BASE_URL}/clientes/${clienteTeste.cpf}`);
    } catch (error) {
      await axios.post(`${BASE_URL}/clientes`, clienteTeste);
    }

    try {
      await axios.get(`${BASE_URL}/veiculos/chassi/${veiculoTeste.chassi}`);
    } catch (error) {
      await axios.post(`${BASE_URL}/veiculos`, veiculoTeste);
    }

    // Garantir que veículo está disponível
    await axios.patch(`${BASE_URL}/veiculos/${veiculoTeste.chassi}/status`, {
      status: 'disponivel',
    });

    // Usar placa atualizada
    locacaoTeste.placaVeiculo = placaAtualizada;

    const response = await axios.post(`${BASE_URL}/locacoes`, locacaoTeste);

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('sucesso');
    expect(response.data.data.id).toBeDefined();

    // Salvar ID para testes subsequentes
    locacaoId = response.data.data.id;
  });

  test('Deve buscar locação por ID', async () => {
    expect(locacaoId).toBeDefined();

    const response = await axios.get(`${BASE_URL}/locacoes/${locacaoId}`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.id).toBe(locacaoId);
    expect(response.data.data.clienteId).toBe(locacaoTeste.cpfLocatario);
  });

  test('Deve listar locações', async () => {
    const response = await axios.get(`${BASE_URL}/locacoes?limite=5`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.locacoes)).toBe(true);
    expect(response.data.data.locacoes.length).toBeGreaterThan(0);
  });

  test('Deve buscar histórico de locações do cliente', async () => {
    const response = await axios.get(`${BASE_URL}/locacoes/cliente/${locacaoTeste.cpfLocatario}`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.locacoes)).toBe(true);
    expect(response.data.data.cpf).toBe(locacaoTeste.cpfLocatario);
  });

  test('Deve buscar histórico de locações do veículo', async () => {
    const response = await axios.get(`${BASE_URL}/locacoes/veiculo/${veiculoTeste.chassi}`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.locacoes)).toBe(true);
    expect(response.data.data.chassi).toBe(veiculoTeste.chassi);
  });

  test('Deve atualizar dados da locação', async () => {
    expect(locacaoId).toBeDefined();

    const updates = {
      valor: 600.0,
      servicosAdicionaisIds: ['GPS', 'SEGURO', 'CADEIRINHA'],
    };

    const response = await axios.put(`${BASE_URL}/locacoes/${locacaoId}`, updates);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('atualizada');
  });

  test('Deve alterar status da locação para concluída', async () => {
    expect(locacaoId).toBeDefined();

    const response = await axios.patch(`${BASE_URL}/locacoes/${locacaoId}/status`, {
      status: 'concluida',
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toContain('concluida');
  });

  test('Não deve criar locação com cliente inexistente', async () => {
    const locacaoInvalida = {
      ...locacaoTeste,
      cpfLocatario: '99999999999',
    };

    try {
      await axios.post(`${BASE_URL}/locacoes`, locacaoInvalida);
    } catch (error) {
      expect([400, 404]).toContain(error.response.status);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('Não deve criar locação com veículo inexistente', async () => {
    const locacaoInvalida = {
      ...locacaoTeste,
      placaVeiculo: 'XXX9999',
    };

    try {
      await axios.post(`${BASE_URL}/locacoes`, locacaoInvalida);
    } catch (error) {
      expect([400, 404]).toContain(error.response.status);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('Não deve encontrar locação inexistente', async () => {
    try {
      await axios.get(`${BASE_URL}/locacoes/id-inexistente`);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.success).toBe(false);
    }
  });
});

describe('TESTES DE INTEGRAÇÃO E VALIDAÇÃO', () => {
  test('Deve validar formato de CPF inválido', async () => {
    const clienteInvalido = {
      ...clienteTeste,
      cpf: '123', // CPF muito curto
    };

    try {
      await axios.post(`${BASE_URL}/clientes`, clienteInvalido);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('Deve validar formato de placa inválido', async () => {
    const veiculoInvalido = {
      ...veiculoTeste,
      chassi: `NOVO${timestamp.toString().slice(-6)}CHASSI`,
      placa: '123', // Placa inválida
    };

    try {
      await axios.post(`${BASE_URL}/veiculos`, veiculoInvalido);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('Deve validar datas inválidas na locação', async () => {
    const locacaoInvalida = {
      cpfLocatario: clienteTeste.cpf,
      placaVeiculo: placaAtualizada,
      dataInicio: '31/02/2024', // Data inválida
      dataFim: '05/03/2024',
      valor: 300,
    };

    try {
      await axios.post(`${BASE_URL}/locacoes`, locacaoInvalida);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('Deve validar período inválido na locação', async () => {
    const locacaoInvalida = {
      cpfLocatario: clienteTeste.cpf,
      placaVeiculo: placaAtualizada,
      dataInicio: '25/12/2024',
      dataFim: '20/12/2024', // Data fim antes da data início
      valor: 300,
    };

    try {
      await axios.post(`${BASE_URL}/locacoes`, locacaoInvalida);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });

  test('Deve validar limite de paginação', async () => {
    const response = await axios.get(`${BASE_URL}/clientes?limite=150`); // Acima do limite

    expect(response.status).toBe(200);
    expect(response.data.data.clientes.length).toBeLessThanOrEqual(100); // Máximo 100
  });

  test('Deve validar filtros JSON inválidos', async () => {
    try {
      await axios.get(`${BASE_URL}/clientes?filtros={invalid-json}`);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });
});

describe('TESTES DE LIMPEZA', () => {
  test('Deve excluir locação de teste', async () => {
    if (locacaoId) {
      try {
        const response = await axios.delete(`${BASE_URL}/locacoes/${locacaoId}`);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      } catch (error) {
        console.log('Locação já foi excluída ou não existe');
      }
    }
  });

  test('Deve excluir veículo de teste (soft delete)', async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/veiculos/${veiculoTeste.chassi}?exclusaoFisica=false`,
      );
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    } catch (error) {
      console.log('Veículo já foi excluído ou não existe');
    }
  });

  test('Deve excluir cliente de teste (soft delete)', async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/clientes/${clienteTeste.cpf}?exclusaoCompleta=false`,
      );
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    } catch (error) {
      console.log('Cliente já foi excluído ou não existe');
    }
  });
});

// Configuração adicional para os testes
beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('Iniciando testes da API...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timestamp: ${timestamp}`);
});

afterAll(async () => {
  console.log('Testes finalizados!');

  // Cleanup adicional - garantir limpeza completa
  try {
    if (locacaoId) {
      await axios.delete(`${BASE_URL}/locacoes/${locacaoId}`).catch(() => {});
    }
    await axios
      .delete(`${BASE_URL}/clientes/${clienteTeste.cpf}?exclusaoCompleta=true`)
      .catch(() => {});
    await axios
      .delete(`${BASE_URL}/veiculos/${veiculoTeste.chassi}?exclusaoFisica=true`)
      .catch(() => {});
  } catch (error) {
    // Ignorar erros de limpeza
  }
});

// Configuração de erro global para axios
axios.defaults.timeout = 15000;
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error(
        '❌ Erro: Não foi possível conectar ao servidor. Verifique se a API está rodando.',
      );
      console.error(`📍 URL tentada: ${error.config?.url || 'N/A'}`);
    }
    return Promise.reject(error);
  },
);
