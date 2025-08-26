export interface LocacaoInterface {
  id: string;
  clienteId: string;
  placaVeiculo: string;
  dataInicio: string;
  dataFim: string;
  valor: number | string; // Allow string for backend response, converted to number
  periodicidadePagamento: string;
 // metodoPagamento: string;
  status?: 'ativa' | 'finalizada' | 'cancelada';
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface ListManyLocacoes {
  locacoes: LocacaoInterface[];
  ultimoDoc?: string | null;
}

export interface CreateLocacaoInterface {
  cpfLocatario: string;
  placaVeiculo: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
  periodicidadePagamento: string;
  //metodoPagamento: string;
}

export interface UpdateLocacaoInterface {
  cpfLocatario?: string;
  placaVeiculo?: string;
  dataInicio?: string;
  dataFim?: string;
  valor?: number;
  periodicidadePagamento?: string;
  //metodoPagamento: string;
  status?: 'ativa' | 'finalizada' | 'cancelada';
}