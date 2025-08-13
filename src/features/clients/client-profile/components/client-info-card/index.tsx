import { Calendar, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { clientInfoCardSchema, type ClientInfoCardProps } from './@types';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/shared/components/masked-input';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useUpdateClientMutation } from '@/services/client';
import { useNavigate } from 'react-router-dom';

export const ClientInfoCard = ({ data: initialData }: ClientInfoCardProps) => {
  const [isReadOnly, setIsReadOnly] = useState(false);

  const { mutateAsync: updateClient } = useUpdateClientMutation();
  const navigate = useNavigate();

  const filterByClient = () => {
    localStorage.setItem("filterRentalsByClient", JSON.stringify(flattenedData.nomeCompleto || ''))
    navigate("/locacoes");
  };

  // Create flattened data for the form
  const [flattenedData, setFlattenedData] = useState(() => {
    return {
      id: initialData.id,
      nomeCompleto: initialData.nomeCompleto,
      dataNascimento: initialData.dataNascimento,
      cpf: initialData.cpf,
      telefone: initialData.telefone,
      email: initialData.email,
      enderecos_principal_cep: initialData.enderecos?.principal?.cep || '',
      enderecos_principal_rua: initialData.enderecos?.principal?.rua || '',
      enderecos_principal_numero: initialData.enderecos?.principal?.numero || '',
      enderecos_principal_bairro: initialData.enderecos?.principal?.bairro || '',
      enderecos_principal_cidade: initialData.enderecos?.principal?.cidade || '',
      enderecos_principal_estado: initialData.enderecos?.principal?.estado || '',
      documentos_cnh_numero: initialData.documentos?.cnh?.numero || '',
      documentos_cnh_categoria: initialData.documentos?.cnh?.categoria || '',
      documentos_cnh_dataValidade: initialData.documentos?.cnh?.dataValidade || '',
      documentos_cnh_tipo: initialData.documentos?.cnh?.tipo || '',
    };
  });

  // Helper function to restore nested object structure
  const restoreData = (flattened: Record<string, unknown>): Record<string, unknown> => {
    const restored: Record<string, unknown> = {};
    
    for (const key in flattened) {
      if (Object.prototype.hasOwnProperty.call(flattened, key)) {
        const keys = key.split('_');
        let current = restored as Record<string, unknown>;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const currentKey = keys[i];
          if (!current[currentKey]) {
            current[currentKey] = {};
          }
          current = current[currentKey] as Record<string, unknown>;
        }
        
        current[keys[keys.length - 1]] = flattened[key];
      }
    }
    
    return restored;
  };

  // Helper function to update flattened data
  const updateFlattenedData = (field: string, value: string) => {
    setFlattenedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const value = localStorage.getItem('isReadOnly');
    const newIsReadOnly = value === 'true';
    setIsReadOnly(newIsReadOnly);
  }, []);

  const submit = async () => {
    const parsed = clientInfoCardSchema.safeParse(flattenedData);
    if (!parsed.success) {
      toast('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Restore the nested structure before sending to API
    const restoredData = restoreData(parsed.data);
    await updateClient({id: Number(initialData.id), payload: restoredData});
    toast('Salvo com sucesso');
    setTimeout(() => {
      navigate('/clientes')
    }, 1000)
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
            value={flattenedData.nomeCompleto || ''}
            onChange={(e) => updateFlattenedData('nomeCompleto', e.target.value)}
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
              value={flattenedData.dataNascimento || ''}
              onAccept={(value) => updateFlattenedData('dataNascimento', value)}
              readOnly={isReadOnly}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
          <MaskedInput
            type="cpf"
            value={flattenedData.cpf || ''}
            onAccept={(value) => updateFlattenedData('cpf', value)}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <MaskedInput
            type="phone"
            value={flattenedData.telefone || ''}
            onAccept={(value) => updateFlattenedData('telefone', value)}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
          <MaskedInput
            type="cep"
            value={flattenedData.enderecos_principal_cep || ''}
            onAccept={(value) => updateFlattenedData('enderecos_principal_cep', value.replace(/\D/g, ''))}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
          <Input
            placeholder="Insira sua rua"
            value={flattenedData.enderecos_principal_rua || ''}
            onChange={(e) => updateFlattenedData('enderecos_principal_rua', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
          <Input
            placeholder="Insira seu bairro"
            value={flattenedData.enderecos_principal_bairro || ''}
            onChange={(e) => updateFlattenedData('enderecos_principal_bairro', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
          <Input
            type="number"
            placeholder="Número da residência"
            value={flattenedData.enderecos_principal_numero || ''}
            onChange={(e) => updateFlattenedData('enderecos_principal_numero', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <Input
            placeholder="Ex: nome@gmail.com"
            value={flattenedData.email || ''}
            onChange={(e) => updateFlattenedData('email', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
          <Input
            placeholder="Insira sua cidade"
            value={flattenedData.enderecos_principal_cidade || ''}
            onChange={(e) => updateFlattenedData('enderecos_principal_cidade', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <Input
            placeholder="Insira seu estado"
            value={flattenedData.enderecos_principal_estado || ''}
            onChange={(e) => updateFlattenedData('enderecos_principal_estado', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      {/* Dados Bancários Abaixo */}
      <p className="text-xl font-semibold mt-5 mb-1">Dados Bancários</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
          <Input
            placeholder="Insira o nome do banco"
            value=""
            readOnly={true}
            disabled={true}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Agência</label>
          <Input
            type="number"
            placeholder="Insira o número de sua agência"
            value=""
            readOnly={true}
            disabled={true}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Conta</label>
          <Input
            type="number"
            placeholder="Insira o número da conta"
            value=""
            readOnly={true}
            disabled={true}
          />
        </div>
      </div>

      {/* Dados da CNH */}
      <p className="text-xl font-semibold mt-5 mb-1">Dados da CNH</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nº da CNH</label>
          <Input
            type="number"
            placeholder="Insira o número de CNH"
            value={flattenedData.documentos_cnh_numero}
            onChange={(e) => updateFlattenedData('documentos_cnh_numero', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <Input
            placeholder="Insira a categoria"
            value={flattenedData.documentos_cnh_categoria || ''}
            onChange={(e) => updateFlattenedData('documentos_cnh_categoria', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Validade</label>
          <div className="relative">
            <MaskedInput
              type="date"
              placeholder="Ex: 27/12/2030"
              value={flattenedData.documentos_cnh_dataValidade || ''}
              onAccept={(value) => updateFlattenedData('documentos_cnh_dataValidade', value)}
              readOnly={isReadOnly}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <Input
            placeholder="Insira o tipo da CNH"
            value={flattenedData.documentos_cnh_tipo || ''}
            onChange={(e) => updateFlattenedData('documentos_cnh_tipo', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      {isReadOnly && (
          <Button onClick={() => filterByClient()} style={{ width: "25%" }} className="bg-blue-600 hover:bg-blue-700 mt-5">
            Ver histórico de locações do cliente
          </Button>
      )}

      {!isReadOnly && (
        <Button onClick={submit} className="bg-blue-600 hover:bg-blue-700">
          <Check className="h-4 w-4 mr-2" />
          Salvar alterações
        </Button>
      )}
    </Card>
  );
};
