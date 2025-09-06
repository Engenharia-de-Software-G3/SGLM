// TypeScript interfaces for firestoreClientes.js parameters

export interface ClienteData {
  cpf: string; // CPF format: 'XXX.XXX.XXX-XX'
  dadosPessoais: DadosPessoais;
  endereco: Endereco;
  contato: Contato;
  documentos: Documentos;
  dadosBancarios: DadosBancarios;
}

export interface DadosPessoais {
  nome: string; // Full name
  dataNascimento: string; // Date format: 'YYYY-MM-DD'
}

export interface Endereco {
  cep: string; // CEP format: 'XXXXX-XXX'
  rua: string; // Street name
  numero: string; // House number
  bairro: string; // Neighborhood
  cidade: string; // City
  estado: string; // State abbreviation (e.g., 'SP')
}

export interface Contato {
  email: string; // Valid email
  telefone: string; // Phone format: '(XX) XXXXX-XXXX'
}

export interface Documentos {
  cnh?: CNH;
}

export interface CNH {
  numero: string; // CNH number
  categoria: string; // Category (e.g., 'AB')
  dataValidade: string; // Date format: 'YYYY-MM-DD'
}

export interface DadosBancarios {
  banco: string; // Bank name
  agencia: string; // Agency number
  agenciaDigito: string; // Agency digit
  conta: string; // Account number
  contaDigito: string; // Account digit
}

export interface ListarClientesParams {
  limite?: number; // Maximum number of results (default: 10)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ultimoDoc?: any; // Last document from previous page (for startAfter)
  filtros?: FiltrosCliente;
}

export interface FiltrosCliente {
  nome?: string; // Name filter (partial case-insensitive search)
  tipo?: 'PF' | 'PJ'; // Client type filter
  cpf?: string; // CPF filter
}

export interface AtualizarClienteParams {
  cpf: string;
  dadosPessoais?: Partial<DadosPessoais>;
  endereco?: Endereco;
  contato?: Contato;
  documentos?: {
    cnh?: CNH;
  };
  dadosBancarios?: DadosBancarios;
}

export interface ClienteResponse {
  success: boolean;
  error?: string;
}

export interface ClienteCompletoResponse extends ClienteResponse {
  cliente?: ClienteCompleto;
}

export interface ListarClientesResponse {
  clientes: ClienteCompleto[];
  paginacao: PaginacaoCliente;
}

export interface PaginacaoCliente {
  possuiMais: boolean;
  ultimoDocId: string;
}

export interface ClienteCompleto {
  id: string; // CPF without formatting
  cpf: string; // CPF with formatting: 'XXX.XXX.XXX-XX'
  tipo: 'PF' | 'PJ';
  nomeCompleto: string;
  dataNascimento: string; // Date format: 'DD/MM/YYYY'
  status: 'ativo' | 'inativo';
  email?: string;
  telefone?: string;
  enderecos?: {
    [key: string]: EnderecoCompleto;
  };
  contatos?: {
    [key: string]: ContatoCompleto;
  };
  documentos?: {
    [key: string]: DocumentoCompleto;
  };
  dadosBancarios?: {
    banco: string;
    agencia: string;
    conta: string;
    dataCriacao?: string; // ISO date string
  };
}

export interface EnderecoCompleto extends Endereco {
  isPrincipal?: boolean;
}

export interface ContatoCompleto extends Contato {
  isPrincipal?: boolean;
}

export interface DocumentoCompleto {
  tipo: string;
  numero: string;
  categoria?: string;
  dataValidade?: string; // Date format: 'DD/MM/YYYY'
}