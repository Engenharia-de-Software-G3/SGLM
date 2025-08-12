import { api } from "@/lib/axios"
import { CreateClientInterface, ListManyClients, ListManyClientsResponse, SingleClientResponse, UpdateClientInterface,  } from "./types"
import { formatCPF } from "../utils/formatCpf"

export async function getClientsFunction(): Promise<ListManyClients> {
    const response = await api.get('/clientes')

    if (response.status !== 200) {
        throw new Error('Erro ao buscar clientes')
    }

    const data = response.data as ListManyClientsResponse

    const clientes = data.clientes.map((cliente) => {
        return {
            ...cliente,
            id: Number(cliente.id),
            cpf: formatCPF(cliente.id),
        }
    })

    return {
        ...data,
        clientes,
    }
}

export async function createClientFunction(payload: CreateClientInterface) {
    const response = await api.post('/clientes', payload)

    if (response.status === 201) {
        return response.data
    }

    return null
}

export async function getClientFunction(id: number) {
    const response = await api.get(`/clientes/${id}`)

    return response.data.cliente as SingleClientResponse
}

export async function updateClientFunction(id: number, payload: UpdateClientInterface) {
    const response = await api.put(`/clientes/${id}`, payload)

    if (response.status !== 200) {
        throw new Error('Erro ao atualizar cliente')
    }

    return null
}

export async function deleteClientFunction(id: number) {
    const response = await api.delete(`/clientes/${id}`)

    if (response.status !== 200) {
        throw new Error('Erro ao deletar cliente')
    }

    return null
}