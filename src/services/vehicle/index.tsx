import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVehicleFunction,
  deleteVehicleFunction,
  getVehicleFunction,
  getVehiclesFunction,
  updateVehicleFunction,
} from './functions';
import { UpdateVehicleInterface } from './types';

export function useVehiclesQuery() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehiclesFunction,
  });
}

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicleFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVehicleInterface }) =>
      updateVehicleFunction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useGetVehicleQuery(id: number) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleFunction(id),
  });
}

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicleFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
