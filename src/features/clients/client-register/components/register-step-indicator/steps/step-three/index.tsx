import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

export const StepThree = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nº da CNH</label>
        <Input placeholder="Insira o número de CNH" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
        <Input placeholder="Insira a categoria" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Registro</label>
        <Input placeholder="Insira o número de registro da CNH" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Data de Validade</label>
        <div className="relative">
          <Input placeholder="Ex: 27/12/2026" />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  </div>
);
