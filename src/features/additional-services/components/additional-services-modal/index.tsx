import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AddServiceModalProps } from './@types';

export const AddServiceModal = ({
  open,
  onOpenChange,
  formData,
  onChange,
  onSubmit,
}: AddServiceModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Serviço Adicional</DialogTitle>
          <p className="text-sm text-gray-600">Preencha os campos abaixo</p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome" className="py-2">
              Nome
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              placeholder="Nome do serviço"
            />
          </div>
          <div>
            <Label htmlFor="valor" className="py-2">
              Valor
            </Label>
            <Input
              id="valor"
              value={formData.valor}
              onChange={(e) => onChange({ valor: e.target.value })}
              placeholder="R$ 0,00"
            />
          </div>
          <div>
            <Label htmlFor="descricao" className="py-2">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              rows={4}
              value={formData.descricao}
              onChange={(e) => onChange({ descricao: e.target.value })}
              placeholder="Descrição do serviço"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-blue-600 border-blue-600 hover:text-blue-700"
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
            Cadastrar Serviço
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
