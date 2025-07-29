import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import type { StepThreeProps } from './@types';
import { MaskedInput } from '@/shared/components/masked-input';

export const StepThree = ({ data, setData }: StepThreeProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nº da CNH</label>
        <Input
          placeholder="Insira o número de CNH"
          value={data.cnhNumero || ''}
          onChange={(e) => setData((old) => ({ ...old, cnhNumero: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
        <Input
          placeholder="Insira a categoria"
          value={data.categoria || ''}
          onChange={(e) => setData((old) => ({ ...old, categoria: e.target.value }))}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Registro</label>
        <Input
          placeholder="Insira o número de registro da CNH"
          value={data.registro || ''}
          onChange={(e) => setData((old) => ({ ...old, registro: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Data de Validade</label>
        <div className="relative">
          <MaskedInput
            type="date"
            placeholder="Ex: 27/12/2030"
            value={data.validade || ''}
            onAccept={(value) => setData((old) => ({ ...old, validade: value }))}
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  </div>
);
