import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClientFunction, deleteClientFunction, getClientFunction, getClientsFunction, updateClientFunction } from "./functions";
import { UpdateClientInterface } from "./types";

export function useClientsQuery() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: getClientsFunction,
    })
}

export function useCreateClientMutation() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: createClientFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })
}

export function useUpdateClientMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, payload}: {id: number, payload: UpdateClientInterface}) => updateClientFunction(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })
}

export function useGetClientQuery(id: number) {
    return useQuery({
        queryKey: ['client', id],
        queryFn: () => getClientFunction(id),
    })
}

export function useDeleteClientMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteClientFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })
}