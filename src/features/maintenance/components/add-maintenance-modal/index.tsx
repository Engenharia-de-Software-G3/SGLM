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
    onAdd(form);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="py-2">
                Serviço
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="supplier" className="py-2">
                Fornecedor
              </Label>
              <Input
                id="supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plate" className="py-2">
                Placa
              </Label>
              <Input
                id="plate"
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date" className="py-2">
                Data
              </Label>
              <Input
                id="date"
                placeholder="DD/MM/AAAA"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value" className="py-2">
                Valor
              </Label>
              <Input
                id="value"
                placeholder="R$"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="mileage" className="py-2">
                Quilometragem
              </Label>
              <Input
                id="mileage"
                value={form.mileage}
                onChange={(e) => setForm({ ...form, mileage: e.target.value })}
              />
            </div>
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
