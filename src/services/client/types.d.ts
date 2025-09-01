export interface ClientData {
<<<<<<< HEAD
  id: number;
  cpf: string;
  nomeCompleto: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  rg?: string;
  cnpj?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  profissao?: string;
}
=======
    id: number;
    cpf: string;
    nomeCompleto: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    rg?: string;
    cnpj?: string;
    nacionalidade?: string;
    estadoCivil?: string;
    profissao?: string;
  }
  
  export interface CreateClientInterface {
    cpf: string;
    nomeCompleto: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    rg?: string;
    cnpj?: string;
    nacionalidade?: string;
    estadoCivil?: string;
    profissao?: string;
  }
  
  export interface UpdateClientInterface {
    nomeCompleto?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    rg?: string;
    cnpj?: string;
    nacionalidade?: string;
    estadoCivil?: string;
    profissao?: string;
  }
  
  export interface SingleClientResponse {
    id: string;
    cpf: string;
    nomeCompleto: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    rg?: string;
    cnpj?: string;
    nacionalidade?: string;
    estadoCivil?: string;
    profissao?: string;
  }
  
  export interface ListManyClientsResponse {
    clientes: ClientData[];
    ultimoDoc?: string | null;
  }
  
>>>>>>> develop

export interface CreateClientInterface {
  cpf: string;
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
  endereco?:
    | string
    | {
        cep: string;
        rua: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
      };
  rg?: string;
  cnpj?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  profissao?: string;
  dadosPessoais?: {
    nome: string;
    dataNascimento: string;
  };
  contato?: {
    email?: string;
    telefone?: string;
  };
  documentos?: {
    cnh?: {
      numero: string;
      categoria: string;
      dataValidade: string;
      tipo?: string;
    };
  };
}

export interface UpdateClientInterface {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  rg?: string;
  cnpj?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  profissao?: string;
}

export interface SingleClientResponse {
  id: number;
  cpf: string;
  nomeCompleto: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  rg?: string;
  cnpj?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  profissao?: string;
  dataNascimento?: string;
  enderecos?: {
    principal?: {
      cep?: string;
      rua?: string;
      numero?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
    };
  };
  documentos?: {
    cnh?: {
      numero?: string;
      categoria?: string;
      dataValidade?: string;
      tipo?: string;
    };
  };
}

export interface ListManyClientsResponse {
  clientes: ClientData[];
  ultimoDoc?: string | null;
}

export type ListManyClients = ListManyClientsResponse;
