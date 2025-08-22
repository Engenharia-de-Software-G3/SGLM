import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { AddMaintenanceModalProps, MaintenanceFormData } from './@types';

export const AddMaintenanceModal = ({ trigger, onAdd }: AddMaintenanceModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<MaintenanceFormData>({
    name: '',
    supplier: '',
    plate: '',
    date: '',
    value: '',
    mileage: '',
  });

  const handleAdd = () => {
    onAdd({
      nomeServico: form.name.trim(),
      placaVeiculo: form.plate.trim(),
      valor: parseFloat(form.value),
    });

    setForm({ name: '', supplier: '', plate: '', date: '', value: '', mileage: '' });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Manutenção</DialogTitle>
          <p className="text-sm text-gray-600">Preencha os dados da manutenção</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Serviço</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="plate">Placa</Label>
            <Input
              id="plate"
              value={form.plate}
              onChange={(e) => setForm({ ...form, plate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              placeholder="R$"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="text-blue-600 border-blue-600 hover:text-blue-700"
          >
            Cancelar
          </Button>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
