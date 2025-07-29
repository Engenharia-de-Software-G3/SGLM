import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { type ReactNode, useState } from 'react';

type AddPaymentModalProps = {
  trigger: ReactNode;
  onAdd: (data: { tipo: string }) => void;
};

export const AddPaymentModal = ({ trigger, onAdd }: AddPaymentModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ tipo: '' });

  const handleSubmit = () => {
    onAdd(formData);
    setFormData({ tipo: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
          <p className="text-sm text-gray-600">Insira a nova forma de pagamento</p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tipo" className="py-2">
              Tipo
            </Label>
            <Input
              id="tipo"
              placeholder="Ex: Cartão de Crédito"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="flex-row justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="text-blue-600 border-blue-600 hover:text-blue-700"
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
