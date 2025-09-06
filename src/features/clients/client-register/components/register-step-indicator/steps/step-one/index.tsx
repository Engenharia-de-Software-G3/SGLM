import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { getAddressByCep } from '@/api/cep';
import { MaskedInput } from '@/shared/components/masked-input';
import type { StepOneProps } from './@types';

export const StepOne = ({ data, setData }: StepOneProps) => {
  const [isCnpj, setIsCnpj] = useState(false);

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
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <Input
            id="nome"
            placeholder="Insira o Nome Completo"
            value={data.nome || ''}
            onChange={(e) => setData((old) => ({ ...old, nome: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-2">
            Data de Nascimento
          </label>
          <div className="relative">
            <MaskedInput
              id="dataNascimento"
              type="date"
              value={data.dataNascimento || ''}
              onAccept={(value) => setData((old) => ({ ...old, dataNascimento: value }))}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div>
          {isCnpj ? (
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ{' '}
                <button
                  type="button"
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => setIsCnpj(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsCnpj(false)}
                >
                  (CPF)
                </button>
              </label>
              <MaskedInput
                id="cnpj"
                type="cnpj"
                value={data.cpfcnpj || ''}
                onAccept={(value) => setData((old) => ({ ...old, cpfcnpj: value }))}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                CPF{' '}
                <button
                  type="button"
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => setIsCnpj(true)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsCnpj(true)}
                >
                  (CNPJ)
                </button>
              </label>
              <MaskedInput
                id="cpf"
                type="cpf"
                value={data.cpfcnpj || ''}
                onAccept={(value) => setData((old) => ({ ...old, cpfcnpj: value }))}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <MaskedInput
            id="telefone"
            type="phone"
            value={data.telefone || ''}
            onAccept={(value) => setData((old) => ({ ...old, telefone: value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
            CEP
          </label>
          <MaskedInput
            id="cep"
            type="cep"
            value={data.cep || ''}
            onAccept={(value) => setData((old) => ({ ...old, cep: value.replace(/\D/g, '') }))}
          />
        </div>
        <div>
          <label htmlFor="rua" className="block text-sm font-medium text-gray-700 mb-2">
            Rua
          </label>
          <Input
            id="rua"
            placeholder="Insira sua rua"
            value={data.rua || ''}
            onChange={(e) => setData((old) => ({ ...old, rua: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-2">
            Bairro
          </label>
          <Input
            id="bairro"
            placeholder="Insira seu bairro"
            value={data.bairro || ''}
            onChange={(e) => setData((old) => ({ ...old, bairro: e.target.value }))}
          />
        </div>
        <div>
          <label
            htmlFor="numeroResidencia"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Número
          </label>
          <Input
            id="numeroResidencia"
            type="number"
            placeholder="Número da residência"
            value={data.numero || ''}
            onChange={(e) => setData((old) => ({ ...old, numero: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-2">
            Complemento
          </label>
          <Input
            id="complemento"
            placeholder="Complemento (opcional)"
            value={data.complemento || ''}
            onChange={(e) => setData((old) => ({ ...old, complemento: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <Input
            id="email"
            placeholder="Ex: nome@gmail.com"
            value={data.email || ''}
            onChange={(e) => setData((old) => ({ ...old, email: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <Input
            id="cidade"
            placeholder="Insira sua cidade"
            value={data.cidade || ''}
            onChange={(e) => setData((old) => ({ ...old, cidade: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <Input
            id="estado"
            placeholder="Insira seu estado"
            value={data.estado || ''}
            onChange={(e) => setData((old) => ({ ...old, estado: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};
