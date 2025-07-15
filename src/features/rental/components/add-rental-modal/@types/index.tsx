interface RentalFormData {
  cpfCnpj: string;
  placa: string;
  dataInicio: string;
  dataFim: string;
  placaVeiculo: string;
  valorLocacao: string;
}

export interface AddRentalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientType: 'fisica' | 'juridica';
  formData: RentalFormData;
  onChange: (data: Partial<RentalFormData>) => void;
  onSubmit: () => void;
}
