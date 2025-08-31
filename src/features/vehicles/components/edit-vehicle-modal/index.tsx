import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CloudUpload } from 'lucide-react';
import type { EditVehicleModalProps } from './@types';
import type { VeiculoFormulario } from '@/features/vehicles/types';
import { StatusVehicle } from '@/services/vehicle/types';

function maskData(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}

function maskAnoModelo(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return digits.slice(0, 4) + '/' + digits.slice(4);
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
    status: 'disponivel',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    console.log({vehicle})
    if (vehicle) {
      setFormData({
        marca: vehicle.marca || '',
        modelo: vehicle.modelo || '',
        placa: vehicle.placa || '',
        ano: vehicle.ano || '',
        cor: vehicle.cor,
        chassi: vehicle.chassi || '',
        quilometragemAtual: vehicle.quilometragem?.toString() || '',
        quilometragemCompra: vehicle.quilometragemNaCompra?.toString() || '',
        dataCompra: vehicle.dataCompra || '',
        local: vehicle.local || '',
        nome: vehicle.nome || '',
        observacoes: vehicle.observacoes || '',
        status: vehicle.status as StatusVehicle,
      }); 
    }
  }, [vehicle]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | 
       { target: { id: string; value: string } },
  ) => {
    const { id, value } = 'target' in e ? e.target : e;

    const maskedValue =
      id === 'dataCompra' ? maskData(value) :
      id === 'ano' ? maskAnoModelo(value) :
      value;

    setFormData((prev) => ({ ...prev, [id]: maskedValue }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    console.log({ formData, selectedFile})
    onSave({ ...formData, arquivo: selectedFile });
    onClose();
    setSelectedFile(null);
  };

  const handleReset = () => {
    if (vehicle) {
      setFormData({
        marca: vehicle.marca || '',
        modelo: vehicle.modelo || '',
        placa: vehicle.placa || '',
        ano: vehicle.ano || '',
        cor: vehicle.cor,
        chassi: vehicle.chassi || '',
        quilometragemAtual: vehicle.quilometragem?.toString() || '',
        quilometragemCompra: vehicle.quilometragemNaCompra?.toString() || '',
        dataCompra: vehicle.dataCompra || '',
        local: vehicle.local || '',
        nome: vehicle.nome || '',
        observacoes: vehicle.observacoes || '',
        status: vehicle.status,
      });
    }
    setErrors({});
    setSelectedFile(null);
  };

  useEffect(() => {
    console.log({formData})
  }, [formData])

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
                className="bg-gray-200 cursor-not-allowed"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                className="bg-gray-200 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input 
                id="placa" 
                value={formData.placa} 
                onChange={handleInputChange} 
                className="bg-gray-200 cursor-not-allowed"
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Fabricação/Modelo</Label>
              <Input
                id="ano"
                placeholder="AAAA/YYYY"
                value={formData.ano}
                onChange={handleInputChange}
                className="bg-gray-200 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input 
                id="cor" 
                value={formData.cor} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chassi">Chassi</Label>
              <Input
                id="chassi"
                value={formData.chassi}
                className="bg-gray-200 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quilometragemAtual">Quilometragem Atual</Label>
              <Input
                id="quilometragemAtual"
                value={formData.quilometragemAtual}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quilometragemCompra">Quilometragem na Compra</Label>
              <Input
                id="quilometragemCompra"
                value={formData.quilometragemCompra}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input 
                id="local" 
                value={formData.local} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataCompra">Data da Compra</Label>
              <Input
                id="dataCompra"
                placeholder="DD/MM/YYYY"
                value={formData.dataCompra}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input 
                id="nome" 
                value={formData.nome} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="relative">
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled
                  className="w-full h-10 px-3 py-2  rounded-md text-sm  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-gray-100 text-gray-400"
                >
                  <option value="disponivel" disabled>Disponível</option>
                  <option value="alugado" disabled>Locado</option>
                  <option value="manutencao" disabled>Manutenção</option>
                </select>
              </div>
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

          <Label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block hover:border-blue-400 transition">
            <div className="flex justify-center mb-2 text-blue-500">
              <CloudUpload className="w-10 h-10" />
            </div>
            <p className="text-gray-600">Anexe o documento do veículo</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
          </Label>

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