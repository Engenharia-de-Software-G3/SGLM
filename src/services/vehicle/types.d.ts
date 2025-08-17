// src/services/vehicle/types.d.ts
export interface VehicleData {
  id: number;
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

export interface CreateVehicleInterface {
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

export interface UpdateVehicleInterface {
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
  chassi?: string;
  renavam?: string;
  motor?: string;
  quilometragem?: string;
}

export interface SingleVehicleResponse {
  id: number;
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
