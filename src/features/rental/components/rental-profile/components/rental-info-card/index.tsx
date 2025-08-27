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
    setIsReadOnly(value === 'true');
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
    <Card className="p-6 mb-6 max-h-[80vh] overflow-y-auto">
      {/* Dados do Locatário */}
      <div className="flex items-center mb-4">
        <p className="text-xl font-semibold">Dados do Locatário</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <Input value={data.locatario || ''} readOnly />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ</label>
          <MaskedInput type="cpf" value={data.cnpjcpf || ''} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <MaskedInput type="phone" value={data.telefone || ''} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <Input type="email" value={data.email || ''} readOnly />
        </div>
      </div>

      {/* Dados do Veículo */}
      <div className="flex items-center mb-4 mt-8">
        <p className="text-xl font-semibold">Dados do Veículo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
          <Input value={data.placaVeiculo || ''} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chassi</label>
          <Input value={data.chassi || ''} readOnly />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
          <Input value={data.marca || ''} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
          <Input value={data.modelo || ''} readOnly />
        </div>
      </div>

      {/* Dados da Locação */}
      <div className="flex items-center mb-4 mt-8">
        <p className="text-xl font-semibold">Dados da Locação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
          <MaskedInput type="date" value={data.inicio || ''} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
          <MaskedInput type="date" value={data.fim || ''} readOnly />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Locação
            </label>
            <Input
              value={
                data.valorLocacao
                  ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(Number(data.valorLocacao))
                  : ''
              }
              readOnly
            />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intervalo de Pagamento
          </label>
          <p className="p-2 border rounded bg-gray-50">{data.intervaloPagamento || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
          <Input value={data.formaPagamento || ''} readOnly />
        </div>
      </div>

      <Button className="bg-lime-600 hover:bg-lime-700 mt-6">
        <FileText className="h-4 w-4 mr-2" />
        Exportar Contrato
      </Button>
    </Card>
  );
};
