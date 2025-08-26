// /home/user/Documentos/es/SGLM/src/features/rental/schemas/addRental.ts
import { z } from 'zod';

// Custom schema for required string fields
export const requiredString = z.string().min(1, 'Campo Obrigatório');

// Função para converter string DD/MM/YYYY em Date
function parseDDMMYYYY(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); // mês é 0-indexado
}

export const addRentalSchema = z.object({
  cnpjcpf: requiredString.refine((value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.length === 11 || cleanValue.length === 14;
  }, 'CNPJ/CPF deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)'),

  inicio: requiredString,
  fim: requiredString,

  placaVeiculo: requiredString.regex(
    /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/,
    'Placa deve estar no formato Mercosul (ABC1D23) ou antigo (ABC1234)',
  ),

  valorLocacao: z.number().min(0, 'Valor da locação deve ser um número válido e não negativo'),

  metodoPagamento: z.string().refine((val) => val !== '', {
    message: 'Campo obrigatório',
  }),

  periodicidadePagamento: z.string().refine((val) => val !== '', {
    message: 'Campo obrigatório',
  }),
}).refine(
  (data: { inicio: string; fim: string }) => {
    const inicioDate = parseDDMMYYYY(data.inicio);
    const fimDate = parseDDMMYYYY(data.fim);
    return fimDate > inicioDate;
  },
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['fim'],
  }
);

export type AddRentalFormData = z.infer<typeof addRentalSchema>;
