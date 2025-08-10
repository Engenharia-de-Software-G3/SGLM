export interface RentalTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientType: 'fisica' | 'juridica';
  onSelect: (type: 'fisica' | 'juridica') => void;
}
