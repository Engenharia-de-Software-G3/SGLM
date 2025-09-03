import { VehicleData } from '@/services/vehicle/types';

export interface VehicleActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleData | null;
  onFilterByVehicle: () => void;
  onSave: (data: Partial<VehicleData>) => void;
}
