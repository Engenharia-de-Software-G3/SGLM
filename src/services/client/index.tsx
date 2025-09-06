import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createClientFunction,
  deleteClientFunction,
  getClientFunction,
  getClientsFunction,
  updateClientFunction,
} from './functions';
import { AtualizarClienteParams } from './types';

export function useClientsQuery() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: getClientsFunction,
  });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClientFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarClienteParams }) =>
      updateClientFunction(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', id] });
    },
  });
}

export function useGetClientQuery(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => getClientFunction(id),
  });
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClientFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
