// constants.js
export const COLLECTIONS = {
  CLIENTES: 'clientes',
  VEICULOS: 'veiculos',
  LOCACOES: 'locacoes',
  SERVICOS: 'servicos',
};

export const STATUS = {
  CLIENTE: {
    ATIVO: 'ativo',
    INATIVO: 'inativo',
    BLOQUEADO: 'bloqueado',
  },
  VEICULO: {
    DISPONIVEL: 'disponivel',
    ALUGADO: 'alugado',
    MANUTENCAO: 'manutencao',
    VENDIDO: 'vendido',
  },
  LOCACAO: {
    ATIVA: 'ativa',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada',
  },
};

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const VALIDATION_PATTERNS = {
  CPF: /^\d{11}$/,
  CNPJ: /^\d{14}$/,
  PLACA_ANTIGA: /^[A-Z]{3}[0-9]{4}$/,
  PLACA_MERCOSUL: /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
};

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

export const FIELD_NAMES = {
  CPF: 'cpf',
  PLACA: 'placa',
  CHASSI: 'chassi',
  EMAIL: 'email',
  TELEFONE: 'telefone',
  DATA_INICIO: 'dataInicio',
  DATA_FIM: 'dataFim',
  VALOR: 'valor',
};
