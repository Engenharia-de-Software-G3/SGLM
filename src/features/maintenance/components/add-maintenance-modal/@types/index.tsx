import { CreateManutencaoRequest } from '@/services/maintenance/types';

export interface AddMaintenanceModalProps {
  trigger: React.ReactNode;
  onAdd: (data: CreateManutencaoRequest) => void;
}

export interface MaintenanceFormData {
  name: string;
  supplier: string;
  plate: string;
  date: string;
  value: string;
  mileage: string;
}
