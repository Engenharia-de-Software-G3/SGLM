import { z } from 'zod';

// Custom schema for required string fields
export const requiredString = z.string().min(1, 'Campo Obrigatório');

export const addRentalSchema = z.object({
  locatario: requiredString,
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

  valorLocacao: requiredString,

  periodicidadePagamento: z.string().refine((val) => val !== '', {
    message: 'Campo obrigatório',
  }),
});
// .refine((data: { inicio: string; fim: string }) => {
//   const inicioDate = new Date(data.inicio);
//   const fimDate = new Date(data.fim);
//   return fimDate > inicioDate;
// }, {
//   message: "Data de fim deve ser posterior à data de início",
//   path: ["fim"],
// });

export type AddRentalFormData = z.infer<typeof addRentalSchema>;
