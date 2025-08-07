import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { vehicleFormSchema } from '../../schemas/vehicleFormSchema';
import type { EditVehicleModalProps } from './@types';
import type { VeiculoFormulario } from '@/features/vehicles/types';

export const EditVehicleModal = ({ isOpen, onClose, onSave, vehicle }: EditVehicleModalProps) => {
  const [formData, setFormData] = useState<VeiculoFormulario>({
    marca: '',
    modelo: '',
    placa: '',
    ano: '',
    cor: '',
    combustivel: '',
    categoria: '',
    renavam: '',
    chassi: '',
    motor: '',
    portas: '',
    assentos: '',
    transmissao: '',
    valorDiario: '',
    quilometragemAtual: '',
    quilometragemCompra: '',
    proximaManutencao: '',
    numeroDocumento: '',
    dataCompra: '',
    local: '',
    nome: '',
    observacoes: '',
    status: 'Disponível',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicle) {
      console.log('Initializing form with vehicle:', vehicle);
      const newFormData: VeiculoFormulario = {
        marca: vehicle.brand,
        modelo: vehicle.model,
        placa: vehicle.plate,
        ano: vehicle.year.toString(),
        cor: vehicle.color,
        combustivel: vehicle.fuel,
        categoria: vehicle.category,
        renavam: vehicle.renavam,
        chassi: vehicle.chassis,
        motor: vehicle.engine,
        portas: vehicle.doors.toString(),
        assentos: vehicle.seats.toString(),
        transmissao: vehicle.transmission,
        valorDiario: vehicle.dailyRate.toString(),
        quilometragemAtual: vehicle.currentMileage.toString(),
        quilometragemCompra: vehicle.initialMileage?.toString() || '',
        proximaManutencao: vehicle.nextMaintenanceKm.toString(),
        numeroDocumento: vehicle.insurancePolicy || '',
        dataCompra: vehicle.acquisitionDate || '',
        local: '',
        nome: '',
        observacoes: '',
        status: vehicle.status || 'Disponível',
      };
      setFormData(newFormData);
      console.log('Form data initialized:', newFormData);
    }
  }, [vehicle]);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { id: string; value: string } },
  ) => {
    const { id, value } = 'target' in e ? e.target : e;
    console.log(`Input changed: ${id} = ${value}`);
    if (id === 'status') {
      console.log('Status changed to:', value);
    }
    setFormData((prev) => {
      const newFormData = { ...prev, [id]: value };
      console.log('Updated form data:', newFormData);
      return newFormData;
    });
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data on submit:', formData);
    if (!formData.status || !['Disponível', 'Locado', 'Manutenção'].includes(formData.status)) {
      setErrors({ status: 'Status é obrigatório e deve ser válido' });
      console.log('Validation failed: Invalid or missing status');
      return;
    }
    const result = vehicleFormSchema.safeParse(formData);
    if (!result.success) {
      console.log('Validation errors:', result.error.issues);
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

    // Adiciona log para depurar os dados validados
    console.log('Data to save before onSave:', result.data);
    setErrors({});
    onSave(result.data); // Garante que result.data contém status
    onClose();
  };

  const handleReset = () => {
    if (vehicle) {
      const newFormData: VeiculoFormulario = {
        marca: vehicle.brand,
        modelo: vehicle.model,
        placa: vehicle.plate,
        ano: vehicle.year.toString(),
        cor: vehicle.color,
        combustivel: vehicle.fuel,
        categoria: vehicle.category,
        renavam: vehicle.renavam,
        chassi: vehicle.chassis,
        motor: vehicle.engine,
        portas: vehicle.doors.toString(),
        assentos: vehicle.seats.toString(),
        transmissao: vehicle.transmission,
        valorDiario: vehicle.dailyRate.toString(),
        quilometragemAtual: vehicle.currentMileage.toString(),
        quilometragemCompra: vehicle.initialMileage?.toString() || '',
        proximaManutencao: vehicle.nextMaintenanceKm.toString(),
        numeroDocumento: vehicle.insurancePolicy || '',
        dataCompra: vehicle.acquisitionDate || '',
        local: '',
        nome: '',
        observacoes: '',
        status: vehicle.status || 'Disponível',
      };
      setFormData(newFormData);
      console.log('Form reset to:', newFormData);
      setErrors({});
    }
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
              <Input id="marca" value={formData.marca} onChange={handleInputChange} required />
              {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" value={formData.modelo} onChange={handleInputChange} required />
              {errors.modelo && <p className="text-sm text-red-500">{errors.modelo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input id="placa" value={formData.placa} onChange={handleInputChange} required />
              {errors.placa && <p className="text-sm text-red-500">{errors.placa}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                value={formData.ano}
                onChange={handleInputChange}
                required
              />
              {errors.ano && <p className="text-sm text-red-500">{errors.ano}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input id="cor" value={formData.cor} onChange={handleInputChange} required />
              {errors.cor && <p className="text-sm text-red-500">{errors.cor}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <RadioGroup
                value={formData.categoria}
                onValueChange={(value) => handleInputChange({ target: { id: 'categoria', value } })}
                required
                defaultValue={formData.categoria || 'Sedan'}
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
                onValueChange={(value) => handleInputChange({ target: { id: 'status', value } })}
                required
                defaultValue={formData.status || 'Disponível'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="combustivel">Combustível</Label>
              <RadioGroup
                value={formData.combustivel}
                onValueChange={(value) =>
                  handleInputChange({ target: { id: 'combustivel', value } })
                }
                required
                defaultValue={formData.combustivel || 'Gasolina'}
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
                onValueChange={(value) =>
                  handleInputChange({ target: { id: 'transmissao', value } })
                }
                required
                defaultValue={formData.transmissao || 'Manual'}
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
              <Input id="renavam" value={formData.renavam} onChange={handleInputChange} required />
              {errors.renavam && <p className="text-sm text-red-500">{errors.renavam}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="chassi">Chassi</Label>
              <Input id="chassi" value={formData.chassi} onChange={handleInputChange} required />
              {errors.chassi && <p className="text-sm text-red-500">{errors.chassi}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="motor">Motor</Label>
              <Input id="motor" value={formData.motor} onChange={handleInputChange} required />
              {errors.motor && <p className="text-sm text-red-500">{errors.motor}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="portas">Número de Portas</Label>
              <Input
                id="portas"
                type="number"
                value={formData.portas}
                onChange={handleInputChange}
                required
              />
              {errors.portas && <p className="text-sm text-red-500">{errors.portas}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assentos">Número de Assentos</Label>
              <Input
                id="assentos"
                type="number"
                value={formData.assentos}
                onChange={handleInputChange}
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
                value={formData.valorDiario}
                onChange={handleInputChange}
                required
              />
              {errors.valorDiario && <p className="text-sm text-red-500">{errors.valorDiario}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quilometragemAtual">Quilometragem Atual</Label>
              <Input
                id="quilometragemAtual"
                type="number"
                value={formData.quilometragemAtual}
                onChange={handleInputChange}
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
                value={formData.proximaManutencao}
                onChange={handleInputChange}
                required
              />
              {errors.proximaManutencao && (
                <p className="text-sm text-red-500">{errors.proximaManutencao}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroDocumento">Nº do Documento</Label>
              <Input
                id="numeroDocumento"
                placeholder="Insira o nº do documento"
                value={formData.numeroDocumento}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
              />
              {errors.dataCompra && <p className="text-sm text-red-500">{errors.dataCompra}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                placeholder="Insira o local de aquisição"
                value={formData.local}
                onChange={handleInputChange}
              />
              {errors.local && <p className="text-sm text-red-500">{errors.local}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Insira o nome do dono do veículo"
                value={formData.nome}
                onChange={handleInputChange}
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
