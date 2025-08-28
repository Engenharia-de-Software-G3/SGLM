import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createVehicleFunction,
  deleteVehicleFunction,
  getVehicleFunction,
  getVehiclesFunction,
  updateVehicleFunction,
} from './functions';
import { CreateVehicleInterface, GetVehiclesParams, StatusVehicle, UpdateVehicleInterface } from './types';
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
export function useVehiclesQuery(params?: GetVehiclesParams) {
  if (!params) {
    params = {
      status: undefined,
      page: undefined,
      search: undefined,
    };
  }
  let { status, page, search } = params;

  if (status === 'all' || status === '' || !status) {
    status = undefined;
  }

  if (search === '' || !search) {
    search = undefined;
  }

  if (page === 0 || !page) {
    page = undefined;
  }

  status = status?.toLocaleLowerCase();

  return useQuery({
    queryKey: ['vehicles', status, page, search],
    queryFn: () => getVehiclesFunction({status, page, search}),
    retry: 3,
    retryDelay: 1000,
  });
}
