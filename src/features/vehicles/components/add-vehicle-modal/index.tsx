import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CloudUpload } from 'lucide-react';
import type { AddVehicleModalProps } from './@types';
import type { VeiculoFormulario } from '@/features/vehicles/types';

function maskData(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}

export const AddVehicleModal = ({ open, onOpenChange, onSubmit }: AddVehicleModalProps) => {
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { id: string; value: string } },
  ) => {
    const { id, value } = 'target' in e ? e.target : e;
    let maskedValue = value;

    if (id === 'dataCompra') {
      maskedValue = maskData(value);
    }

    setFormData((prev) => ({ ...prev, [id]: maskedValue }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    console.log('Arquivo selecionado:', file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    onSubmit({ ...formData, arquivo: selectedFile }); // Include file in submission
    onOpenChange(false);
    setFormData({
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
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Veículo</DialogTitle>
          <p className="text-sm text-gray-600">Insira os dados sobre o veículo</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Insira a marca do veículo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Insira o modelo do veículo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={handleChange}
                placeholder="Insira a placa do veículo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                value={formData.ano}
                onChange={handleChange}
                placeholder="Insira o ano do veículo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                value={formData.cor}
                onChange={handleChange}
                placeholder="Insira a cor do veículo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chassi">Chassi</Label>
              <Input
                id="chassi"
                value={formData.chassi}
                onChange={handleChange}
                placeholder="Insira o chassi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quilometragemAtual">Quilometragem Atual</Label>
              <Input
                id="quilometragemAtual"
                value={formData.quilometragemAtual}
                onChange={handleChange}
                placeholder="Insira a quilometragem atual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quilometragemCompra">Quilometragem na Compra</Label>
              <Input
                id="quilometragemCompra"
                value={formData.quilometragemCompra}
                onChange={handleChange}
                placeholder="Insira a quilometragem na compra"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                value={formData.local}
                onChange={handleChange}
                placeholder="Insira o local"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataCompra">Data da Compra</Label>
              <Input
                id="dataCompra"
                value={formData.dataCompra}
                onChange={handleChange}
                placeholder="DD/MM/YYYY"
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Insira o nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Insira observações"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none"
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

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-blue-600 border-blue-600"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" type="submit">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};