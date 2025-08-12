// /home/user/Documentos/es/SGLM/src/services/vehicle/types.d.ts
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

export interface ListManyVehiclesResponse {
  vehicles: VehicleData[];
  ultimoDoc?: string | null;
}

export interface ListManyVehicles extends ListManyVehiclesResponse {}