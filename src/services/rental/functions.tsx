import { api } from "@/lib/axios";
import { 
  CreateLocacaoInterface, 
  ListManyLocacoes, 
  UpdateLocacaoInterface,
  LocacaoInterface
} from "./types";
import { formatDate } from "../utils/formatDate";

// Função para listar locações
export async function getLocacoesFunction(): Promise<ListManyLocacoes> {
    const response = await api.get<ListManyLocacoes | LocacaoInterface[]>('/locacoes');

    if (response.status !== 200) {
        throw new Error('Erro ao buscar locações');
    }

    const raw = response.data;

    // Suporte a diferentes formatos de resposta
    let locacoesRaw: LocacaoInterface[] = [];
    let ultimoDoc: string | null = null;

    if (Array.isArray((raw as any)?.locacoes)) {
        locacoesRaw = (raw as any).locacoes;
        ultimoDoc = (raw as any).ultimoDoc ?? null;
    } else if (Array.isArray(raw)) {
        locacoesRaw = raw;
    }

    const locacoes: LocacaoInterface[] = locacoesRaw.map((locacao) => {
        const valorNumber = Number(locacao.valor ?? 0);
        return {
            ...locacao,
            valor: isNaN(valorNumber) ? 0 : valorNumber,
            dataInicio: formatDate(locacao.dataInicio ?? ''),
            dataFim: formatDate(locacao.dataFim ?? ''),
        };
    });

    return { locacoes, ultimoDoc };
}

// Função para criar locação
export async function createLocacaoFunction(payload: CreateLocacaoInterface): Promise<LocacaoInterface> {
    const response = await api.post<LocacaoInterface>('/locacoes', payload);

    if (response.status !== 201) {
        throw new Error('Erro ao criar locação');
    }

    return response.data;
}

// Função para buscar locação por id
export async function getLocacaoFunction(id: string): Promise<LocacaoInterface> {
    const response = await api.get<LocacaoInterface>(`/locacoes/${id}`);

    if (response.status !== 200) {
        throw new Error('Erro ao buscar locação');
    }

    const data = response.data;

    return {
        ...data,
        valor: Number(data.valor),
        dataInicio: formatDate(data.dataInicio),
        dataFim: formatDate(data.dataFim),
    };
}

// Função para atualizar locação
export async function updateLocacaoFunction(id: string, payload: UpdateLocacaoInterface): Promise<LocacaoInterface> {
    const response = await api.put<LocacaoInterface>(`/locacoes/${id}`, payload);

    if (response.status !== 200) {
        throw new Error('Erro ao atualizar locação');
    }

    return response.data;
}

// Função para deletar locação
export async function deleteLocacaoFunction(id: string): Promise<void> {
    const response = await api.delete(`/locacoes/${id}`);

    if (response.status !== 200) {
        throw new Error('Erro ao deletar locação');
    }
}
