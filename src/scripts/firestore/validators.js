// validators.js
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Validadores específicos para diferentes tipos de documento
export const documentValidators = {
  // Validação completa de CPF com dígitos verificadores
  cpfCompleto: (cpf) => {
    const cleaned = cpf.replace(/[^\d]/g, '');

    if (cleaned.length !== 11) {
      throw new ValidationError('CPF deve ter 11 dígitos', 'cpf');
    }

    // Verificar se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(cleaned)) {
      throw new ValidationError('CPF inválido', 'cpf');
    }

    // Calcular dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;

    if (parseInt(cleaned.charAt(9)) !== digit1 || parseInt(cleaned.charAt(10)) !== digit2) {
      throw new ValidationError('CPF inválido', 'cpf');
    }

    return cleaned;
  },

  // Validação de CNPJ
  cnpj: (cnpj) => {
    const cleaned = cnpj.replace(/[^\d]/g, '');

    if (cleaned.length !== 14) {
      throw new ValidationError('CNPJ deve ter 14 dígitos', 'cnpj');
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleaned)) {
      throw new ValidationError('CNPJ inválido', 'cnpj');
    }

    // Calcular primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights1[i];
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    // Calcular segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights2[i];
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (parseInt(cleaned.charAt(12)) !== digit1 || parseInt(cleaned.charAt(13)) !== digit2) {
      throw new ValidationError('CNPJ inválido', 'cnpj');
    }

    return cleaned;
  },

  // Validação de telefone brasileiro
  telefone: (telefone) => {
    const cleaned = telefone.replace(/[^\d]/g, '');

    if (cleaned.length < 10 || cleaned.length > 11) {
      throw new ValidationError('Telefone deve ter 10 ou 11 dígitos', 'telefone');
    }

    // Verificar código de área válido (11-99)
    const ddd = parseInt(cleaned.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      throw new ValidationError('Código de área inválido', 'telefone');
    }

    return cleaned;
  },

  // Validação de CEP
  cep: (cep) => {
    const cleaned = cep.replace(/[^\d]/g, '');

    if (cleaned.length !== 8) {
      throw new ValidationError('CEP deve ter 8 dígitos', 'cep');
    }

    return cleaned;
  },
};

export const validators = {
  // Validação de CPF (usando a validação completa)
  cpf: (cpf) => {
    return documentValidators.cpfCompleto(cpf);
  },

  // Validação de CNPJ
  cnpj: (cnpj) => {
    return documentValidators.cnpj(cnpj);
  },

  // Validação de placa
  placa: (placa) => {
    const cleaned = placa.replace(/[^\w]/g, '').toUpperCase();
    const mercosulPattern = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    const oldPattern = /^[A-Z]{3}[0-9]{4}$/;

    if (!mercosulPattern.test(cleaned) && !oldPattern.test(cleaned)) {
      throw new ValidationError('Formato de placa inválido', 'placa');
    }
    return cleaned;
  },

  // Validação de datas
  date: (dateStr, fieldName = 'data') => {
    if (!dateStr) {
      throw new ValidationError(`${fieldName} é obrigatória`, fieldName);
    }

    let date;

    // Tentar diferentes formatos de data
    if (typeof dateStr === 'string') {
      if (dateStr.includes('/')) {
        // Formato DD/MM/YYYY
        const parts = dateStr.split('/');
        if (parts.length !== 3) {
          throw new ValidationError(`Formato de ${fieldName} inválido. Use DD/MM/YYYY`, fieldName);
        }

        const [day, month, year] = parts.map(Number);
        date = new Date(year, month - 1, day);

        if (
          isNaN(date.getTime()) ||
          date.getDate() !== day ||
          date.getMonth() !== month - 1 ||
          date.getFullYear() !== year
        ) {
          throw new ValidationError(`${fieldName} inválida`, fieldName);
        }
      } else if (dateStr.includes('-')) {
        // Formato YYYY-MM-DD ou ISO
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new ValidationError(`${fieldName} inválida`, fieldName);
        }
      } else {
        throw new ValidationError(`Formato de ${fieldName} inválido`, fieldName);
      }
    } else {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new ValidationError(`${fieldName} inválida`, fieldName);
      }
    }

    return date;
  },

  // Validação de período
  dateRange: (startDateStr, endDateStr) => {
    const startDate = validators.date(startDateStr, 'dataInicio');
    const endDate = validators.date(endDateStr, 'dataFim');

    if (startDate >= endDate) {
      throw new ValidationError('Data de início deve ser anterior à data de término');
    }

    return { startDate, endDate };
  },

  // Validação de email
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Email inválido', 'email');
    }
    return email.toLowerCase().trim();
  },

  // Validação de telefone
  telefone: (telefone) => {
    return documentValidators.telefone(telefone);
  },

  // Validação de CEP
  cep: (cep) => {
    return documentValidators.cep(cep);
  },

  // Validação de status
  status: (status, validStatuses) => {
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status inválido. Use: ${validStatuses.join(', ')}`, 'status');
    }
    return status;
  },

  // Validação de números positivos
  positiveNumber: (value, fieldName = 'valor') => {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      throw new ValidationError(`${fieldName} deve ser um número positivo`, fieldName);
    }
    return num;
  },

  // Validação de strings não vazias
  nonEmptyString: (value, fieldName = 'campo') => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError(`${fieldName} é obrigatório`, fieldName);
    }
    return value.trim();
  },

  // Validação de array
  array: (value, fieldName = 'campo') => {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} deve ser um array`, fieldName);
    }
    return value;
  },
};

export const formatters = {
  // Formatação de data para exibição
  dateToDisplay: (isoString) => {
    if (!isoString) return null;

    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      console.error(`Erro ao formatar data ${isoString}:`, e);
      return isoString;
    }
  },

  // Formatação de data e hora para exibição
  dateTimeToDisplay: (isoString) => {
    if (!isoString) return null;

    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      return date.toLocaleString('pt-BR');
    } catch (e) {
      console.error(`Erro ao formatar data/hora ${isoString}:`, e);
      return isoString;
    }
  },

  // Formatação de data para ISO
  dateToISO: (date) => {
    return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
  },

  // Formatação de CPF para exibição
  cpfToDisplay: (cpf) => {
    const cleaned = cpf.replace(/[^\d]/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // Formatação de CNPJ para exibição
  cnpjToDisplay: (cnpj) => {
    const cleaned = cnpj.replace(/[^\d]/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  // Formatação de CEP para exibição
  cepToDisplay: (cep) => {
    const cleaned = cep.replace(/[^\d]/g, '');
    if (cleaned.length !== 8) return cep;
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  },

  // Formatação de telefone para exibição
  telefoneToDisplay: (telefone) => {
    const cleaned = telefone.replace(/[^\d]/g, '');

    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    return telefone;
  },

  // Formatação de placa para exibição
  placaToDisplay: (placa) => {
    if (!placa) return placa;

    const cleaned = placa.replace(/[^\w]/g, '').toUpperCase();

    if (cleaned.length === 7) {
      // Verificar se é formato antigo (AAA9999) ou Mercosul (AAA9A99)
      if (/^[A-Z]{3}[0-9]{4}$/.test(cleaned)) {
        return cleaned.replace(/(\w{3})(\w{4})/, '$1-$2');
      } else if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleaned)) {
        return cleaned.replace(/(\w{3})(\w{4})/, '$1-$2');
      }
    }

    return placa;
  },

  // Formatação de moeda brasileira
  currencyToDisplay: (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';

    const number = Number(value);
    if (isNaN(number)) return value;

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
  },

  // Formatação de número com separadores de milhares
  numberToDisplay: (value) => {
    if (value === null || value === undefined) return '0';

    const number = Number(value);
    if (isNaN(number)) return value;

    return new Intl.NumberFormat('pt-BR').format(number);
  },

  // Formatação de quilometragem
  kmToDisplay: (km) => {
    if (km === null || km === undefined) return '0 km';

    const number = Number(km);
    if (isNaN(number)) return km;

    return `${formatters.numberToDisplay(number)} km`;
  },

  // Formatação de porcentagem
  percentToDisplay: (value) => {
    if (value === null || value === undefined) return '0%';

    const number = Number(value);
    if (isNaN(number)) return value;

    return `${number.toFixed(1)}%`;
  },

  // Limpeza de string para busca (remover acentos, converter para minúscula)
  stringForSearch: (str) => {
    if (!str) return '';

    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  },

  // Formatação de nome próprio (primeira letra maiúscula)
  nameToDisplay: (name) => {
    if (!name) return name;

    return name
      .toLowerCase()
      .split(' ')
      .map((word) => {
        // Não capitalizar preposições pequenas
        if (['de', 'da', 'do', 'das', 'dos', 'e'].includes(word) && word.length <= 2) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  },
};
