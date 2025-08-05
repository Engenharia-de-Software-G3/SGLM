import type { VeiculoFormulario } from '@/features/vehicles/types/index';

export interface AddVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VeiculoFormulario) => void;
}
