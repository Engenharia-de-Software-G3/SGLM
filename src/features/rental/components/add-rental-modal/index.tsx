import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AddRentalModalProps } from './@types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addRentalSchema, type AddRentalFormData } from '../../schemas/addRental';
import { MaskedFormInput } from '@/shared/components/masked-form-input';
import { FormInput } from '@/shared/components/form-input';
import { FormSelect } from '@/shared/components/form-select';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';

export const AddRentalModal = ({
  open,
  onOpenChange,
  onSubmit,
}: AddRentalModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddRentalFormData>({
    resolver: zodResolver(addRentalSchema),
    defaultValues: {
      cnpjcpf: '',
      inicio: '',
      fim: '',
      placaVeiculo: '',
      valorLocacao: 0,
      periodicidadePagamento: '',
    },
  });

  const [clientType, setClientType] = useState<'fisica' | 'juridica'>('fisica');

  const handleFormSubmit = handleSubmit(async (data: AddRentalFormData) => {
  try {
    await onSubmit(data);
    reset();
    onOpenChange(false);
    toast('Locação salva com sucesso');
  } catch (error) {
    console.error('Erro ao salvar locação:', error);
    toast('Erro ao salvar locação');
  }
});

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro de locação</DialogTitle>
          <p className="text-sm text-gray-600">Insira os dados abaixo</p>
        </DialogHeader>
        
        {/* Seleção do tipo de pessoa */}
        <div className="flex space-x-4 mb-4">
          <RadioGroup
            value={clientType}
            onValueChange={(value) => setClientType(value as 'fisica' | 'juridica')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="fisica"
                id="fisica"
                className="w-4 h-4 rounded-full border border-gray-400 checked:bg-[#6080BE] checked:border-[#6080BE] focus:ring-2 focus:ring-[#6080BE]"
              />
              <label htmlFor="fisica" className="text-sm select-none">Pessoa Física</label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="juridica"
                id="juridica"
                className="w-4 h-4 rounded-full border border-gray-400 checked:bg-[#6080BE] checked:border-[#6080BE] focus:ring-2 focus:ring-[#6080BE]"
              />
              <label htmlFor="juridica" className="text-sm select-none">Pessoa Jurídica</label>
            </div>
          </RadioGroup>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          <MaskedFormInput
            label={clientType === 'fisica' ? 'CPF' : 'CNPJ'}
            id="cnpjcpf"
            type={clientType === 'fisica' ? 'cpf' : 'cnpj'}
            control={control}
            name="cnpjcpf"
            error={errors.cnpjcpf?.message}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <MaskedFormInput
              type="date"
              label="Início"
              id="inicio"
              control={control}
              name="inicio"
              error={errors.inicio?.message}
              required
            />
            <MaskedFormInput
              type="date"
              label="Fim"
              id="fim"
              control={control}
              name="fim"
              error={errors.fim?.message}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Placa veículo"
              id="placaVeiculo"
              placeholder="ABC1234"
              control={control}
              name="placaVeiculo"
              error={errors.placaVeiculo?.message}
              required
            />
            <FormInput
              label="Valor locação"
              id="valorLocacao"
              control={control}
              name="valorLocacao"
              error={errors.valorLocacao?.message}
              required
              placeholder="R$ 0,00"
              type="number"
            />
          </div>

          <div className="col-span-2">
            <FormSelect
              name="periodicidadePagamento"
              control={control}
              label="Periodicidade do pagamento"
              required
              error={errors.periodicidadePagamento?.message}
              options={[
                { value: 'Diária', label: 'Diária' },
                { value: 'Semanal', label: 'Semanal' },
                { value: 'Quinzenal', label: 'Quinzenal' },
                { value: 'Mensal', label: 'Mensal' },
              ]}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
