import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVehicleFunction,
  deleteVehicleFunction,
  getVehicleFunction,
  getVehiclesFunction,
  updateVehicleFunction,
} from './functions';
import { CreateVehicleInterface, UpdateVehicleInterface } from './types';

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehicleInterface) => createVehicleFunction(payload),
    onSuccess: () => {
      console.log('✅ Vehicle created, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) => {
      console.error('❌ Create vehicle mutation error:', error);
    },
  });
}

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chassi, payload }: { chassi: string; payload: UpdateVehicleInterface }) =>
      updateVehicleFunction(chassi, payload),
    onSuccess: () => {
      console.log('✅ Vehicle updated, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) => {
      console.error('❌ Update vehicle mutation error:', error);
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chassi: string) => deleteVehicleFunction(chassi),
    onSuccess: () => {
      console.log('✅ Vehicle deleted, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) => {
      console.error('❌ Delete vehicle mutation error:', error);
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
          status: 'Concluído',
          statusColor: 'text-green-600',
        },
      ];
    },
    enabled: !!chassi,
  });
}
export function useVehiclesQuery() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehiclesFunction,
    retry: 3,
    retryDelay: 1000,
  });
}
