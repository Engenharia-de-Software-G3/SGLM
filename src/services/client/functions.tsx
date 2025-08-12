// /home/user/Documentos/es/SGLM/src/services/client/functions.tsx
import { api } from "@/lib/axios";
import {
  ClientData,
  CreateClientInterface,
  ListManyClients,
  ListManyClientsResponse,
  SingleClientResponse,
  UpdateClientInterface,
} from "./types";
import { formatCPF } from "../utils/formatCpf";
import { useQuery } from '@tanstack/react-query';

export async function getClientsFunction(): Promise<ListManyClients> {
  const response = await api.get('/clientes');

  if (response.status !== 200) {
    throw new Error('Erro ao buscar clientes');
  }

  const data = response.data as ListManyClientsResponse;

  const clientes = data.clientes.map((cliente) => ({
    ...cliente,
    id: Number(cliente.id),
    cpf: formatCPF(cliente.cpf), // Changed from cliente.id to cliente.cpf
  }));

  return {
    ...data,
    clientes,
  };
}

export async function createClientFunction(payload: CreateClientInterface) {
  const response = await api.post('/clientes', payload);

  if (response.status === 201) {
    return response.data;
  }

  return null;
}

export async function getClientFunction(id: number) {
  const response = await api.get(`/clientes/${id}`);

  return response.data.cliente as SingleClientResponse;
}

export async function updateClientFunction(id: number, payload: UpdateClientInterface) {
  const response = await api.put(`/clientes/${id}`, payload);

  if (response.status !== 200) {
    throw new Error('Erro ao atualizar cliente');
  }

  return null;
}

export async function deleteClientFunction(id: number) {
  const response = await api.delete(`/clientes/${id}`);

  if (response.status !== 200) {
    throw new Error('Erro ao deletar cliente');
  }

  return null;
}

export async function getClientByCpf(cpf: string): Promise<SingleClientResponse> {
  try {
    const cleanCpf = cpf.replace(/\D/g, '');
    const response = await api.get('/clientes', {
      params: {
        filtros: JSON.stringify({ cpf: cleanCpf }),
      },
    });
    const clientes = response.data.clientes as ClientData[];
    if (clientes.length === 0) {
      throw new Error('Cliente não encontrado');
    }
    return clientes[0];
  } catch (error) {
    console.error('Erro ao buscar cliente por CPF:', error);
    throw new Error('Erro ao buscar cliente por CPF');
  }
}

export function useClientsQuery() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const response = await api.get('/clientes');
      return response.data as ListManyClientsResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}