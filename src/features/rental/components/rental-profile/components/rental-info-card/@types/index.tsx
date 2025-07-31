import { z } from 'zod';

export const rentalInfoCardSchema = z.object({
  // Dados do Locatário
  locatario: z.string().min(1, 'Nome do locatário é obrigatório'),
  cnpjcpf: z.string().min(1, 'CNPJ/CPF é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.email('E-mail inválido').min(1, 'E-mail é obrigatório'),

  // Dados do Veículo
  placaVeiculo: z.string().min(1, 'Placa do veículo é obrigatória'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.string().min(1, 'Ano é obrigatório'),
  cor: z.string().min(1, 'Cor é obrigatória'),
  chassi: z.string().min(1, 'Chassi é obrigatório'),

  // Dados da Locação
  inicio: z.string().min(1, 'Data de início é obrigatória'),
  fim: z.string().min(1, 'Data de fim é obrigatória'),
  valorLocacao: z.string().min(1, 'Valor da locação é obrigatório'),
  intervaloPagamento: z.string().min(1, 'Intervalo de pagamento é obrigatório'),
  observacoes: z.string().optional(),

  // Dados de Pagamento
  formaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  statusPagamento: z.string().min(1, 'Status do pagamento é obrigatório'),

  // Dados de Entrega/Devolução
  localEntrega: z.string().min(1, 'Local de entrega é obrigatório'),
  localDevolucao: z.string().min(1, 'Local de devolução é obrigatório'),
  quilometragemInicial: z.string().min(1, 'Quilometragem inicial é obrigatória'),
  quilometragemFinal: z.string().optional(),
});

export type RentalInfoCardData = z.infer<typeof rentalInfoCardSchema>;

export interface RentalInfoCardProps {
  data: RentalInfoCardData;
  setData: React.Dispatch<React.SetStateAction<RentalInfoCardData>>;
}
