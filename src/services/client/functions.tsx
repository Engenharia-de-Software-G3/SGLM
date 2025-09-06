import { api } from '@/lib/axios';
import {
  ClienteData,
  ClienteCompleto,
  ClienteCompletoResponse,
  ListarClientesResponse,
  AtualizarClienteParams,
  ClienteResponse,
} from './types';
import { formatCPF } from '../utils/formatCpf';
import { useQuery } from '@tanstack/react-query';

export async function getClientsFunction(): Promise<ListarClientesResponse> {
  const response = await api.get('/clientes');

  if (response.status !== 200) {
    throw new Error('Erro ao buscar clientes');
  }

  const data = response.data as ListarClientesResponse;

  const clientes = data.clientes.map((cliente) => ({
    ...cliente,
    id: cliente.id,
    cpf: formatCPF(cliente.cpf), // Changed from cliente.id to cliente.cpf
  }));

  return {
    ...data,
    clientes,
  };
}

export async function createClientFunction(payload: ClienteData): Promise<ClienteResponse> {
  const response = await api.post('/clientes', payload);

  if (response.status === 201) {
    return response.data;
  }

  return { success: false, error: 'Erro ao criar cliente' };
}

export async function getClientFunction(id: string): Promise<ClienteCompletoResponse> {
  const response = await api.get(`/clientes/${id}`);

  return response.data as ClienteCompletoResponse;
}

export async function updateClientFunction(
  id: string,
  payload: AtualizarClienteParams,
): Promise<ClienteResponse> {
  const response = await api.put(`/clientes/${id}`, payload);

  console.log('Should send', payload);

  if (response.status !== 200) {
    return { success: false, error: 'Erro ao atualizar cliente' };
  }

  return { success: true };
}

export async function deleteClientFunction(id: string): Promise<ClienteResponse> {
  const response = await api.delete(`/clientes/${id}`);

  if (response.status !== 200) {
    return { success: false, error: 'Erro ao deletar cliente' };
  }

  return { success: true };
}

export async function getClientByCpf(cpf: string): Promise<ClienteCompleto> {
  try {
    if (!cpf || cpf.trim() === '') throw new Error('CPF não fornecido');

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf === '') throw new Error('CPF inválido');

    const response = await api.get(`/clientes/${cleanCpf}`);
    console.log(response);
    console.log('\n ---- espaço ---- \n');

    const cliente = response?.data?.cliente as ClienteCompleto;

    return cliente;
  } catch (error) {
    console.error('Erro ao buscar cliente por CPF:', error);
    throw error;
  }
}

export function useClientsQuery() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const response = await api.get('/clientes');
      return response.data as ListarClientesResponse;
    },
    staleTime: 1000 * 60 * 5,
  });
}
