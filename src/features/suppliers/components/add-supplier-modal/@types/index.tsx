export interface AddSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    nome: string;
    categoria: string;
    cpfCnpj: string;
    telefone: string;
    email: string;
    endereco: string;
    cep: string;
    bairro: string;
    cidade: string;
    estado: string;
    tipo: 'fisica' | 'juridica';
  };
  onChange: (changes: Partial<AddSupplierModalProps['formData']>) => void;
  onSubmit: () => void;
}
