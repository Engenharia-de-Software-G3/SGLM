// /home/user/Documentos/es/SGLM/src/services/vehicle/functions.tsx
import { api } from "@/lib/axios";
import { ListManyVehicles, VehicleData } from "./types";
import { useQuery } from '@tanstack/react-query';

export async function getVehiclesFunction(): Promise<ListManyVehicles> {
  const response = await api.get('/veiculos');

  if (response.status !== 200) {
    throw new Error('Erro ao buscar veículos');
  }

  const data = response.data as ListManyVehicles;

  return {
    ...data,
    vehicles: data.vehicles.map((vehicle) => ({
      ...vehicle,
      id: Number(vehicle.id),
    })),
  };
}

export async function getVehicleByPlaca(placa: string): Promise<VehicleData> {
  try {
    const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const response = await api.get('/veiculos', {
      params: {
        filtros: JSON.stringify({ placa: cleanPlaca }),
      },
    });
    const vehicles = response.data.vehicles as VehicleData[];
    if (vehicles.length === 0) {
      throw new Error('Veículo não encontrado');
    }
    return vehicles[0];
  } catch (error) {
    console.error('Erro ao buscar veículo por placa:', error);
    throw new Error('Erro ao buscar veículo por placa');
  }
}

export function useVehiclesQuery() {
  return useQuery({
    queryKey: ['veiculos'],
    queryFn: async () => {
      const response = await api.get('/veiculos');
      return response.data as ListManyVehicles;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}