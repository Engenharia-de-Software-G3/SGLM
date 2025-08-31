import axios from 'axios';
import { CreateManutencaoRequest, Manutencao } from './types';

const API_URL = `${import.meta.env.VITE_API_URL}/manutencoes`;

export async function createManutencao(payload: CreateManutencaoRequest): Promise<Manutencao> {
  const { data } = await axios.post<Manutencao>(API_URL, payload);
  return data;
}

export async function getManutencoes(): Promise<Manutencao[]> {
  const { data } = await axios.get(API_URL);
  console.log('Raw API response:', data);

  if (data && data.manutencoes && Array.isArray(data.manutencoes)) {
    console.log('Using data.manutencoes:', data.manutencoes);
    return data.manutencoes;
  }

  if (Array.isArray(data)) {
    console.log('Using direct array:', data);
    return data;
  }

  console.warn('Unexpected API response format, returning empty array');
  return [];
}

export async function deleteManutencao(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
