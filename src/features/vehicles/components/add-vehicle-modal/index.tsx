import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CloudUpload } from 'lucide-react';
import { vehicleFormSchema } from '../../schemas/vehicleFormSchema';
import type { AddVehicleModalProps } from './@types';
import type { VeiculoFormulario } from '@/features/vehicles/types';

function maskAno(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function maskData(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}

export const AddVehicleModal = ({ open, onOpenChange, onSubmit }: AddVehicleModalProps) => {
  const [formData, setFormData] = useState<VeiculoFormulario>({
    placa: '',
    marca: '',
    modelo: '',
    chassi: '',
    ano: '',
    cor: '',
    combustivel: '',
    categoria: '',
    renavam: '',
    motor: '',
    portas: '',
    assentos: '',
    transmissao: '',
    valorDiario: '',
    quilometragemAtual: '',
    proximaManutencao: '',
    numeroDocumento: '',
    dataCompra: '',
    local: '',
    nome: '',
    observacoes: '',
    status: 'Disponível', // Adicionado
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { id: string; value: string } },
  ) => {
    const { id, value } = 'target' in e ? e.target : e;
    let maskedValue = value;

    if (id === 'ano') {
      maskedValue = maskAno(value);
    } else if (id === 'dataCompra') {
      maskedValue = maskData(value);
    }

    setFormData((prev: VeiculoFormulario) => ({ ...prev, [id]: maskedValue }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = vehicleFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = Array.isArray(issue.path) ? issue.path[0]?.toString() : '';
        if (field) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
    onOpenChange(false);

    setFormData({
      placa: '',
      marca: '',
      modelo: '',
      chassi: '',
      ano: '',
      cor: '',
      combustivel: '',
      categoria: '',
      renavam: '',
      motor: '',
      portas: '',
      assentos: '',
      transmissao: '',
      valorDiario: '',
      quilometragemAtual: '',
      proximaManutencao: '',
      numeroDocumento: '',
      dataCompra: '',
      local: '',
      nome: '',
      observacoes: '',
      status: 'Disponível', // Adicionado
      quilometragemCompra: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Veículo</DialogTitle>
          <p className="text-sm text-gray-600">Insira os dados sobre o veículo</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                placeholder="Insira a marca do veículo"
                value={formData.marca}
                onChange={handleChange}
                required
              />
              {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                placeholder="Insira o modelo do veículo"
                value={formData.modelo}
                onChange={handleChange}
                required
              />
              {errors.modelo && <p className="text-sm text-red-500">{errors.modelo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                placeholder="Insira a placa do veículo"
                value={formData.placa}
                onChange={handleChange}
                required
              />
              {errors.placa && <p className="text-sm text-red-500">{errors.placa}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                placeholder="YYYY"
                value={formData.ano}
                onChange={handleChange}
                required
              />
              {errors.ano && <p className="text-sm text-red-500">{errors.ano}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                placeholder="Insira a cor do veículo"
                value={formData.cor}
                onChange={handleChange}
                required
              />
              {errors.cor && <p className="text-sm text-red-500">{errors.cor}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <RadioGroup
                value={formData.categoria}
                onValueChange={(value: string) =>
                  handleChange({ target: { id: 'categoria', value } })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Hatch" id="hatch" />
                  <Label htmlFor="hatch">Hatch</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sedan" id="sedan" />
                  <Label htmlFor="sedan">Sedan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SUV" id="suv" />
                  <Label htmlFor="suv">SUV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Moto" id="moto" />
                  <Label htmlFor="moto">Moto</Label>
                </div>
              </RadioGroup>
              {errors.categoria && <p className="text-sm text-red-500">{errors.categoria}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value: string) => handleChange({ target: { id: 'status', value } })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Disponível" id="disponivel" />
                  <Label htmlFor="disponivel">Disponível</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Locado" id="locado" />
                  <Label htmlFor="locado">Locado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Manutenção" id="manutencao" />
                  <Label htmlFor="manutencao">Manutenção</Label>
                </div>
              </RadioGroup>
              {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
            </div>
          </div>

          {/* Especificações Técnicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="combustivel">Combustível</Label>
              <RadioGroup
                value={formData.combustivel}
                onValueChange={(value) => handleChange({ target: { id: 'combustivel', value } })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Gasolina" id="gasolina" />
                  <Label htmlFor="gasolina">Gasolina</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Etanol" id="etanol" />
                  <Label htmlFor="etanol">Etanol</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Flex" id="flex" />
                  <Label htmlFor="flex">Flex</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Diesel" id="diesel" />
                  <Label htmlFor="diesel">Diesel</Label>
                </div>
              </RadioGroup>
              {errors.combustivel && <p className="text-sm text-red-500">{errors.combustivel}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmissao">Transmissão</Label>
              <RadioGroup
                value={formData.transmissao}
                onValueChange={(value) => handleChange({ target: { id: 'transmissao', value } })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Manual" id="manual" />
                  <Label htmlFor="manual">Manual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Automático" id="automatico" />
                  <Label htmlFor="automatico">Automático</Label>
                </div>
              </RadioGroup>
              {errors.transmissao && <p className="text-sm text-red-500">{errors.transmissao}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="renavam">RENAVAM</Label>
              <Input
                id="renavam"
                placeholder="Insira o RENAVAM do veículo"
                value={formData.renavam}
                onChange={handleChange}
                required
              />
              {errors.renavam && <p className="text-sm text-red-500">{errors.renavam}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="chassi">Chassi</Label>
              <Input
                id="chassi"
                placeholder="Insira o chassi do veículo"
                value={formData.chassi}
                onChange={handleChange}
                required
              />
              {errors.chassi && <p className="text-sm text-red-500">{errors.chassi}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="motor">Motor</Label>
              <Input
                id="motor"
                placeholder="Insira o motor do veículo"
                value={formData.motor}
                onChange={handleChange}
                required
              />
              {errors.motor && <p className="text-sm text-red-500">{errors.motor}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="portas">Número de Portas</Label>
              <Input
                id="portas"
                type="number"
                placeholder="Insira o número de portas"
                value={formData.portas}
                onChange={handleChange}
                required
              />
              {errors.portas && <p className="text-sm text-red-500">{errors.portas}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assentos">Número de Assentos</Label>
              <Input
                id="assentos"
                type="number"
                placeholder="Insira o número de assentos"
                value={formData.assentos}
                onChange={handleChange}
                required
              />
              {errors.assentos && <p className="text-sm text-red-500">{errors.assentos}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorDiario">Valor Diário (R$)</Label>
              <Input
                id="valorDiario"
                type="number"
                step="0.01"
                placeholder="Insira o valor diário"
                value={formData.valorDiario}
                onChange={handleChange}
                required
              />
              {errors.valorDiario && <p className="text-sm text-red-500">{errors.valorDiario}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quilometragemAtual">Quilometragem Atual</Label>
              <Input
                id="quilometragemAtual"
                type="number"
                placeholder="Insira a quilometragem atual"
                value={formData.quilometragemAtual}
                onChange={handleChange}
                required
              />
              {errors.quilometragemAtual && (
                <p className="text-sm text-red-500">{errors.quilometragemAtual}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="proximaManutencao">Próxima Manutenção (km)</Label>
              <Input
                id="proximaManutencao"
                type="number"
                placeholder="Insira a próxima manutenção"
                value={formData.proximaManutencao}
                onChange={handleChange}
                required
              />
              {errors.proximaManutencao && (
                <p className="text-sm text-red-500">{errors.proximaManutencao}</p>
              )}
            </div>
          </div>

          {/* Campos Adicionais */}
          <div className="space-y-2">
            <Label htmlFor="quilometragemCompra">Quilometragem da Compra</Label>
            <Input
              id="quilometragemCompra"
              placeholder="Insira a quilometragem no dia da aquisição"
              value={formData.quilometragemCompra}
              onChange={handleChange}
            />
            {errors.quilometragemCompra && (
              <p className="text-sm text-red-500">{errors.quilometragemCompra}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroDocumento">Nº do Documento</Label>
              <Input
                id="numeroDocumento"
                placeholder="Insira o nº do documento"
                value={formData.numeroDocumento}
                onChange={handleChange}
              />
              {errors.numeroDocumento && (
                <p className="text-sm text-red-500">{errors.numeroDocumento}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataCompra">Data da Compra</Label>
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
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                placeholder="Insira o local de aquisição"
                value={formData.local}
                onChange={handleChange}
              />
              {errors.local && <p className="text-sm text-red-500">{errors.local}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Insira o nome do dono do veículo"
                value={formData.nome}
                onChange={handleChange}
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              placeholder="Insira informações adicionais"
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
