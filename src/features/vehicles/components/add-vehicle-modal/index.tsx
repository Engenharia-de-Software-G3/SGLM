import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { AddVehicleModalProps, VehicleFormData } from './@types';

export const AddVehicleModal = ({ open, onOpenChange, onSubmit }: AddVehicleModalProps) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    placa: '',
    marca: '',
    modelo: '',
    anoModelo: '',
    quilometragemCompra: '',
    numeroDocumento: '',
    dataCompra: '',
    quilometragemAtual: '',
    dataAtual: '',
    local: '',
    nome: '',
    observacoes: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
    setFormData({
      placa: '',
      marca: '',
      modelo: '',
      anoModelo: '',
      quilometragemCompra: '',
      numeroDocumento: '',
      dataCompra: '',
      quilometragemAtual: '',
      dataAtual: '',
      local: '',
      nome: '',
      observacoes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Veículo</DialogTitle>
          <p className="text-sm text-gray-600">Insira os dados sobre o veículo</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="placa" className="text-sm font-medium">
                Placa
              </label>
              <Input
                id="placa"
                placeholder="XXX-XXX"
                value={formData.placa}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="marca" className="text-sm font-medium">
                Marca
              </label>
              <Input id="marca" value={formData.marca} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="modelo" className="text-sm font-medium">
                Modelo
              </label>
              <Input id="modelo" value={formData.modelo} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="anoModelo" className="text-sm font-medium">
                Ano/Modelo
              </label>
              <Input
                id="anoModelo"
                placeholder="YYYY / MMMM"
                value={formData.anoModelo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="quilometragemCompra" className="text-sm font-medium">
              Quilometragem na Compra
            </label>
            <Input
              id="quilometragemCompra"
              value={formData.quilometragemCompra}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="numeroDocumento" className="text-sm font-medium">
                Nº Do Documento
              </label>
              <Input
                id="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="dataCompra" className="text-sm font-medium">
                Data de Compra
              </label>
              <Input
                id="dataCompra"
                placeholder="DD/MM/YYYY"
                value={formData.dataCompra}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quilometragemAtual" className="text-sm font-medium">
                Quilometragem
              </label>
              <Input
                id="quilometragemAtual"
                value={formData.quilometragemAtual}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="dataAtual" className="text-sm font-medium">
                Data
              </label>
              <Input
                id="dataAtual"
                placeholder="DD/MM/YYYY"
                value={formData.dataAtual}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="local" className="text-sm font-medium">
              Local
            </label>
            <Input id="local" value={formData.local} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="nome" className="text-sm font-medium">
              Nome
            </label>
            <Input id="nome" value={formData.nome} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="observacoes" className="text-sm font-medium">
              Observações
            </label>
            <textarea
              id="observacoes"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none"
              value={formData.observacoes}
              onChange={handleChange}
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-2">↑</div>
            <p className="text-gray-600">Anexe o documento do veículo</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-blue-600 border-blue-600 hover:text-blue-700"
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
