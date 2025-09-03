import { useMemo, useState, useEffect } from 'react';
import { Layout } from '../../shared/components/layout';
import { Button } from '@/components/ui/button';
import { DeleteModal } from '@/shared/components/delete-modal';
import { FileText, Plus, Download } from 'lucide-react';
import { PaginatedTable } from '@/shared/components/display-table';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { RentalTypeModal } from './components/rental-type-modal';
import { AddRentalModal } from './components/add-rental-modal';
import type { AddRentalFormData } from './schemas/addRental';
import { useNavigate } from 'react-router-dom';
import {
  useCreateLocacaoMutation,
  useDeleteLocacaoMutation,
  useLocacoesQuery,
} from '@/services/rental';
import { toast } from 'sonner';
import {
  ContractData,
  generateContractPDF,
  LocacaoData,
  ClientData,
} from '@/lib/generateContractPDF';
import { getClientByCpf } from '@/services/client/functions';
import { getVehicleByPlaca } from '@/services/vehicle/functions';

interface DisplayRentalData {
  id: string;
  locatario: string;
  placa: string;
  cpf: string;
}

export const Rental = () => {
  const [search, setSearch] = useState('');
  const [isTypeModalOpen, setTypeModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [clientType, setClientType] = useState<'fisica' | 'juridica'>('fisica');
  const [loadingContractId, setLoadingContractId] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    data: locacoesData,
    isLoading: isLoadingLocacoes,
    isError: isErrorLocacoes,
    error: locacoesError,
  } = useLocacoesQuery();
  const { mutateAsync: createLocacao } = useCreateLocacaoMutation();
  const { mutateAsync: deleteLocacao } = useDeleteLocacaoMutation();

  useEffect(() => {
    const storedClient = localStorage.getItem('filterRentalsByClient');
    const storedVehicle = localStorage.getItem('filterRentalsByVehicle');

    if (storedClient) {
      try {
        setSearch(JSON.parse(storedClient));
      } catch (error) {
        console.error('Erro ao parsear filterRentalsByClient:', error);
      }
      localStorage.removeItem('filterRentalsByClient');
    }

    if (storedVehicle) {
      try {
        setSearch(JSON.parse(storedVehicle));
      } catch (error) {
        console.error('Erro ao parsear filterRentalsByVehicle:', error);
      }
      localStorage.removeItem('filterRentalsByVehicle');
    }
  }, []);

  const [rentals, setRentals] = useState<DisplayRentalData[]>([]);

  useEffect(() => {
    async function loadRentals() {
      if (!locacoesData?.locacoes) {
        setRentals([]);
        return;
      }

      const rentalsWithDetails = await Promise.all(
        locacoesData.locacoes.map(async (locacao: LocacaoData) => {
          let client: ClientData | null = null;

          console.log('Cliente ID:', locacao.clienteId);
          console.log('Placa do veículo:', locacao.placaVeiculo);

          try {
            client = await getClientByCpf(locacao.clienteId);
            console.log('Cliente encontrado:', client?.nomeCompleto);
          } catch (error) {
            console.error('Erro ao buscar cliente:', error);
          }

          return {
            id: locacao.id,
            locatario: client?.nomeCompleto || `Cliente ${locacao.clienteId}` || 'N/A',
            placa: locacao.placaVeiculo || 'N/A',
            cpf: locacao.clienteId || '',
          };
        }),
      );

      setRentals(rentalsWithDetails);
    }

    loadRentals();
  }, [locacoesData]);

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];

    const lowerSearch = search.toLowerCase();

    return rentals.filter(
      (rental) =>
        (rental.locatario || '').toLowerCase().includes(lowerSearch) ||
        (rental.placa || '').toLowerCase().includes(lowerSearch),
    );
  }, [rentals, search]);

  async function submitRental(rentalForm: AddRentalFormData) {
    console.log('submitRental - dados do formulário:', rentalForm);
    console.log(
      'submitRental - valorLocacao original:',
      rentalForm.valorLocacao,
      'tipo:',
      typeof rentalForm.valorLocacao,
    );

    const cleanPlaca = rentalForm.placaVeiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanCpf = rentalForm.cnpjcpf.replace(/\D/g, '');

    const valorNumerico = Number(rentalForm.valorLocacao);
    console.log('submitRental - valor convertido para número:', valorNumerico);

    const payload = {
      cpfLocatario: cleanCpf,
      placaVeiculo: cleanPlaca,
      dataInicio: rentalForm.inicio,
      dataFim: rentalForm.fim,
      valor: valorNumerico,
      periocidadePagamento: rentalForm.periocidadePagamento,
      metodoPagamento: rentalForm.metodoPagamento,
    };

    console.log('submitRental - payload final:', payload);

    try {
      const result = (await createLocacao(payload)) as LocacaoData;
      if (!result) {
        toast.error('Erro ao criar locação');
        throw new Error('Erro ao criar locação');
      }

      const client = await getClientByCpf(cleanCpf);
      const vehicle = await getVehicleByPlaca(cleanPlaca);

      const contractData: ContractData = {
        id: result.id,
        client: {
          nomeCompleto: client?.nomeCompleto || 'Não informado',
          cpf: cleanCpf,
          cnpj: client?.cnpj || '',
          rg: client?.rg || 'Não informado',
          email: client?.email || 'Não informado',
          telefone: client?.telefone || 'Não informado',
          endereco: client?.endereco || 'Não informado',
          nacionalidade: client?.nacionalidade || 'Brasileiro',
          estadoCivil: client?.estadoCivil || 'Solteiro',
          profissao: client?.profissao || 'Autônomo',
        },
        vehicle: {
          id: vehicle?.id,
          chassi: vehicle?.chassi || 'Não informado',
          placa: cleanPlaca,
          modelo: vehicle?.modelo || 'Não informado',
          marca: vehicle?.marca || 'Não informado',
          renavam: vehicle?.renavam || 'Não informado',
          ano: vehicle?.ano || 'Não informado',
          cor: vehicle?.cor || 'Não informado',
          quilometragem: vehicle?.quilometragem || '0',
          quilometragemNaCompra: vehicle?.quilometragemNaCompra || '0',
          dataCompra: vehicle?.dataCompra || 'Não informado',
          dataVenda: vehicle?.dataVenda || 'Não informado',
          local: vehicle?.local || 'Não informado',
          nome: vehicle?.nome || 'Não informado',
          observacoes: vehicle?.observacoes || 'Não informado',
          status: vehicle?.status || 'ativo',
          dataCadastro: vehicle?.dataCadastro || 'Não informado',
          dataAtualizacao: vehicle?.dataAtualizacao || 'Não informado',
        },
        locacao: {
          id: result.id,
          clienteId: cleanCpf,
          placaVeiculo: cleanPlaca,
          dataInicio: payload.dataInicio,
          dataFim: payload.dataFim,
          valor: payload.valor,
          periocidadePagamento: payload.periocidadePagamento || 'Mensal',
          status: result.status || 'ativa',
          dataCadastro: result.dataCadastro || new Date().toISOString(),
          dataAtualizacao: result.dataAtualizacao || new Date().toISOString(),
        },
      };

      generateContractPDF(contractData, 'download');

      toast.success('Locação criada com sucesso');
    } catch (error: unknown) {
      console.error('Erro detalhado:', error);
      if (
        error instanceof Error &&
        (error.message.includes('CPF inválido') || error.message.includes('Nome não corresponde'))
      ) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao criar locação');
      }
      throw error;
    }
  }

  const handleDeleteRental = async (id: string) => {
    try {
      await deleteLocacao(id);
      toast.success('Locação excluída com sucesso');
    } catch {
      toast.error('Erro ao excluir locação');
    }
  };

  const handleViewContract = async (id: string) => {
    try {
      setLoadingContractId(id);
      console.log('Gerando contrato para locação ID:', id);

      // 1. Buscar dados da locação
      const locacoes = locacoesData?.locacoes || [];
      const locacao = locacoes.find((l: LocacaoData) => l.id === id);
      if (!locacao) {
        throw new Error('Locação não encontrada');
      }

      console.log('Dados da locação encontrada:', locacao);

      // 2. Buscar dados do cliente
      const cleanCpf = locacao.clienteId.replace(/\D/g, '');
      console.log('Buscando cliente com CPF:', cleanCpf);

      let client;
      try {
        client = await getClientByCpf(cleanCpf);
        console.log('Cliente encontrado:', client);
      } catch (error) {
        console.warn('Erro ao buscar cliente:', error);
      }

      // 3. Buscar dados do veículo
      const cleanPlaca = locacao.placaVeiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      console.log('Buscando veículo com placa:', cleanPlaca);

      let vehicle;
      try {
        vehicle = await getVehicleByPlaca(cleanPlaca);
        console.log('Veículo encontrado:', vehicle);
      } catch (error) {
        console.warn('Erro ao buscar veículo:', error);
      }

      // 4. Preparar dados para o contrato
      const contractData: ContractData = {
        id,
        client: {
          nomeCompleto: client?.nomeCompleto || 'Não informado',
          cpf: locacao.clienteId,
          cnpj: client?.cnpj || '',
          rg: client?.rg || 'Não informado',
          email: client?.email || 'Não informado',
          telefone: client?.telefone || 'Não informado',
          endereco: client?.endereco || 'Não informado',
          nacionalidade: client?.nacionalidade || 'Brasileiro',
          estadoCivil: client?.estadoCivil || 'Solteiro',
          profissao: client?.profissao || 'Autônomo',
        },
        vehicle: {
          id: vehicle?.id || 'Não informado',
          chassi: vehicle?.chassi || 'Não informado',
          placa: cleanPlaca,
          modelo: vehicle?.modelo || 'Não informado',
          marca: vehicle?.marca || 'Não informado',
          renavam: vehicle?.renavam || 'Não informado',
          ano: vehicle?.ano || 'Não informado',
          cor: vehicle?.cor || 'Não informado',
          quilometragem: vehicle?.quilometragem || '0',
          quilometragemNaCompra: vehicle?.quilometragemNaCompra || '0',
          dataCompra: vehicle?.dataCompra || 'Não informado',
          dataVenda: vehicle?.dataVenda || 'Não informado',
          local: vehicle?.local || 'Não informado',
          nome: vehicle?.nome || 'Não informado',
          observacoes: vehicle?.observacoes || 'Não informado',
          status: vehicle?.status || 'disponivel',
          dataCadastro: vehicle?.dataCadastro || 'Não informado',
          dataAtualizacao: vehicle?.dataAtualizacao || 'Não informado',
        },
        locacao: {
          id: locacao.id,
          clienteId: locacao.clienteId,
          placaVeiculo: locacao.placaVeiculo,
          dataInicio: locacao.dataInicio,
          dataFim: locacao.dataFim,
          valor: locacao.valor,
          periocidadePagamento: locacao.periocidadePagamento || 'Mensal',
          status: locacao.status || 'ativa',
          dataCadastro: locacao.dataCadastro || new Date().toISOString(),
          dataAtualizacao: locacao.dataAtualizacao || new Date().toISOString(),
        },
      };

      console.log('Dados preparados para contrato:', contractData);

      // 5. Gerar PDF usando a função existente
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
      setLoadingContractId(null);
    }
  };

  const handleOpenForm = () => {
    setClientType('fisica');
    setFormModalOpen(true);
  };

  const handleTypeSelect = (type: 'fisica' | 'juridica') => {
    setClientType(type);
    setTypeModalOpen(false);
    setFormModalOpen(true);
  };

  function handleViewRental(id: string) {
    navigate(`/locacoes/${id}`);
  }

  const formatCpfCnpj = (value: string): string => {
    if (!value || typeof value !== 'string') return value || '';

    const cleanValue = value.replace(/\D/g, '');

    switch (cleanValue.length) {
      case 11:
        return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

      case 14:
        return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

      default:
        return value;
    }
  };

  return (
    <Layout title="Gerenciamento de locações" subtitle="Veja todas as locações">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <div className="flex gap-2 w-full pr-4">
            <SearchBar
              placeholder="Filtrar por locatário ou placa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ActionButton
            label="Cadastrar locação"
            icon={<Plus className="h-4 w-4 mr-1" />}
            onClick={handleOpenForm}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </DisplayTableHeader>

        {isLoadingLocacoes && (
          <div className="px-6 py-10 text-gray-500">Carregando locações...</div>
        )}

        {isErrorLocacoes && (
          <div className="px-6 py-10 text-red-600">
            Erro ao carregar locações
            {locacoesError instanceof Error ? `: ${locacoesError.message}` : ''}
          </div>
        )}

        {!isLoadingLocacoes && !isErrorLocacoes && (
          <PaginatedTable
            data={filteredRentals}
            columns={[
              { key: 'locatario', title: 'Locatário' },
              { key: 'placa', title: 'Placa' },
              { key: 'cpf', title: 'CPF/CNPJ' },
              { key: 'actions', title: 'Ações' },
            ]}
            renderRow={(rental) => (
              <tr key={rental.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">
                        {rental.locatario
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rental.locatario}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {rental.placa}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCpfCnpj(rental.cpf)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      onClick={() => handleViewRental(rental.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <DeleteModal
                      title="Tem certeza que deseja excluir essa locação?"
                      description="Todos os dados salvos serão excluídos."
                      actionText="Excluir locação"
                      onConfirm={() => handleDeleteRental(rental.id as string)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => handleViewContract(rental.id)}
                      disabled={loadingContractId === rental.id}
                    >
                      {loadingContractId === rental.id ? (
                        <>
                          <Download className="h-4 w-4 mr-1 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-1" />
                          Ver contrato
                        </>
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </div>

      <RentalTypeModal
        open={isTypeModalOpen}
        onOpenChange={setTypeModalOpen}
        clientType={clientType}
        onSelect={handleTypeSelect}
      />

      <AddRentalModal
        open={isFormModalOpen}
        onOpenChange={setFormModalOpen}
        clientType={clientType}
        onSubmit={submitRental}
      />
    </Layout>
  );
};
