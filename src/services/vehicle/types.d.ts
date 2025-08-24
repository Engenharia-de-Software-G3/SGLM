export interface VehicleData {
  id?: number | string;
  chassi: string;
  placa: string;
  modelo: string;
  marca: string;
  renavam: string;
  anoModelo: {
    fabricacao: string;
    modelo: string;
  };
  quilometragem: string;
  quilometragemNaCompra: string;
  dataCompra: string;
  dataVenda: string;
  local: string;
  nome: string;
  observacoes: string;
  status: StatusVehicle;
  dataCadastro: string;
  dataAtualizacao: string;
}

export type CreateVehicleInterface = VehicleData;

export type UpdateVehicleInterface = Partial<VehicleData>;

export type SingleVehicleResponse = VehicleData;

export interface ListManyVehiclesResponse {
  veiculos: VehicleData[];
  paginacao: {
    possuiMais: boolean;
    proximoDocId: string;
  }
}

export type ListManyVehicles = ListManyVehiclesResponse;
export interface VehicleActivity {
  id: number | string;
  title: string;
  date: string;
  status: StatusVehicle;
  statusColor: string;
  description?: string; // Opcional, conforme usado no componente
}


export type StatusVehicle = 'disponivel' | 'locado' | 'vendido' | 'concluido';