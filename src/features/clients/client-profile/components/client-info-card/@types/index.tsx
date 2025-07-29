import { z } from 'zod';

// export interface ClientInfoCardData {
//   // Dados pessoais
//   name: string;
//   birthDate: string;
//   cpf: string;
//   phone: string;
//   cep: string;
//   street: string;
//   neighborhood: string;
//   number: string;
//   complement?: string;
//   email: string;
//   city: string;
//   state: string;

//   // Dados bancários
//   bank: string;
//   agency: string;
//   agencyDigit: string;
//   account: string;
//   accountDigit: string;

//   // Dados da CNH
//   cnhNumber: string;
//   cnhCategory: string;
//   cnhRegister: string;
//   cnhExpirationDate: string;

//   // Evento opcional
//   onEditPhoto?: () => void;
// }

export interface ClientInfoCardProps {
  data: ClientInfoCardData;
  setData: React.Dispatch<React.SetStateAction<ClientInfoCardData>>;
}

export type ClientInfoCardData = z.infer<typeof clientInfoCardSchema>;

export const clientInfoCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  street: z.string().min(1, 'Rua é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  email: z.email('E-mail inválido'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),

  bank: z.string().min(1, 'Banco é obrigatório'),
  agency: z.string().min(1, 'Agência é obrigatória'),
  agencyDigit: z.string().min(1, 'Dígito da agência é obrigatório'),
  account: z.string().min(1, 'Conta é obrigatória'),
  accountDigit: z.string().min(1, 'Dígito da conta é obrigatório'),

  cnhNumber: z.string().min(1, 'Número da CNH é obrigatório'),
  cnhCategory: z.string().min(1, 'Categoria é obrigatória'),
  cnhRegister: z.string().min(1, 'Registro é obrigatório'),
  cnhExpirationDate: z.string().min(1, 'Validade é obrigatória'),
});
