import { StatusVehicle } from "@/services/vehicle/types";

export interface VeiculoFormulario {
  marca: string;
  modelo: string;
  placa: string;
  ano: string;
  cor: string;
  chassi: string;
  quilometragemAtual: string;
  quilometragemCompra: string;
  dataCompra: string;
  local: string;
  nome: string;
  observacoes: string;
  status: StatusVehicle;
  arquivo?: File | null;
}