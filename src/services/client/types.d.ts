// /home/user/Documentos/es/SGLM/src/services/client/types.d.ts
export interface ClientData {
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
  
  export interface ListManyClientsResponse {
    clientes: ClientData[];
    ultimoDoc?: string | null;
  }
  

  
  export interface ListManyClients extends ListManyClientsResponse {}