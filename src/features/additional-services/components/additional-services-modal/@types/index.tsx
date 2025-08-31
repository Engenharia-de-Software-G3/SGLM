export interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    nome: string;
    valor: string;
    descricao: string;
  };
  onChange: (changes: Partial<AddServiceModalProps['formData']>) => void;
  onSubmit: () => void;
}
