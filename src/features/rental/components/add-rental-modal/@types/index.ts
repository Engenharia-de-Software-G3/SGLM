import type { AddRentalFormData } from '../../../schemas/addRental';

export interface AddRentalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientType: 'fisica' | 'juridica';
  onSubmit: (data: AddRentalFormData) => Promise<void>;
}
