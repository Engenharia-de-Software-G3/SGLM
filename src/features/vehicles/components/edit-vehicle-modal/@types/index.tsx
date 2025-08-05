import type { VeiculoFormulario } from '@/features/vehicles/types';

export interface VehicleEdit {
  id: number;
  brand: string;
  model: string;
  plate: string;
  status: 'Disponível' | 'Locado' | 'Manutenção';
  statusColor: string;
  currentMileage: number;
  initialMileage: number;
  year: number;
  color: string;
  fuel: string;
  category: string;
  renavam: string;
  chassis: string;
  engine: string;
  doors: number;
  seats: number;
  transmission: string;
  acquisitionDate: string;
  acquisitionValue: number;
  dailyRate: number;
  insuranceCompany: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  licensePlateExpiry: string;
  nextMaintenanceKm: number;
}

export interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VeiculoFormulario) => void;
  vehicle: VehicleEdit | null;
}
