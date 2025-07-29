import { Calendar, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { clientInfoCardSchema, type ClientInfoCardProps } from './@types';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/shared/components/masked-input';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export const ClientInfoCard = ({ data, setData }: ClientInfoCardProps) => {
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem('isReadOnly');
    const newIsReadOnly = value === 'true';
    setIsReadOnly(newIsReadOnly);
  }, []);

  const submit = () => {
    const parsed = clientInfoCardSchema.safeParse(data);
    if (!parsed.success) {
      toast('Preencha todos os campos obrigatórios');
      return;
    }
    toast('Salvo com sucesso');
  };

  return (
    <Card className="p-6 mb-6">
      {/* Dados Pessoais */}
      <p className="text-xl font-semibold mb-1">Dados Pessoais</p>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <Input
            placeholder="Insira o Nome Completo"
            value={data.name || ''}
            onChange={(e) => setData((old) => ({ ...old, name: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
          <div className="relative">
            <MaskedInput
              type="date"
              value={data.birthDate || ''}
              onAccept={(value) => setData((old) => ({ ...old, birthDate: value }))}
              readOnly={isReadOnly}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
          <MaskedInput
            type="cpf"
            value={data.cpf || ''}
            onAccept={(value) => setData((old) => ({ ...old, cpf: value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <MaskedInput
            type="phone"
            value={data.phone || ''}
            onAccept={(value) => setData((old) => ({ ...old, phone: value }))}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
          <MaskedInput
            type="cep"
            value={data.cep || ''}
            onAccept={(value) => setData((old) => ({ ...old, cep: value.replace(/\D/g, '') }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
          <Input
            placeholder="Insira sua rua"
            value={data.street || ''}
            onChange={(e) => setData((old) => ({ ...old, street: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
          <Input
            placeholder="Insira seu bairro"
            value={data.neighborhood || ''}
            onChange={(e) => setData((old) => ({ ...old, neighborhood: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
          <Input
            placeholder="Número da residência"
            value={data.number || ''}
            onChange={(e) => setData((old) => ({ ...old, number: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
          <Input
            placeholder="Complemento (opcional)"
            value={data.complement || ''}
            onChange={(e) => setData((old) => ({ ...old, complement: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <Input
            placeholder="Ex: nome@gmail.com"
            value={data.email || ''}
            onChange={(e) => setData((old) => ({ ...old, email: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
          <Input
            placeholder="Insira sua cidade"
            value={data.city || ''}
            onChange={(e) => setData((old) => ({ ...old, city: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <Input
            placeholder="Insira seu estado"
            value={data.state || ''}
            onChange={(e) => setData((old) => ({ ...old, state: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      {/* Dados Bancários Abaixo */}
      <p className="text-xl font-semibold mt-5 mb-1">Dados Bancários</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
        <Input
          placeholder="Insira o nome do banco"
          value={data.bank || ''}
          onChange={(e) => setData((old) => ({ ...old, bank: e.target.value }))}
          readOnly={isReadOnly}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Agência</label>
          <Input
            placeholder="Insira o número de sua agência"
            value={data.agency || ''}
            onChange={(e) => setData((old) => ({ ...old, agency: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dígito</label>
          <Input
            placeholder="99/99999"
            value={data.agencyDigit || ''}
            onChange={(e) => setData((old) => ({ ...old, agencyDigit: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Conta</label>
          <Input
            placeholder="Insira o número da conta"
            value={data.account || ''}
            onChange={(e) => setData((old) => ({ ...old, account: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dígito</label>
          <Input
            placeholder="99/99999"
            value={data.accountDigit || ''}
            onChange={(e) => setData((old) => ({ ...old, accountDigit: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      {/* Dados da CNH */}
      <p className="text-xl font-semibold mt-5 mb-1">Dados da CNH</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nº da CNH</label>
          <Input
            placeholder="Insira o número de CNH"
            value={data.cnhNumber || ''}
            onChange={(e) => setData((old) => ({ ...old, cnhNumber: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <Input
            placeholder="Insira a categoria"
            value={data.cnhCategory || ''}
            onChange={(e) => setData((old) => ({ ...old, cnhCategory: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Registro</label>
          <Input
            placeholder="Insira o número de registro da CNH"
            value={data.cnhRegister || ''}
            onChange={(e) => setData((old) => ({ ...old, cnhRegister: e.target.value }))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Validade</label>
          <div className="relative">
            <MaskedInput
              type="date"
              placeholder="Ex: 27/12/2030"
              value={data.cnhExpirationDate || ''}
              onAccept={(value) => setData((old) => ({ ...old, cnhExpirationDate: value }))}
              readOnly={isReadOnly}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <Button onClick={submit} className="bg-blue-600 hover:bg-blue-700">
          <Check className="h-4 w-4 mr-2" />
          Salvar alterações
        </Button>
      )}
    </Card>
  );
};
