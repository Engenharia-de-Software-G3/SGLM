import { SingleClientResponse } from '@/services/client/types';
import { z } from 'zod';

export interface ClientInfoCardProps {
  data: SingleClientResponse;
}

export type ClientInfoCardData = z.infer<typeof clientInfoCardSchema>;

export const clientInfoCardSchema = z.object({
  id: z.string().optional(),
  nomeCompleto: z.string().min(1, 'Nome é obrigatório'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido'),
  
  // Flattened address fields
  enderecos_principal_cep: z.string().min(1, 'CEP é obrigatório'),
  enderecos_principal_rua: z.string().min(1, 'Rua é obrigatória'),
  enderecos_principal_numero: z.string().min(1, 'Número é obrigatório'),
  enderecos_principal_bairro: z.string().min(1, 'Bairro é obrigatório'),
  enderecos_principal_cidade: z.string().min(1, 'Cidade é obrigatória'),
  enderecos_principal_estado: z.string().min(1, 'Estado é obrigatório'),
  
  // Flattened document fields
  documentos_cnh_numero: z.string().min(1, 'Número da CNH é obrigatório'),
  documentos_cnh_categoria: z.string().min(1, 'Categoria é obrigatória'),
  documentos_cnh_dataValidade: z.string().min(1, 'Validade é obrigatória'),
  documentos_cnh_tipo: z.string().min(1, 'Tipo é obrigatório'),
});
