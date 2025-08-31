import axios from 'axios';
import { CreateManutencaoRequest, GetManutencoesResponse, Manutencao } from './types';

const API_URL = `${import.meta.env.VITE_API_URL}/manutencoes`;

export async function createManutencao(payload: CreateManutencaoRequest): Promise<Manutencao> {
  const { data } = await axios.post<Manutencao>(API_URL, payload);
  return data;
}

export async function getManutencoes(): Promise<GetManutencoesResponse> {
  const { data } = await axios.get<GetManutencoesResponse>(API_URL);
  console.log('Resposta da API:', data);
  return data;
}

export async function deleteManutencao(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
