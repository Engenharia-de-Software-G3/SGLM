import { z } from 'zod';

export const vehicleFormSchema = z.object({
  placa: z.string().min(1, 'Placa é obrigatória'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  chassi: z.string().min(1, 'Chassi é obrigatório'),

  anoModelo: z.string().regex(/^\d{4}\/\d{4}$/, 'Ano/Modelo deve ser no formato XXXX/YYYY'),

  quilometragemCompra: z
    .string()
    .regex(/^\d+$/, 'Quilometragem da Compra deve conter apenas números'),

  numeroDocumento: z.string().min(1, 'Número do documento é obrigatório'),

  dataCompra: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data da Compra deve ser no formato DD/MM/YYYY'),

  quilometragemAtual: z.string().regex(/^\d+$/, 'Quilometragem Atual deve conter apenas números'),

  dataAtual: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data Atual deve ser no formato DD/MM/YYYY'),

  local: z.string().min(1, 'Local é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  observacoes: z.string().optional(),
});
