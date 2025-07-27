import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { getAddressByCep } from '@/api/cep';
import { MaskedInput } from '@/shared/components/masked-input';

export const StepOne = () => {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState({
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  useEffect(() => {
    const fetchAddress = async () => {
      if (cep.length === 8) {
        try {
          const { data } = await getAddressByCep(cep.replace(/\D/g, ''));
          if (!data.erro) {
            setAddress({
              rua: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf,
            });
          }
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
        }
      }
    };

    fetchAddress();
  }, [cep]);

  return (
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
            <MaskedInput type="date" />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
          <MaskedInput type="cpf" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <MaskedInput type="phone" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
          <MaskedInput
            type="cep"
            value={cep}
            onAccept={(value) => setCep(value.replace(/\D/g, ''))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
          <Input placeholder="Insira sua rua" value={address.rua} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
          <Input placeholder="Insira seu bairro" value={address.bairro} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
          <Input placeholder="Número da residência" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
          <Input placeholder="Complemento (opcional)" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <Input placeholder="Ex: nome@gmail.com" defaultValue="" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
          <Input placeholder="Insira sua cidade" value={address.cidade} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <Input placeholder="Insira seu estado" value={address.estado} />
        </div>
      </div>
    </div>
  );
};
