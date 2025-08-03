import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AddRentalModalProps } from './@types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addRentalSchema, type AddRentalFormData } from '../../schemas/addRental';
import { MaskedFormInput } from '@/shared/components/masked-form-input';
import { FormInput } from '@/shared/components/form-input';
import { FormSelect } from '@/shared/components/form-select';

export const AddRentalModal = ({
  open,
  onOpenChange,
  clientType,
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
      locatario: '',
      cnpjcpf: '',
      inicio: '',
      fim: '',
      placaVeiculo: '',
      valorLocacao: '',
      periodicidadePagamento: '',
    },
  });

  const handleFormSubmit = async (data: AddRentalFormData) => {
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar locação:', error);
    }
  };

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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormInput
            label="Locatário"
            placeholder="Digite o nome do locatário"
            id="locatario"
            control={control}
            name="locatario"
            error={errors.locatario?.message}
            required
          />
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
              placeholder="R$00,00"
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
