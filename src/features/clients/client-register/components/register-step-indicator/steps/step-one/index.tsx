import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

export const StepOne = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
        <Input placeholder="Insira o Nome Completo" defaultValue="" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
        <div className="relative">
          <Input placeholder="Ex: 20/01/2005" />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
        <Input placeholder="Ex: 999.999.999-99" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
        <Input placeholder="Ex: (83) 98965-3298" defaultValue="" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
        <Input placeholder="Insira o CEP" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
        <Input placeholder="Autopreenchido com CEP" disabled />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
        <Input placeholder="Autopreenchido com CEP" disabled />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
        <Input placeholder="Autopreenchido com CEP" disabled />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
        <Input placeholder="Autopreenchido com CEP" disabled />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
        <Input placeholder="Ex: nome@gmail.com" defaultValue="" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
        <Input placeholder="Insira a cidade" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <Input placeholder="Insira o Estado" />
      </div>
    </div>
  </div>
);
