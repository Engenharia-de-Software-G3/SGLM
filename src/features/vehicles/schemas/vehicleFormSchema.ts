// src/features/vehicles/schemas/vehicleFormSchema.ts
import { z } from 'zod';

export const vehicleFormSchema = z.object({
  marca: z.string().nonempty('Marca é obrigatória'),
  modelo: z.string().nonempty('Modelo é obrigatório'),
  placa: z.string().nonempty('Placa é obrigatória'),
  cor: z.string().nonempty('Cor é obrigatória'),
  renavam: z.string().nonempty('RENAVAM é obrigatório'),
  chassi: z.string().nonempty('Chassi é obrigatório'),
  quilometragemAtual: z
    .string()
    .nonempty('Quilometragem atual é obrigatória')
    .regex(/^\d+$/, 'Quilometragem deve ser numérica'),
  quilometragemCompra: z
    .string()
    .nonempty('Quilometragem da compra é obrigatória')
    .regex(/^\d+$/, 'Quilometragem deve ser numérica'),
  nome: z.string().nonempty('Nome do proprietário é obrigatório'),
  local: z.string().nonempty('Local de compra é obrigatório'),
  dataCompra: z
    .string()
    .nonempty('Data da compra é obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/YYYY'),
  observacoes: z.string().nonempty('Observações são obrigatórias'),
});
