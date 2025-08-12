import { useMemo, useState } from 'react';
import { Layout } from '../../shared/components/layout';
import { Button } from '@/components/ui/button';
import { DeleteModal } from '@/shared/components/delete-modal';
import { ExternalLinkIcon, FileText, Plus } from 'lucide-react';
import { PaginatedTable } from '@/shared/components/display-table';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { RentalTypeModal } from './components/rental-type-modal';
import { AddRentalModal } from './components/add-rental-modal';
import type { AddRentalFormData } from './schemas/addRental';
import { useNavigate } from 'react-router-dom';
import { useCreateLocacaoMutation, useDeleteLocacaoMutation, useLocacoesQuery } from '@/services/rental';
import { useClientsQuery } from '@/services/client';
import { toast } from 'sonner';
import { ContractData, generateContractPDF, LocacaoData } from '@/lib/generateContractPDF';
import { getClientByCpf } from '@/services/client/functions'; 
import { getVehicleByPlaca } from '@/services/vehicle/functions';
import { api } from '@/lib/axios'; 

interface DisplayRentalData {
  id: string;
  locatario: string;
  placa: string;
  cpf: string;
}

export const Rental = () => {
  const [searchByName, setsearchByName] = useState('');
  const [searchByPlate, setSearchByPlate] = useState('');
  const [isTypeModalOpen, setTypeModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [clientType, setClientType] = useState<'fisica' | 'juridica'>('fisica');
  const navigate = useNavigate();

  const { data: locacoesData, isLoading: isLoadingLocacoes, isError: isErrorLocacoes, error: locacoesError } = useLocacoesQuery();
  const { data: clientsData } = useClientsQuery();
  const { mutateAsync: createLocacao } = useCreateLocacaoMutation(); 
  const { mutateAsync: deleteLocacao } = useDeleteLocacaoMutation();

  const rentals: DisplayRentalData[] = useMemo(() => {
    const source = Array.isArray(locacoesData?.locacoes) ? locacoesData!.locacoes : [];
    return source.map((locacao) => {
      // Se não tem nomeLocatario, tenta buscar pelo CPF nos clientes
      let locatarioNome = locacao.nomeLocatario;
      
      if (!locatarioNome && locacao.clienteId) {
        // Busca o nome do cliente pelo CPF
        const cleanCpf = locacao.clienteId.replace(/\D/g, '');
        const client = clientsData?.clientes?.find((client: any) => {
          const cleanClientCpf = client.cpf.replace(/\D/g, '');
          return cleanClientCpf === cleanCpf;
        });
        
        if (client) {
          locatarioNome = client.nomeCompleto;
        } else {
          locatarioNome = locacao.clienteId; // Fallback para CPF
        }
      }
      
      return {
        id: locacao.id,
        locatario: locatarioNome || locacao.clienteId || '',
        placa: locacao.placaVeiculo,
        cpf: locacao.clienteId, // Mantém o CPF original formatado para exibição
      };
    });
  }, [locacoesData, clientsData]);

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];

    return rentals.filter(
      (rental) =>
        rental.locatario.toLowerCase().includes(searchByName.toLowerCase()) &&
        rental.placa.toLowerCase().includes(searchByPlate.toLowerCase()),
    );
  }, [rentals, searchByName, searchByPlate]);

  async function submitRental(rentalForm: AddRentalFormData) {
    console.log('submitRental - dados do formulário:', rentalForm);
    console.log('submitRental - valorLocacao original:', rentalForm.valorLocacao, 'tipo:', typeof rentalForm.valorLocacao);
    
    const cleanPlaca = rentalForm.placaVeiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanCpf = rentalForm.cnpjcpf.replace(/\D/g, '');
    
    // As datas já estão no formato DD/MM/YYYY, não precisam ser formatadas
    const formatDate = (dateString: string) => {
      return dateString; // Retorna como está, já está no formato correto
    };
    
    const valorNumerico = Number(rentalForm.valorLocacao);
    console.log('submitRental - valor convertido para número:', valorNumerico);
    
    const payload = {
      clienteId: cleanCpf,
      nomeLocatario: rentalForm.locatario,
      placaVeiculo: cleanPlaca,
      dataInicio: formatDate(rentalForm.inicio),
      dataFim: formatDate(rentalForm.fim),
      valor: valorNumerico,
      periodicidadePagamento: rentalForm.periodicidadePagamento
    };
    
    console.log('submitRental - payload final:', payload);

    try {
      const result = await createLocacao(payload) as LocacaoData;
      if (!result) {
        toast('Erro ao criar locação');
        throw new Error('Erro ao criar locação');
      }

      const client = await getClientByCpf(cleanCpf);
      const vehicle = await getVehicleByPlaca(cleanPlaca);

      // Generate contract
      const contractData: ContractData = {
        id: result.id,
        client: {
          nomeCompleto: client?.nomeCompleto || result.nomeLocatario || 'Não informado',
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
          marca: vehicle?.marca || 'Não informado',
          modelo: vehicle?.modelo || 'Não informado',
          placa: cleanPlaca,
          renavam: vehicle?.renavam || 'Não informado',
          chassi: vehicle?.chassi || 'Não informado',
          motor: vehicle?.motor || 'Não informado',
          cor: vehicle?.cor || 'Não informado',
          ano: vehicle?.ano || 'Não informado',
          quilometragem: vehicle?.quilometragem || '0',
        },
        locacao: {
          id: result.id,
          clienteId: cleanCpf,
          nomeLocatario: result.nomeLocatario || client?.nomeCompleto || 'Não informado',
          placaVeiculo: cleanPlaca,
          dataInicio: payload.dataInicio,
          dataFim: payload.dataFim,
          valor: payload.valor,
          periodicidadePagamento: payload.periodicidadePagamento || 'Mensal',
          status: result.status || 'ativa',
          dataCadastro: result.dataCadastro || new Date().toISOString(),
          dataAtualizacao: result.dataAtualizacao || new Date().toISOString(),
        },
      };

      generateContractPDF(contractData, 'download');

      toast('Locação criada com sucesso');
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      if (error.message?.includes('CPF inválido') || error.message?.includes('Nome não corresponde')) {
        toast.error(error.message);
      } else {
        toast('Erro ao criar locação');
      }
      throw error;
    }
  }

  const handleDeleteRental = async (id: string) => {
    try {
      await deleteLocacao(id);
      toast('Locação excluída com sucesso');
    } catch (e) {
      toast('Erro ao excluir locação');
    }
  };

  const handleViewContract = async (id: string) => {
    try {
      const locacoes = locacoesData?.locacoes || [];
      const locacao = locacoes.find((l: any) => l.id === id);
      if (!locacao) {
        throw new Error('Locação não encontrada');
      }

      const cleanCpf = locacao.clienteId.replace(/\D/g, '');
      const client = await getClientByCpf(cleanCpf);

      const cleanPlaca = locacao.placaVeiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const vehicle = await getVehicleByPlaca(cleanPlaca);

      const contractData: ContractData = {
        id,
        client: {
          nomeCompleto: client?.nomeCompleto || locacao.nomeLocatario || 'Não informado',
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
          marca: vehicle.marca || 'Não informado',
          modelo: vehicle.modelo || 'Não informado',
          placa: locacao.placaVeiculo,
          renavam: vehicle.renavam || 'Não informado',
          chassi: vehicle.chassi || 'Não informado',
          motor: vehicle.motor || 'Não informado',
          cor: vehicle.cor || 'Não informado',
          ano: vehicle.ano || 'Não informado',
          quilometragem: vehicle.quilometragem || '0',
        },
        locacao: {
          id: locacao.id,
          clienteId: locacao.clienteId,
          nomeLocatario: locacao.nomeLocatario || client?.nomeCompleto || 'Não informado',
          placaVeiculo: locacao.placaVeiculo,
          dataInicio: locacao.dataInicio,
          dataFim: locacao.dataFim,
          valor: locacao.valor,
          periodicidadePagamento: locacao.periodicidadePagamento || 'Mensal',
          status: locacao.status || 'ativa',
          dataCadastro: locacao.dataCadastro || new Date().toISOString(),
          dataAtualizacao: locacao.dataAtualizacao || new Date().toISOString(),
        },
      };

      // Fazer requisição ao backend para obter o PDF
      const response = await api.post('/api/locacoes/pdf', contractData, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (e: any) {
      toast('Erro ao gerar contrato: ' + e.message);
    }
  };


  const handleOpenForm = () => {
    setTypeModalOpen(true);
  };

  const handleTypeSelect = (type: 'fisica' | 'juridica') => {
    setClientType(type);
    setTypeModalOpen(false);
    setFormModalOpen(true);
  };

  function handleViewRental(id: string | number) {
    navigate(`/locacoes/${id}`);
  }

  return (
    <Layout title="Gerenciamento de locações" subtitle="Veja todas as locações">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <div className="flex gap-2 w-full pr-4">
            <SearchBar
              placeholder="Filtrar por locatário"
              value={searchByName}
              onChange={(e) => setsearchByName(e.target.value)}
            />

            <SearchBar
              placeholder="Filtrar por placa"
              value={searchByPlate}
              onChange={(e) => setSearchByPlate(e.target.value)}
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
            Erro ao carregar locações{locacoesError instanceof Error ? `: ${locacoesError.message}` : ''}
          </div>
        )}

        {!isLoadingLocacoes && !isErrorLocacoes && (
          <PaginatedTable
          data={filteredRentals}
          columns={[
            { key: 'client', title: 'Locatário' },
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
                    <div className="text-sm text-gray-500">{rental.cpf}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rental.placa}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rental.cpf}</td>
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
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Ver contrato
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
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
