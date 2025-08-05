import { z } from 'zod';

export const vehicleFormSchema = z.object({
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  placa: z.string().min(1, 'Placa é obrigatória'),
  ano: z.string().regex(/^\d{4}$/, 'Ano deve ser um número de 4 dígitos'),
  cor: z.string().min(1, 'Cor é obrigatória'),
  combustivel: z.string().min(1, 'Combustível é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  renavam: z.string().min(1, 'RENAVAM é obrigatório'),
  chassi: z.string().min(1, 'Chassi é obrigatório'),
  motor: z.string().min(1, 'Motor é obrigatório'),
  portas: z.string().regex(/^\d+$/, 'Número de portas deve ser um número'),
  assentos: z.string().regex(/^\d+$/, 'Número de assentos deve ser um número'),
  transmissao: z.string().min(1, 'Transmissão é obrigatória'),
  valorDiario: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor diário deve ser um número'),
  quilometragemAtual: z.string().regex(/^\d+$/, 'Quilometragem atual deve ser um número'),
  quilometragemCompra: z
    .string()
    .regex(/^\d+$/, 'Quilometragem de compra deve ser um número')
    .optional(),
  proximaManutencao: z.string().regex(/^\d+$/, 'Próxima manutenção deve ser um número'),
  numeroDocumento: z.string().optional(),
  dataCompra: z.string().optional(),
  local: z.string().optional(),
  nome: z.string().optional(),
  observacoes: z.string().optional(),
  status: z
    .enum(['Disponível', 'Locado', 'Manutenção'], {
      message: 'Status é obrigatório e deve ser Disponível, Locado ou Manutenção',
    })
    .default('Disponível'),
});
