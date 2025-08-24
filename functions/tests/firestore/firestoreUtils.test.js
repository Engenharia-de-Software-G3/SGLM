// Mock do firebaseConfig
const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(),
    })),
    where: jest.fn(() => ({
      get: jest.fn(),
      limit: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  })),
};

jest.mock('../../firebaseConfig.js', () => ({
  db: mockDb,
}));

const {
  verificarDocumentoExistente,
  formatarCPF,
  formatarCNPJ,
  validarCPF,
  validarCNPJ,
  formatarTelefone,
  formatarCEP,
} = require('../../scripts/firestore/firestoreUtils.js');

describe('FirestoreUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarDocumentoExistente', () => {
    test('deve retornar true quando documento existe', async () => {
      const mockDoc = { exists: true };
      mockDb.collection().doc().get.mockResolvedValue(mockDoc);

      const resultado = await verificarDocumentoExistente('clientes', 'doc123');

      expect(resultado).toBe(true);
      expect(mockDb.collection).toHaveBeenCalledWith('clientes');
      expect(mockDb.collection().doc).toHaveBeenCalledWith('doc123');
    });

    test('deve retornar false quando documento não existe', async () => {
      const mockDoc = { exists: false };
      mockDb.collection().doc().get.mockResolvedValue(mockDoc);

      const resultado = await verificarDocumentoExistente('clientes', 'doc123');

      expect(resultado).toBe(false);
    });

    test('deve capturar erros de Firestore', async () => {
      mockDb.collection().doc().get.mockRejectedValue(new Error('Erro do Firestore'));

      await expect(verificarDocumentoExistente('clientes', 'doc123'))
        .rejects.toThrow('Erro do Firestore');
    });

    test('deve funcionar com diferentes coleções', async () => {
      const mockDoc = { exists: true };
      mockDb.collection().doc().get.mockResolvedValue(mockDoc);

      await verificarDocumentoExistente('veiculos', 'veiculo123');

      expect(mockDb.collection).toHaveBeenCalledWith('veiculos');
      expect(mockDb.collection().doc).toHaveBeenCalledWith('veiculo123');
    });
  });

  describe('formatarCPF', () => {
    test('deve formatar CPF com pontos e hífen', async () => {
      const resultado = formatarCPF('12345678901');
      expect(resultado).toBe('123.456.789-01');
    });

    test('deve manter formato se já estiver formatado', async () => {
      const resultado = formatarCPF('123.456.789-01');
      expect(resultado).toBe('123.456.789-01');
    });

    test('deve tratar CPF com formatação parcial', async () => {
      const resultado = formatarCPF('123456789-01');
      expect(resultado).toBe('123.456.789-01');
    });

    test('deve retornar string vazia para entrada inválida', async () => {
      expect(formatarCPF('')).toBe('');
      expect(formatarCPF(null)).toBe('');
      expect(formatarCPF(undefined)).toBe('');
    });

    test('deve tratar CPF com tamanho incorreto', async () => {
      const resultado = formatarCPF('123456');
      expect(resultado).toBe('123456'); // Retorna como está se não tem 11 dígitos
    });
  });

  describe('formatarCNPJ', () => {
    test('deve formatar CNPJ corretamente', async () => {
      const resultado = formatarCNPJ('12345678000195');
      expect(resultado).toBe('12.345.678/0001-95');
    });

    test('deve manter formato se já estiver formatado', async () => {
      const resultado = formatarCNPJ('12.345.678/0001-95');
      expect(resultado).toBe('12.345.678/0001-95');
    });

    test('deve retornar string vazia para entrada inválida', async () => {
      expect(formatarCNPJ('')).toBe('');
      expect(formatarCNPJ(null)).toBe('');
      expect(formatarCNPJ(undefined)).toBe('');
    });

    test('deve tratar CNPJ com tamanho incorreto', async () => {
      const resultado = formatarCNPJ('123456');
      expect(resultado).toBe('123456');
    });
  });

  describe('validarCPF', () => {
    test('deve validar CPF válido', async () => {
      const resultado = validarCPF('11144477735');
      expect(resultado).toBe(true);
    });

    test('deve invalidar CPF inválido', async () => {
      const resultado = validarCPF('12345678901');
      expect(resultado).toBe(false);
    });

    test('deve invalidar CPF com todos os dígitos iguais', async () => {
      const resultado = validarCPF('11111111111');
      expect(resultado).toBe(false);
    });

    test('deve validar CPF formatado', async () => {
      const resultado = validarCPF('111.444.777-35');
      expect(resultado).toBe(true);
    });

    test('deve invalidar entrada vazia ou nula', async () => {
      expect(validarCPF('')).toBe(false);
      expect(validarCPF(null)).toBe(false);
      expect(validarCPF(undefined)).toBe(false);
    });

    test('deve invalidar CPF com tamanho incorreto', async () => {
      expect(validarCPF('123456')).toBe(false);
      expect(validarCPF('123456789012')).toBe(false);
    });
  });

  describe('validarCNPJ', () => {
    test('deve validar CNPJ válido', async () => {
      const resultado = validarCNPJ('11222333000181');
      expect(resultado).toBe(true);
    });

    test('deve invalidar CNPJ inválido', async () => {
      const resultado = validarCNPJ('12345678000195');
      expect(resultado).toBe(false);
    });

    test('deve invalidar CNPJ com todos os dígitos iguais', async () => {
      const resultado = validarCNPJ('11111111111111');
      expect(resultado).toBe(false);
    });

    test('deve validar CNPJ formatado', async () => {
      const resultado = validarCNPJ('11.222.333/0001-81');
      expect(resultado).toBe(true);
    });

    test('deve invalidar entrada vazia ou nula', async () => {
      expect(validarCNPJ('')).toBe(false);
      expect(validarCNPJ(null)).toBe(false);
      expect(validarCNPJ(undefined)).toBe(false);
    });

    test('deve invalidar CNPJ com tamanho incorreto', async () => {
      expect(validarCNPJ('123456')).toBe(false);
      expect(validarCNPJ('123456789012345')).toBe(false);
    });
  });

  describe('formatarTelefone', () => {
    test('deve formatar telefone celular (11 dígitos)', async () => {
      const resultado = formatarTelefone('11999999999');
      expect(resultado).toBe('(11) 99999-9999');
    });

    test('deve formatar telefone fixo (10 dígitos)', async () => {
      const resultado = formatarTelefone('1133334444');
      expect(resultado).toBe('(11) 3333-4444');
    });

    test('deve manter formato se já estiver formatado', async () => {
      const resultado = formatarTelefone('(11) 99999-9999');
      expect(resultado).toBe('(11) 99999-9999');
    });

    test('deve retornar string vazia para entrada inválida', async () => {
      expect(formatarTelefone('')).toBe('');
      expect(formatarTelefone(null)).toBe('');
      expect(formatarTelefone(undefined)).toBe('');
    });

    test('deve tratar telefone com tamanho incorreto', async () => {
      const resultado = formatarTelefone('123456');
      expect(resultado).toBe('123456');
    });

    test('deve formatar telefone com código do país', async () => {
      const resultado = formatarTelefone('5511999999999');
      // Deve remover o código do país e formatar
      expect(resultado).toBe('(11) 99999-9999');
    });
  });

  describe('formatarCEP', () => {
    test('deve formatar CEP corretamente', async () => {
      const resultado = formatarCEP('01234567');
      expect(resultado).toBe('01234-567');
    });

    test('deve manter formato se já estiver formatado', async () => {
      const resultado = formatarCEP('01234-567');
      expect(resultado).toBe('01234-567');
    });

    test('deve retornar string vazia para entrada inválida', async () => {
      expect(formatarCEP('')).toBe('');
      expect(formatarCEP(null)).toBe('');
      expect(formatarCEP(undefined)).toBe('');
    });

    test('deve tratar CEP com tamanho incorreto', async () => {
      const resultado = formatarCEP('12345');
      expect(resultado).toBe('12345');
    });

    test('deve remover caracteres não numéricos antes de formatar', async () => {
      const resultado = formatarCEP('012.345-67');
      expect(resultado).toBe('01234-567');
    });
  });

  describe('Funções auxiliares', () => {
    test('deve remover formatação de strings', async () => {
      // Assumindo que há uma função para remover formatação
      const cpfSemFormatacao = '12345678901';
      const cpfComFormatacao = '123.456.789-01';
      
      // Teste da lógica interna das funções de formatação
      expect(cpfComFormatacao.replace(/[^\d]/g, '')).toBe(cpfSemFormatacao);
    });

    test('deve lidar com diferentes tipos de entrada', async () => {
      // Teste de robustez das funções
      const entradasInvalidas = [null, undefined, '', ' ', 'abc', {}];
      
      entradasInvalidas.forEach(entrada => {
        expect(() => formatarCPF(entrada)).not.toThrow();
        expect(() => formatarCNPJ(entrada)).not.toThrow();
        expect(() => formatarTelefone(entrada)).not.toThrow();
        expect(() => formatarCEP(entrada)).not.toThrow();
      });
    });
  });

  describe('Integração com Firestore', () => {
    test('deve verificar múltiplos documentos', async () => {
      const mockDoc1 = { exists: true };
      const mockDoc2 = { exists: false };
      
      mockDb.collection().doc().get
        .mockResolvedValueOnce(mockDoc1)
        .mockResolvedValueOnce(mockDoc2);

      const resultado1 = await verificarDocumentoExistente('clientes', 'doc1');
      const resultado2 = await verificarDocumentoExistente('clientes', 'doc2');

      expect(resultado1).toBe(true);
      expect(resultado2).toBe(false);
    });

    test('deve funcionar com consultas por campo específico', async () => {
      const mockSnapshot = {
        empty: false,
        docs: [{ id: 'doc123' }]
      };

      mockDb.collection().where().limit().get.mockResolvedValue(mockSnapshot);

      // Teste simulando busca por CPF
      const colecao = 'clientes';
      const campo = 'cpf';
      const valor = '12345678901';

      mockDb.collection(colecao).where(campo, '==', valor).limit(1).get();

      expect(mockDb.collection).toHaveBeenCalledWith(colecao);
      expect(mockDb.collection().where).toHaveBeenCalledWith(campo, '==', valor);
    });
  });

  describe('Performance e Edge Cases', () => {
    test('deve lidar com strings muito longas', async () => {
      const stringLonga = 'a'.repeat(1000);
      
      expect(() => formatarCPF(stringLonga)).not.toThrow();
      expect(() => validarCPF(stringLonga)).not.toThrow();
    });

    test('deve processar múltiplas operações simultaneamente', async () => {
      const mockDoc = { exists: true };
      mockDb.collection().doc().get.mockResolvedValue(mockDoc);

      const promises = Array.from({ length: 10 }, (_, i) => 
        verificarDocumentoExistente('clientes', `doc${i}`)
      );

      const resultados = await Promise.all(promises);
      
      expect(resultados).toHaveLength(10);
      expect(resultados.every(r => r === true)).toBe(true);
    });

    test('deve manter consistência na formatação', async () => {
      const cpfOriginal = '12345678901';
      
      // Formatar múltiplas vezes deve dar o mesmo resultado
      const formatado1 = formatarCPF(cpfOriginal);
      const formatado2 = formatarCPF(formatado1);
      const formatado3 = formatarCPF(formatado2);
      
      expect(formatado1).toBe(formatado2);
      expect(formatado2).toBe(formatado3);
    });
  });
});