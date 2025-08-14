import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { vehicleFormSchema } from '../../schemas/vehicleFormSchema';
import type { EditVehicleModalProps } from './@types';
import type { VeiculoFormulario } from '@/features/vehicles/types';

function maskData(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}

export const EditVehicleModal = ({ isOpen, onClose, onSave, vehicle }: EditVehicleModalProps) => {
  const [formData, setFormData] = useState<VeiculoFormulario>({
    marca: '',
    modelo: '',
    placa: '',
    ano: '',
    cor: '',
    chassi: '',
    quilometragemAtual: '',
    quilometragemCompra: '',
    dataCompra: '',
    local: '',
    nome: '',
    observacoes: '',
    status: 'Disponível',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        marca: vehicle.brand,
        modelo: vehicle.model,
        placa: vehicle.plate,
        ano: vehicle.year?.toString() || '',
        cor: vehicle.color,
        chassi: vehicle.chassis || '',
        quilometragemAtual: vehicle.currentMileage?.toString() || '',
        quilometragemCompra: vehicle.initialMileage?.toString() || '',
        renavam: vehicle.insurancePolicy || '',
        dataCompra: vehicle.acquisitionDate || '',
        local: vehicle.location || '',
        nome: vehicle.ownerName || '',
        observacoes: vehicle.observations || '',
        status: vehicle.status || 'Disponível',
      });
    }
  }, [vehicle]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { id: string; value: string } },
  ) => {
    const { id, value } = 'target' in e ? e.target : e;
    const maskedValue = id === 'dataCompra' ? maskData(value) : value;
    setFormData((prev) => ({ ...prev, [id]: maskedValue }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = vehicleFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = Array.isArray(issue.path) ? issue.path[0]?.toString() : '';
        if (field) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSave(result.data);
    onClose();
  };

  const handleReset = () => {
    if (vehicle) setFormData((prev) => ({ ...prev, ...vehicle }));
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Veículo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={handleInputChange}
                readOnly
                className="bg-gray-200 cursor-not-allowed"
              />
              {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                readOnly
                className="bg-gray-200 cursor-not-allowed"
              />
              {errors.modelo && <p className="text-sm text-red-500">{errors.modelo}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input id="placa" value={formData.placa} onChange={handleInputChange} required />
              {errors.placa && <p className="text-sm text-red-500">{errors.placa}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input id="cor" value={formData.cor} onChange={handleInputChange} required />
              {errors.cor && <p className="text-sm text-red-500">{errors.cor}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="renavam">RENAVAM</Label>
              <Input id="renavam" value={formData.renavam} onChange={handleInputChange} required />
              {errors.renavam && <p className="text-sm text-red-500">{errors.renavam}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="chassi">Chassi</Label>
              <Input id="chassi" value={formData.chassi} onChange={handleInputChange} required />
              {errors.chassi && <p className="text-sm text-red-500">{errors.chassi}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quilometragemAtual">Quilometragem Atual</Label>
              <Input
                id="quilometragemAtual"
                value={formData.quilometragemAtual}
                onChange={handleInputChange}
                required
              />
              {errors.quilometragemAtual && (
                <p className="text-sm text-red-500">{errors.quilometragemAtual}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quilometragemCompra">Quilometragem na Compra</Label>
              <Input
                id="quilometragemCompra"
                value={formData.quilometragemCompra}
                onChange={handleInputChange}
                required
              />
              {errors.quilometragemCompra && (
                <p className="text-sm text-red-500">{errors.quilometragemCompra}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input id="local" value={formData.local} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataCompra">Data da Compra</Label>
              <Input
                id="dataCompra"
                placeholder="DD/MM/YYYY"
                value={formData.dataCompra}
                onChange={handleInputChange}
              />
              {errors.dataCompra && <p className="text-sm text-red-500">{errors.dataCompra}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              placeholder="Insira informações adicionais"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none"
              value={formData.observacoes}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Resetar
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
