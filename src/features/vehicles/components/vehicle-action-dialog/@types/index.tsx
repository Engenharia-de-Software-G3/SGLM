import type { VeiculoFormulario } from '@/features/vehicles/types';
import { VehicleData } from '@/services/vehicle/types';

export interface VehicleActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleData| null;
  onFilterByVehicle: () => void;
  onSave: (data: VeiculoFormulario) => void;
}