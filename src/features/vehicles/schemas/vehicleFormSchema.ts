import { z } from 'zod';

export const vehicleFormSchema = z.object({
  marca: z.string().nonempty('Marca é obrigatória'),
  modelo: z.string().nonempty('Modelo é obrigatório'),
  placa: z
    .string()
    .nonempty('Placa é obrigatória')
    .regex(
      /^[A-Z]{3}\d[\dA-Z]\d{2}$/,
      'Placa deve estar no formato Mercosul (ABC1D23) ou antigo (ABC1234)',
    ),
  ano: z
    .string()
    .nonempty('Ano é obrigatório')
    .regex(/^\d{4}\/\d{4}$/, 'Ano deve estar no formato AAAA/YYYY'),
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
  dataCompra: z
    .string()
    .nonempty('Data da compra é obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/YYYY'),
  local: z.string().nonempty('Local de compra é obrigatório'),
  nome: z.string().nonempty('Nome do proprietário é obrigatório'),
  observacoes: z.string().optional(),
  status: z.enum(['disponivel', 'alugado', 'manutencao']).default('disponivel'),
});
