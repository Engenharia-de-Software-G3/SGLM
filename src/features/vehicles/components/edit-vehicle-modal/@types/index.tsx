import type { VeiculoFormulario } from '@/features/vehicles/types';
import { VehicleData } from '@/services/vehicle/types';

export interface VeiculoEditado {
  id: number;
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
  status: 'Disponível' | 'Locado' | 'Manutenção';
  statusColor: string;
  arquivo?: File | null;
}

export interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VeiculoFormulario) => void;
  vehicle:  VehicleData| null;
}