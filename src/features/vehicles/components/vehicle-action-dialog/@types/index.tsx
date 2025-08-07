export interface VehicleActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string | number | null;
}
