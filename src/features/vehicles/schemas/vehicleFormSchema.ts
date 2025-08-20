// src/features/vehicles/schemas/vehicleFormSchema.ts
import { z } from 'zod';

export const vehicleFormSchema = z.object({
  marca: z.string().nonempty('Marca é obrigatória'),
  modelo: z.string().nonempty('Modelo é obrigatório'),
  placa: z.string().nonempty('Placa é obrigatória'),
  ano: z.string().nonempty('Ano é obrigatório'),
  cor: z.string().nonempty('Cor é obrigatória'),
  chassi: z.string().nonempty('Chassi é obrigatório'),
  quilometragemAtual: z
    .string()
    .nonempty('Quilometragem atual é obrigatória')
    .regex(/^\d+$/, 'Quilometragem deve ser numérica'),
  quilometragemCompra: z
    .string()
    .nonempty('Quilometragem da compra é obrigatória')
    .regex(/^\d+$/, 'Quilometragem deve ser numérica'),
  dataCompra: z.string().nonempty('Data da compra é obrigatória'),
  local: z.string().nonempty('Local de compra é obrigatório'),
  nome: z.string().nonempty('Nome do proprietário é obrigatório'),
  observacoes: z.string().nonempty('Observações são obrigatórias'),
  status: z.enum(['Disponível', 'Locado', 'Manutenção']).default('Disponível'),
});
