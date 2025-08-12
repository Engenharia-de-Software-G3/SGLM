export interface CreateLocacaoInterface {
    cpfLocatario: string;
    nomeLocatario: string;
    placaVeiculo: string;
    dataInicio: string;
    dataFim: string;
    valor: number;
}

export interface LocacaoInterface {
    id: string;
    clienteId: string;          // CPF do cliente (formato: XXX.XXX.XXX-XX)
    nomeLocatario: string;      // Nome do locatário
    veiculoId: string;
    placaVeiculo: string;       // sem hífen
    dataInicio: string;         // formato DD/MM/YYYY
    dataFim: string;            // formato DD/MM/YYYY
    valor: number;
    status: 'ativa' | 'finalizada' | 'cancelada';
    dataCadastro: string;       // ISO
    dataAtualizacao: string;    // ISO
}

export interface UpdateLocacaoInterface {
    dataInicio?: string;
    dataFim?: string;
     valor?: number;
    status?: 'ativa' | 'finalizada' | 'cancelada';
}

export interface ListManyLocacoesResponse {
  locacoes: LocacaoInterface[];
  ultimoDoc: string | null;
}

export interface ListManyLocacoes extends ListManyLocacoesResponse {}