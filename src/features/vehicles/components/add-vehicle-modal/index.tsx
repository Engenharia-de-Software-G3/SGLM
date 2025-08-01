import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CloudUpload } from 'lucide-react';
import { vehicleFormSchema } from '../../schemas/vehicleFormSchema';

export interface VehicleFormData {
  placa: string;
  marca: string;
  modelo: string;
  chassi: string;
  anoModelo: string;
  quilometragemCompra: string;
  numeroDocumento: string;
  dataCompra: string;
  quilometragemAtual: string;
  dataAtual: string;
  local: string;
  nome: string;
  observacoes?: string;
}

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VehicleFormData) => void;
}

function maskAnoModelo(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return digits.slice(0, 4) + '/' + digits.slice(4);
}

function maskData(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}

export const AddVehicleModal = ({ isOpen, onClose, onSave }: AddVehicleModalProps) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    placa: '',
    marca: '',
    modelo: '',
    chassi: '',
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    let maskedValue = value;

    if (id === 'anoModelo') {
      maskedValue = maskAnoModelo(value);
    } else if (id === 'dataCompra' || id === 'dataAtual') {
      maskedValue = maskData(value);
    }

    setFormData((prev) => ({ ...prev, [id]: maskedValue }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = vehicleFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSave(result.data);
    onClose();

    setFormData({
      placa: '',
      marca: '',
      modelo: '',
      chassi: '',
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Veículo</DialogTitle>
          <p className="text-sm text-gray-600">Insira os dados sobre o veículo</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="placa" className="text-sm font-medium">
                Placa
              </Label>
              <Input
                id="placa"
                placeholder="Insira a placa do veículo"
                value={formData.placa}
                onChange={handleChange}
              />
              {errors.placa && <p className="text-sm text-red-500">{errors.placa}</p>}
            </div>
            <div>
              <Label htmlFor="marca" className="text-sm font-medium">
                Marca
              </Label>
              <Input
                id="marca"
                placeholder="Insira a marca do veículo"
                value={formData.marca}
                onChange={handleChange}
              />
              {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modelo" className="text-sm font-medium">
                Modelo
              </Label>
              <Input
                id="modelo"
                placeholder="Insira o modelo do veículo"
                value={formData.modelo}
                onChange={handleChange}
              />
              {errors.modelo && <p className="text-sm text-red-500">{errors.modelo}</p>}
            </div>
            <div>
              <Label htmlFor="ano/modelo" className="text-sm font-medium">
                Ano/Modelo
              </Label>
              <Input
                id="anoModelo"
                placeholder="YYYY / MMMM"
                value={formData.anoModelo}
                onChange={handleChange}
              />
              {errors.anoModelo && <p className="text-sm text-red-500">{errors.anoModelo}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="chassi" className="text-sm font-medium">
              Chassi
            </Label>
            <Input
              id="chassi"
              placeholder="Insira o chassi do veículo"
              value={formData.chassi}
              onChange={handleChange}
            />
            {errors.chassi && <p className="text-sm text-red-500">{errors.chassi}</p>}
          </div>

          <div>
            <Label htmlFor="quilometragemCompra" className="text-sm font-medium">
              Quilometragem da Compra
            </Label>
            <Input
              id="quilometragemCompra"
              placeholder="Insira a quilometragem no dia da aquisição do veículo"
              value={formData.quilometragemCompra}
              onChange={handleChange}
            />
            {errors.quilometragemCompra && (
              <p className="text-sm text-red-500">{errors.quilometragemCompra}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroDocumento" className="text-sm font-medium">
                Nº do Documento
              </Label>
              <Input
                id="numeroDocumento"
                placeholder="Insira o Nº do documento"
                value={formData.numeroDocumento}
                onChange={handleChange}
              />
              {errors.numeroDocumento && (
                <p className="text-sm text-red-500">{errors.numeroDocumento}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dataCompra" className="text-sm font-medium">
                Data da Compra
              </Label>
              <Input
                id="dataCompra"
                placeholder="DD/MM/YYYY"
                value={formData.dataCompra}
                onChange={handleChange}
              />
              {errors.dataCompra && <p className="text-sm text-red-500">{errors.dataCompra}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quilometragemAtual" className="text-sm font-medium">
                Quilometragem
              </Label>
              <Input
                id="quilometragemAtual"
                placeholder="Quilometragem atual"
                value={formData.quilometragemAtual}
                onChange={handleChange}
              />
              {errors.quilometragemAtual && (
                <p className="text-sm text-red-500">{errors.quilometragemAtual}</p>
              )}
            </div>
            <div>
              <Label htmlFor="dataAtual" className="text-sm font-medium">
                Data Atual
              </Label>
              <Input
                id="dataAtual"
                placeholder="DD/MM/YYYY"
                value={formData.dataAtual}
                onChange={handleChange}
              />
              {errors.dataAtual && <p className="text-sm text-red-500">{errors.dataAtual}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="local" className="text-sm font-medium">
              Local
            </Label>
            <Input
              id="local"
              placeholder="Insira o local de aquisição do veículo"
              value={formData.local}
              onChange={handleChange}
            />
            {errors.local && <p className="text-sm text-red-500">{errors.local}</p>}
          </div>

          <div>
            <Label htmlFor="nome" className="text-sm font-medium">
              Nome
            </Label>
            <Input
              id="nome"
              placeholder="Insira o nome do dono do veículo"
              value={formData.nome}
              onChange={handleChange}
            />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
          </div>

          <div>
            <Label htmlFor="observacoes" className="text-sm font-medium">
              Observações
            </Label>
            <textarea
              id="observacoes"
              placeholder="Insira qualquer informação extra sobre o veículo"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none"
              value={formData.observacoes}
              onChange={handleChange}
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                console.log('Arquivo selecionado:', file);
              }}
            />
          </Label>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-blue-600 border-blue-600 hover:text-blue-700"
              onClick={onClose}
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
