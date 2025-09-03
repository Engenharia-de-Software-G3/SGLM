import { FileText, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type RentalInfoCardProps } from './@types';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/shared/components/masked-input';
import { toast } from 'sonner';
import { useState } from 'react';
import { generateContractPDF, ContractData } from '@/lib/generateContractPDF';

export const RentalInfoCard = ({ data }: RentalInfoCardProps) => {
  const [isLoadingContract, setIsLoadingContract] = useState(false);

  const handleExportContract = async () => {
    setIsLoadingContract(true);
    try {
      console.log('Gerando contrato com dados:', data);

      const contractData: ContractData = {
        id: data.id || 'N/A',
        client: {
          nomeCompleto: data.locatario || 'Não informado',
          cpf: data.cnpjcpf || 'Não informado',
          cnpj: data.cnpjcpf.length > 11 ? data.cnpjcpf : '',
          rg: 'Não informado',
          email: data.email || 'Não informado',
          telefone: data.telefone || 'Não informado',
          endereco: 'Não informado',
          nacionalidade: 'Brasileiro',
          estadoCivil: 'Solteiro',
          profissao: 'Autônomo',
        },
        vehicle: {
          id: 'N/A',
          chassi: data.chassi || 'Não informado',
          placa: data.placaVeiculo || 'Não informado',
          modelo: data.modelo || 'Não informado',
          marca: data.marca || 'Não informado',
          renavam: 'Não informado',
          ano: data.ano || 'Não informado',
          cor: data.cor || 'Não informado',
          quilometragem: data.quilometragemInicial || '0',
          quilometragemNaCompra: '0',
          dataCompra: 'Não informado',
          dataVenda: 'Não informado',
          local: 'Não informado',
          nome: 'Não informado',
          observacoes: data.observacoes || 'Não informado',
          status: 'disponivel',
          dataCadastro: 'Não informado',
          dataAtualizacao: 'Não informado',
        },
        locacao: {
          id: data.id || 'N/A',
          clienteId: data.cnpjcpf || 'Não informado',
          placaVeiculo: data.placaVeiculo || 'Não informado',
          dataInicio: data.inicio || 'Não informado',
          dataFim: data.fim || 'Não informado',
          valor: Number(data.valorLocacao) || 0,
          periocidadePagamento: data.intervaloPagamento || 'Mensal', // Adicionado
          status: 'ativa',
          dataCadastro: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        },
      };

      console.log('Dados preparados para contrato:', contractData);

      generateContractPDF(contractData, 'download');

      toast.success('Download do contrato iniciado!');
    } catch (error: unknown) {
      console.error('Erro ao gerar contrato:', error);
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(`Erro ao gerar contrato: ${errorMessage}`);
    } finally {
      setIsLoadingContract(false);
    }
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Valor da Locação</label>
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

      <Button
        className="bg-lime-600 hover:bg-lime-700 mt-6"
        onClick={handleExportContract}
        disabled={isLoadingContract}
      >
        {isLoadingContract ? (
          <>
            <Download className="h-4 w-4 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Exportar Contrato
          </>
        )}
      </Button>
    </Card>
  );
};
