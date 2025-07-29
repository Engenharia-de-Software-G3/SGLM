export interface AddVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehicleFormData) => void;
}

export interface VehicleFormData {
  placa: string;
  marca: string;
  modelo: string;
  chassi: string;
  anoModelo: string;
  quilometragemCompra: string;
  numeroDocumento: string;
  dataCompra: string;
  quilometragemAtual: string;
  dataAtual: string;
  local: string;
  nome: string;
  observacoes: string;
}
