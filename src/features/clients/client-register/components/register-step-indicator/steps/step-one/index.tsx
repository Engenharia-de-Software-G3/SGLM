import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { getAddressByCep } from '@/api/cep';
import { MaskedInput } from '@/shared/components/masked-input';
import type { StepOneProps } from './@types';

export const StepOne = ({ data, setData }: StepOneProps) => {
  useEffect(() => {
    const fetchAddress = async () => {
      if (data.cep?.length === 8) {
        try {
          const { data: res } = await getAddressByCep(data.cep.replace(/\D/g, ''));
          if (!res.erro) {
            setData((old) => ({
              ...old,
              rua: res.logradouro,
              bairro: res.bairro,
              cidade: res.localidade,
              estado: res.uf,
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
        }
      }
    };

    fetchAddress();
  }, [data.cep, setData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <Input
            placeholder="Insira o Nome Completo"
            value={data.nome || ''}
            onChange={(e) => setData((old) => ({ ...old, nome: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
          <div className="relative">
            <MaskedInput
              type="date"
              value={data.dataNascimento || ''}
              onAccept={(value) => setData((old) => ({ ...old, dataNascimento: value }))}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
          <MaskedInput
            type="cpf"
            value={data.cpfcnpj || ''}
            onAccept={(value) => setData((old) => ({ ...old, cpfcnpj: value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <MaskedInput
            type="phone"
            value={data.telefone || ''}
            onAccept={(value) => setData((old) => ({ ...old, telefone: value }))}
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
          <Input
            placeholder="Insira sua rua"
            value={data.rua || ''}
            onChange={(e) => setData((old) => ({ ...old, rua: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
          <Input
            placeholder="Insira seu bairro"
            value={data.bairro || ''}
            onChange={(e) => setData((old) => ({ ...old, bairro: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
          <Input
            type="number"
            placeholder="Número da residência"
            value={data.numero || ''}
            onChange={(e) => setData((old) => ({ ...old, numero: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
          <Input
            placeholder="Complemento (opcional)"
            value={data.complemento || ''}
            onChange={(e) => setData((old) => ({ ...old, complemento: e.target.value }))}
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
          <Input
            placeholder="Insira sua cidade"
            value={data.cidade || ''}
            onChange={(e) => setData((old) => ({ ...old, cidade: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <Input
            placeholder="Insira seu estado"
            value={data.estado || ''}
            onChange={(e) => setData((old) => ({ ...old, estado: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};
