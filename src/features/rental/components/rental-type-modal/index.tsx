import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { RentalTypeModalProps } from './@types';
import { useState } from 'react';

export const RentalTypeModal = ({
  open,
  onOpenChange,
  clientType,
  onSelect,
}: RentalTypeModalProps) => {
  const [tempSelection, setTempSelection] = useState<'fisica' | 'juridica'>(clientType);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setTempSelection(clientType);
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Locação</DialogTitle>
          <p className="text-sm text-gray-600">
            Escolha uma das opções e continue para efetuar o cadastro
          </p>
        </DialogHeader>

        <RadioGroup
          value={tempSelection}
          onValueChange={(v) => setTempSelection(v as 'fisica' | 'juridica')}
        >
          <div className="flex justify-center mt-4 gap-20">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fisica" id="fisica" />
              <Label htmlFor="fisica" className="text-blue-600">
                Pessoa física
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="juridica" id="juridica" />
              <Label htmlFor="juridica" className="text-blue-600">
                Pessoa jurídica
              </Label>
            </div>
          </div>
        </RadioGroup>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-blue-600 border-blue-600 hover:text-blue-700"
          >
            Cancelar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              onSelect(tempSelection);
              onOpenChange(false);
            }}
          >
            Avançar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
