import { z } from 'zod';

export interface NewClient extends StepOneData, StepTwoData, StepThreeData {
  id: number;
  name: string;
  description: string;
  status: string;
  statusColor: string;
}

export interface RegisterStepIndicatorProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setShowSuccess: (value: boolean) => void;
  onFinish?: (newClient: NewClient) => void;
}

export type StepOneData = z.infer<typeof stepOneSchema>;
export type StepTwoData = z.infer<typeof stepTwoSchema>;
export type StepThreeData = z.infer<typeof stepThreeSchema>;

// Step 1 - Dados Pessoais
export const stepOneSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  cpfcnpj: z.string().min(1, 'CPF é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  rua: z.string().min(1, 'Rua é obrigatória'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  email: z.email('E-mail inválido'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
});

// Step 2 - Dados Bancários
export const stepTwoSchema = z.object({
  banco: z.string().min(1, 'Banco é obrigatório'),
  agencia: z.string().min(1, 'Agência é obrigatória'),
  digitoAgencia: z.string().min(1, 'Dígito da agência é obrigatório'),
  conta: z.string().min(1, 'Conta é obrigatória'),
  digitoConta: z.string().min(1, 'Dígito da conta é obrigatório'),
});

// Step 3 - CNH
export const stepThreeSchema = z.object({
  cnhNumero: z.string().min(1, 'Número da CNH é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  registro: z.string().min(1, 'Registro é obrigatório'),
  validade: z.string().min(1, 'Validade é obrigatória'),
});

export const initialStepOneData: StepOneData = {
  nome: '',
  dataNascimento: '',
  cpfcnpj: '',
  telefone: '',
  cep: '',
  rua: '',
  bairro: '',
  numero: '',
  complemento: '',
  email: '',
  cidade: '',
  estado: '',
};

export const initialStepTwoData: StepTwoData = {
  banco: '',
  agencia: '',
  digitoAgencia: '',
  conta: '',
  digitoConta: '',
};

export const initialStepThreeData: StepThreeData = {
  cnhNumero: '',
  categoria: '',
  registro: '',
  validade: '',
};
