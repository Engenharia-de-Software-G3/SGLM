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
import { useState } from 'react';
import type { AddDebitModalProps } from './@types';

export const AddDebitModal = ({ trigger, onAdd }: AddDebitModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    value: '',
  });

  const handleSubmit = () => {
    onAdd(formData);
    setFormData({
      name: '',
      description: '',
      dueDate: '',
      value: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Conta</DialogTitle>
          <p className="text-sm text-gray-600">Insira os dados da sua conta a ser paga</p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="py-2">
                Título
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description" className="py-2">
                Fornecedor
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="dueDate" className="py-2">
              Data de vencimento
            </Label>
            <Input
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              placeholder="DD/MM/YYYY"
            />
          </div>
          <div>
            <Label htmlFor="value" className="py-2">
              Valor
            </Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="R$"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-2 text-2xl">↑</div>
              <p className="text-sm text-gray-600">Anexe sua conta em PDF, JPEG ou PNG</p>
            </div>
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
