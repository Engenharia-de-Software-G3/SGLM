import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { 
  createLocacaoFunction, 
  deleteLocacaoFunction, 
  getLocacaoFunction, 
  getLocacoesFunction, 
  updateLocacaoFunction 
} from "./functions";
import { UpdateLocacaoInterface, ListManyLocacoes, LocacaoInterface, CreateLocacaoInterface } from "./types";

export function useLocacoesQuery():  UseQueryResult<ListManyLocacoes, Error> {
    return useQuery({
        queryKey: ['locacoes'],
        queryFn: getLocacoesFunction,
    });
}

export function useCreateLocacaoMutation(): UseMutationResult<LocacaoInterface, Error, CreateLocacaoInterface> {
    const queryClient = useQueryClient();
    
    return useMutation<LocacaoInterface, Error, CreateLocacaoInterface>({
        mutationFn: createLocacaoFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locacoes'] });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        }
    });
}

export function useUpdateLocacaoMutation():  UseMutationResult<LocacaoInterface, Error, {id: string, payload: UpdateLocacaoInterface}> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, payload}: {id: string, payload: UpdateLocacaoInterface}) => 
            updateLocacaoFunction(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locacoes'] });
        }
    });
}

export function useGetLocacaoQuery(id: string): UseQueryResult<LocacaoInterface, Error> {
    return useQuery({
        queryKey: ['locacao', id],
        queryFn: () => getLocacaoFunction(id),
    });
}

export function useDeleteLocacaoMutation(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: deleteLocacaoFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locacoes'] });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        }
    });
}