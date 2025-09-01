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
import { formatDateToServer } from "../vehicle/functions";

export async function getClientsFunction(): Promise<ListManyClients> {
  const response = await api.get('/clientes');

  if (response.status !== 200) {
    throw new Error('Erro ao buscar clientes');
  }

  const data = response.data as ListManyClientsResponse;

  const clientes = data.clientes.map((cliente) => ({
    ...cliente,
<<<<<<< HEAD
    id: Number(cliente.id),
    cpf: formatCPF(cliente.cpf), 
=======
    id: cliente.id,
    cpf: formatCPF(cliente.cpf), // Changed from cliente.id to cliente.cpf
>>>>>>> develop
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

export async function getClientFunction(id: string) {
  const response = await api.get(`/clientes/${id}`);

  return response.data.cliente as SingleClientResponse;
}

export async function updateClientFunction(id: string, payload: UpdateClientInterface) {
  
  const send = {
    cpf: payload.cpf,
    dadosPessoais: {
      nome: payload.nomeCompleto,
      dataNascimento: formatDateToServer(payload.dataNascimento),
    },
    endereco: {
      cep: payload.enderecos.principal.cep,
      rua: payload.enderecos.principal.rua,
      numero: payload.enderecos.principal.numero,
      bairro: payload.enderecos.principal.bairro,
      cidade: payload.enderecos.principal.cidade,
      estado: payload.enderecos.principal.estado,
    },
    contato: {
      email: payload.email,
      telefone: payload.telefone,
    },
    documentos: {
      cnh: {
        numero: payload.documentos?.cnh?.numero,
        categoria: payload.documentos?.cnh?.categoria,
        dataValidade: formatDateToServer(payload.documentos?.cnh?.dataValidade),
        tipo: payload.documentos?.cnh?.tipo,
      },
    },
  }
  const response = await api.put(`/clientes/${id}`, send);
  
  console.log('Should send', send);

  if (response.status !== 200) {
    throw new Error('Erro ao atualizar cliente');
  }

  return null;
}

export async function deleteClientFunction(id: string) {
  const response = await api.delete(`/clientes/${id}`);

  if (response.status !== 200) {
    throw new Error('Erro ao deletar cliente');
  }

  return null;
}

export async function getClientByCpf(cpf: string): Promise<SingleClientResponse> {
  try {
    if (!cpf || cpf.trim() === '') throw new Error('CPF não fornecido');
    
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf === '') throw new Error('CPF inválido');

    const response = await api.get('/clientes', {
      params: {
        filtros: JSON.stringify({ cpf: cleanCpf }),
      },
    });
    
    const clientes = response.data.clientes as ClientData[];

    console.log('CPF buscado:', cleanCpf);
    console.log('Número de clientes retornados:', response.data.clientes.length);
    console.log('Todos os clientes:', response.data.clientes);
    
    if (clientes.length === 0) {
      throw new Error('Cliente não encontrado');
    }
    

    const clienteEncontrado = clientes.find(cliente => {
      const clienteCpfClean = cliente.cpf.replace(/\D/g, '');
      return clienteCpfClean === cleanCpf;
    });
    
    if (!clienteEncontrado) {
      throw new Error('Cliente não encontrado');
    }
    
    console.log('Cliente encontrado:', clienteEncontrado.nomeCompleto);
    return clienteEncontrado;
    
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
      return response.data as ListManyClientsResponse;
    },
    staleTime: 1000 * 60 * 5, 
  });
}