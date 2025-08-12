export interface LocacaoInterface {
  id: string;
  clienteId: string;
  nomeLocatario: string;
  placaVeiculo: string;
  dataInicio: string;
  dataFim: string;
  valor: number | string; // Allow string for backend response, converted to number
  periodicidadePagamento: string;
  status?: 'ativa' | 'finalizada' | 'cancelada';
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface ListManyLocacoes {
  locacoes: LocacaoInterface[];
  ultimoDoc?: string | null;
}

export interface CreateLocacaoInterface {
  clienteId: string;
  nomeLocatario: string;
  placaVeiculo: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
  periodicidadePagamento: string;
}

export interface UpdateLocacaoInterface {
  clienteId?: string;
  nomeLocatario?: string;
  placaVeiculo?: string;
  dataInicio?: string;
  dataFim?: string;
  valor?: number;
  periodicidadePagamento?: string;
  status?: 'ativa' | 'finalizada' | 'cancelada';
}