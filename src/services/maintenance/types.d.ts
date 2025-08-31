export interface CreateManutencaoRequest {
  placaVeiculo: string;
  nomeServico: string;
  valor: number;
}

export interface Manutencao {
  id: string;
  nomeServico: string;
  placaVeiculo: string;
  valor: number;
  quilometragem: number;
  data: string;
}

export interface GetManutencoesResponse {
  manutencoes: Manutencao[];
}
