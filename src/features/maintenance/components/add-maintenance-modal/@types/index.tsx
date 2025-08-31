export interface AddMaintenanceModalProps {
  trigger: React.ReactNode;
  onAdd: (data: MaintenanceFormData) => void;
}

export interface MaintenanceFormData {
  name: string;
  supplier: string;
  plate: string;
  date: string;
  value: string;
  mileage: string;
}
