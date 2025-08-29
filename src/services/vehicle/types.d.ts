export interface VehicleData {
  id: string;
  chassi: string;
  placa: string;
  modelo: string;
  marca: string;
  renavam: string;
  ano: string;
  cor: string;
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

export interface GetVehiclesParams {
  status?: StatusVehicle;
  page?: number;
  search?: string;
}

export interface CreateVehicleInterface extends Omit<VehicleData, 'id'> {
  file?: File | null;
};

// Remove o id, chassi e placa para update
export type UpdateVehicleInterface = Partial<Omit<VehicleData, 'id' | 'chassi' | 'placa'>>;

export type SingleVehicleResponse = VehicleData;

export interface ListManyVehiclesResponse {
  veiculos: VehicleData[];
  paginacao: {
    possuiMais: boolean;
    proximoDocId: string;
  };
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

export type StatusVehicle = 'disponivel' | 'locado' | 'manutencao'
