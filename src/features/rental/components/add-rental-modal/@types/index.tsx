interface RentalFormData {
  cpfCnpj: string;
  placaVeiculo: string;
  dataInicio: string;
  dataFim: string;
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
