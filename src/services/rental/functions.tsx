import { api } from "@/lib/axios";
import { 
  CreateLocacaoInterface, 
  ListManyLocacoes, 
  ListManyLocacoesResponse, 
  UpdateLocacaoInterface,
  LocacaoInterface
} from "./types";
import { formatDate } from "../utils/formatDate";

export async function getLocacoesFunction(): Promise<ListManyLocacoes> {
    const response = await api.get('/locacoes');

    if (response.status !== 200) {
        throw new Error('Erro ao buscar locações');
    }

    const raw = response.data as unknown;

    // Suporte a diferentes formatos de resposta:
    // 1) { locacoes: LocacaoInterface[], ultimoDoc?: string | null }
    // 2) LocacaoInterface[] direto
    // 3) vazio/indefinido
    const rawLocacoes: unknown = Array.isArray((raw as any)?.locacoes)
        ? (raw as any).locacoes
        : Array.isArray(raw)
            ? raw
            : [];

    const locacoes = (rawLocacoes as any[]).map((locacao) => {
        const valorNumber = Number((locacao as any)?.valor ?? 0);
        return {
            ...(locacao as any),
            valor: isNaN(valorNumber) ? 0 : valorNumber,
            dataInicio: formatDate((locacao as any)?.dataInicio ?? ''),
            dataFim: formatDate((locacao as any)?.dataFim ?? ''),
        } as LocacaoInterface;
    });

    const ultimoDoc = (raw as any)?.ultimoDoc ?? null;

    return {
        locacoes,
        ultimoDoc,
    };
}

export async function createLocacaoFunction(payload: CreateLocacaoInterface) {
    const response = await api.post('/locacoes', payload);

    if (response.status === 201) {
        return response.data;
    }

    return null;
}

export async function getLocacaoFunction(id: string) {
    const response = await api.get(`/locacoes/${id}`);

    if (response.status !== 200) {
        throw new Error('Erro ao buscar locação');
    }

    const data = response.data as LocacaoInterface;
    
    return {
        ...data,
        valor: Number(data.valor),
        dataInicio: formatDate(data.dataInicio),
        dataFim: formatDate(data.dataFim),
    };
}

export async function updateLocacaoFunction(id: string, payload: UpdateLocacaoInterface) {
    const response = await api.put(`/locacoes/${id}`, payload);

    if (response.status !== 200) {
        throw new Error('Erro ao atualizar locação');
    }

    return null;
}

export async function deleteLocacaoFunction(id: string) {
    const response = await api.delete(`/locacoes/${id}`);

    if (response.status !== 200) {
        throw new Error('Erro ao deletar locação');
    }

    return null;
}