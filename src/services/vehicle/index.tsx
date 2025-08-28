import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createVehicleFunction,
  deleteVehicleFunction,
  getVehicleFunction,
  getVehiclesFunction,
  updateVehicleFunction,
} from './functions';
import { CreateVehicleInterface, StatusVehicle, UpdateVehicleInterface } from './types';
import { queryClient } from '@/lib/tanstack/query-client';

export function useCreateVehicleMutation() {
  return useMutation({
    mutationFn: (payload: CreateVehicleInterface) => createVehicleFunction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle'] });
    },
  });
}

export function useUpdateVehicleMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehicleInterface }) =>
      updateVehicleFunction(id, payload),
  });
}

export function useGetVehicleQuery(chassi: string) {
  return useQuery({
    queryKey: ['vehicle', chassi],
    queryFn: () => getVehicleFunction(chassi),
    enabled: !!chassi, // Só executa se chassi estiver definido
    retry: 3,
    retryDelay: 1000,
  });
}

export function useDeleteVehicleMutation() {
  return useMutation({
    mutationFn: (chassi: string) => deleteVehicleFunction(chassi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle'] });
    },
  });
}

export function useGetVehicleActivitiesQuery(chassi: string) {
  return useQuery({
    queryKey: ['vehicle-activities', chassi],
    queryFn: async () => {
      return [
        {
          id: 1,
          title: 'Último aluguel finalizado',
          date: '2 dias atrás',
          status: 'concluido' as StatusVehicle,
          statusColor: 'text-green-600',
        },
      ];
    },
    enabled: !!chassi,
  });
}
export function useVehiclesQuery(status?: string) {

  console.log('🔍 Querying by status:', status);
  if (status === 'all' || status === '') {
    status = undefined;
  }

  status = status?.toLocaleLowerCase();

  return useQuery({
    queryKey: ['vehicles', status],
    queryFn: () => getVehiclesFunction(status),
    retry: 3,
    retryDelay: 1000,
  });
}
