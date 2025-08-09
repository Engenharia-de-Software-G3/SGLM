import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createLocacaoFunction, 
  deleteLocacaoFunction, 
  getLocacaoFunction, 
  getLocacoesFunction, 
  updateLocacaoFunction 
} from "./functions";
import { UpdateLocacaoInterface } from "./types";

export function useLocacoesQuery() {
    return useQuery({
        queryKey: ['locacoes'],
        queryFn: getLocacoesFunction,
    });
}

export function useCreateLocacaoMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createLocacaoFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locacoes'] });
        }
    });
}

export function useUpdateLocacaoMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, payload}: {id: string, payload: UpdateLocacaoInterface}) => 
            updateLocacaoFunction(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locacoes'] });
        }
    });
}

export function useGetLocacaoQuery(id: string) {
    return useQuery({
        queryKey: ['locacao', id],
        queryFn: () => getLocacaoFunction(id),
    });
}

export function useDeleteLocacaoMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteLocacaoFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locacoes'] });
        }
    });
}