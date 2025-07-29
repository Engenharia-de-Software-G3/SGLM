import { Input } from '@/components/ui/input';

export const StepTwo = () => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
      <Input placeholder="Insira o nome do banco" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Agência</label>
        <Input placeholder="Insira o número de sua agência" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dígito</label>
        <Input placeholder="99/99999" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Conta</label>
        <Input placeholder="Insira o número de sua agência" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dígito</label>
        <Input placeholder="99/99999" />
      </div>
    </div>
  </div>
);
