export interface VehicleData {
  id: number | string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string; // Formato "AAAA/YYYY"
  cor: string;
  chassi: string;
  renavam?: string;
  motor?: string;
  quilometragem?: string;
}

export interface CreateVehicleInterface {
  chassi: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string; // Formato "AAAA/YYYY"
  cor: string;
  renavam?: string;
  motor?: string;
  quilometragemAtual: string;
  quilometragemCompra: string;
  dataCompra: string; // Formato "DD/MM/YYYY"
  local: string;
  nome: string;
  observacoes: string;
}

export interface UpdateVehicleInterface {
  placa?: string;
  quilometragem?: number;
  dataVenda?: string; // Formato "YYYY-MM-DD" para o backend
}

export interface SingleVehicleResponse {
  id: number | string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  chassi: string;
  renavam?: string;
  motor?: string;
  quilometragem?: string;
}

export interface ListManyVehiclesResponse {
  vehicles: VehicleData[];
  ultimoDoc?: string | null;
}

export type ListManyVehicles = ListManyVehiclesResponse;

export interface BackendVehicleData {
  id: string;
  chassi: string;
  placa: string;
  modelo: string;
  marca: string;
  renavam?: string;
  numeroDocumento?: string;
  anoModelo: {
    fabricacao: number;
    modelo: number;
  };
  quilometragem: number;
  quilometragemNaCompra: number;
  dataCompra: string; // ISO format
  dataVenda?: string; // ISO format
  local: string;
  nome: string;
  observacoes: string;
  status: 'disponivel' | 'vendido';
  dataCadastro: string;
  dataAtualizacao: string;
}
export interface VehicleActivity {
  id: number | string;
  title: string;
  date: string;
  status: string;
  statusColor: string;
  description?: string; // Opcional, conforme usado no componente
}
