import { Calendar, Check, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { rentalInfoCardSchema, type RentalInfoCardProps } from './@types';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/shared/components/masked-input';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const RentalInfoCard = ({ data }: RentalInfoCardProps) => {
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem('isReadOnly');
    const newIsReadOnly = value === 'true';
    setIsReadOnly(newIsReadOnly);
  }, []);

  const submit = () => {
    const parsed = rentalInfoCardSchema.safeParse(data);
    if (!parsed.success) {
      toast('Preencha todos os campos obrigatórios');
      return;
    }
    toast('Salvo com sucesso');
  };

  return (
    <Card className="p-6 mb-6">
      {/* Dados do Locatário */}
      <div className="flex items-center mb-4">
        <p className="text-xl font-semibold">Dados do Locatário</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <Input
            placeholder="Insira o nome completo do locatário"
            value={data.locatario || ''}
            readOnly={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ</label>
          <MaskedInput type="cpf" value={data.cnpjcpf || ''} readOnly={true} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <MaskedInput type="phone" value={data.telefone || ''} readOnly={true} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <Input
            type="email"
            placeholder="Ex: nome@gmail.com"
            value={data.email || ''}
            readOnly={true}
          />
        </div>
      </div>

      {/* Dados do Veículo */}
      <div className="flex items-center mb-4 mt-8">
        <p className="text-xl font-semibold">Dados do Veículo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Placa do Veículo</label>
          <Input placeholder="Ex: ABC1234" value={data.placaVeiculo || ''} readOnly={true} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chassi</label>
          <Input
            placeholder="Insira o número do chassi"
            value={data.chassi || ''}
            readOnly={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
          <Input placeholder="Ex: Toyota" value={data.marca || ''} readOnly={true} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
          <Input placeholder="Ex: Corolla" value={data.modelo || ''} readOnly={true} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
          <Input type="number" placeholder="Ex: 2023" value={data.ano || ''} readOnly={true} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
          <Input placeholder="Ex: Prata" value={data.cor || ''} readOnly={true} />
        </div>
      </div>

      {/* Dados da Locação */}
      <div className="flex items-center mb-4 mt-8">
        <p className="text-xl font-semibold">Dados da Locação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
          <div className="relative">
            <MaskedInput type="date" value={data.inicio || ''} readOnly={true} />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
          <div className="relative">
            <MaskedInput type="date" value={data.fim || ''} readOnly={true} />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valor da Locação</label>
          <Input
            type="text"
            placeholder="R$ 0,00"
            value={data.valorLocacao || ''}
            readOnly={true}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intervalo de Pagamento
          </label>
          <Select value={data.intervaloPagamento} disabled>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diario">Diário</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="quinzenal">Quinzenal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button className="bg-lime-600 hover:bg-lime-700 mt-6">
        <FileText className="h-4 w-4 mr-2" />
        Exportar Contrato
      </Button>

      {!isReadOnly && (
        <Button onClick={submit} className="bg-blue-600 hover:bg-blue-700 mt-6">
          <Check className="h-4 w-4 mr-2" />
          Salvar alterações
        </Button>
      )}
    </Card>
  );
};
