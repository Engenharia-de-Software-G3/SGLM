export interface CreateClientInterface {
    cpf: string; 
    dadosPessoais: {
        nome: string; 
        dataNascimento: string; 
    };
    endereco: {
        cep: string; 
        rua: string; 
        numero: string; 
        bairro: string; 
        cidade: string; 
        estado: string; 
    };
    contato: {
        email: string; 
        telefone: string; 
    };
    documentos?: {
        cnh?: {
            numero: string; 
            categoria: string; 
            dataValidade: string; 
        };
    };
}

export interface UpdateClientInterface {
    dadosPessoais?: {
        nome?: string; 
        dataNascimento?: string; 
    };
    endereco?: {
        cep: string; 
        rua: string; 
        numero: string; 
        bairro: string; 
        cidade: string; 
        estado: string; 
    };
    contato?: {
        email: string; 
        telefone: string; 
    };
    documentos?: {
        cnh?: {
            numero?: string; 
            categoria?: string; 
            dataValidade?: string; 
        };
    };
}

export interface ListManyClientsResponseClient {
    dataNascimento: string; // Format: "DD/MM/YYYY"
    id: string;            // CPF or other ID
    nomeCompleto: string;
    status: "ativo" | "inativo" | "pendente" | "bloqueado"; // Add all possible statuses
    tipo: "PF" | "PJ"; // Only these two options if applicable
}

export interface ListManyClientsResponse {
    clientes: ListManyClientsResponseClient[];
    paginacao: {
        possuiMais: boolean;
        ultimoDocId: string;
    }
}

export interface ListManyClientsClient {
    cpf: string;
    dataNascimento: string;
    id: number;
    nomeCompleto: string;
    status: "ativo" | "inativo" | "pendente" | "bloqueado";
    tipo: "PF" | "PJ";
}

export interface ListManyClients {
    clientes: ListManyClientsClient[];
    paginacao: {
        possuiMais: boolean;
        ultimoDocId: string;
    }
}