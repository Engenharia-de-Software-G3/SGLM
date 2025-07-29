import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { AddSupplierModalProps } from './@types';

export const AddSupplierModal = ({
  open,
  onOpenChange,
  formData,
  onChange,
  onSubmit,
}: AddSupplierModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Fornecedor</DialogTitle>
          <p className="text-sm text-gray-600">Insira os dados sobre o fornecedor</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nome" className="py-2">
              Nome do fornecedor
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              placeholder=""
            />
          </div>

          <div>
            <Label htmlFor="categoria" className="py-2">
              Categoria
            </Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => onChange({ categoria: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="space-y-1">
            <Label className="py-2">Tipo de fornecedor</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value) => onChange({ tipo: value as 'fisica' | 'juridica' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fisica" id="fisica" />
                <Label htmlFor="fisica" className="py-2 text-blue-600">
                  Pessoa Física
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="juridica" id="juridica" />
                <Label htmlFor="juridica" className="py-2 text-blue-600">
                  Pessoa Jurídica
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="cpfCnpj" className="py-2">
              CPF/CNPJ
            </Label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={(e) => onChange({ cpfCnpj: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="telefone" className="py-2">
              Telefone
            </Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => onChange({ telefone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email" className="py-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="endereco" className="py-2">
              Endereço
            </Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => onChange({ endereco: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cep" className="py-2">
                CEP
              </Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => onChange({ cep: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bairro" className="py-2">
                Bairro
              </Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => onChange({ bairro: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade" className="py-2">
                Cidade
              </Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => onChange({ cidade: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="estado" className="py-2">
                Estado
              </Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => onChange({ estado: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-blue-600 border-blue-600 hover:text-blue-700"
            >
              Cancelar
            </Button>
            <Button onClick={onSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
