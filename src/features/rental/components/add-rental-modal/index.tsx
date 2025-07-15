import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AddRentalModalProps } from './@types';

export const AddRentalModal = ({
  open,
  onOpenChange,
  clientType,
  formData,
  onChange,
  onSubmit,
}: AddRentalModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastro de locação</DialogTitle>
          <p className="text-sm text-gray-600">Insira os dados abaixo</p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="py-2">{clientType === 'fisica' ? 'CPF' : 'CNPJ'}</Label>
            <Input
              value={formData.cpfCnpj}
              onChange={(e) => onChange({ cpfCnpj: e.target.value })}
            />
          </div>
          <div>
            <Label className="py-2">Placa</Label>
            <Input value={formData.placa} onChange={(e) => onChange({ placa: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="py-2">Início</Label>
              <Input
                placeholder="DD/MM/YYYY"
                value={formData.dataInicio}
                onChange={(e) => onChange({ dataInicio: e.target.value })}
              />
            </div>
            <div>
              <Label className="py-2">Fim</Label>
              <Input
                placeholder="DD/MM/YYYY"
                value={formData.dataFim}
                onChange={(e) => onChange({ dataFim: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="py-2">Placa veículo</Label>
              <Input
                value={formData.placaVeiculo}
                onChange={(e) => onChange({ placaVeiculo: e.target.value })}
              />
            </div>
            <div>
              <Label className="py-2">Valor locação</Label>
              <Input
                value={formData.valorLocacao}
                onChange={(e) => onChange({ valorLocacao: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={onSubmit}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
