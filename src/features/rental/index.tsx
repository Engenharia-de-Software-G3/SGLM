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
import { useClientsQuery } from '@/services/client';
import { useCreateLocacaoMutation, useDeleteLocacaoMutation, useLocacoesQuery } from '@/services/rental';
import { toast } from 'sonner';

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
  const { mutateAsync: createLocacao, isPending: isCreating } = useCreateLocacaoMutation();
  const { mutateAsync: deleteLocacao, isPending: isDeleting } = useDeleteLocacaoMutation();

  const cpfToClientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (clientsData?.clientes) {
      for (const client of clientsData.clientes) {
        const cleanCpf = client.cpf.replace(/\D/g, '');
        map.set(cleanCpf, client.nomeCompleto);
      }
    }
    return map;
  }, [clientsData]);

  const rentals: DisplayRentalData[] = useMemo(() => {
    const source = Array.isArray(locacoesData?.locacoes) ? locacoesData!.locacoes : [];
    return source.map((locacao) => {
      const cleanId = String(locacao.clienteId ?? '').replace(/\D/g, '');
      const locatarioNome = cpfToClientNameMap.get(cleanId) ?? locacao.clienteId;
      return {
        id: locacao.id,
        locatario: locatarioNome,
        placa: locacao.placaVeiculo,
        cpf: cleanId,
      };
    });
  }, [locacoesData, cpfToClientNameMap]);

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];

    return rentals.filter(
      (rental) =>
        rental.locatario.toLowerCase().includes(searchByName.toLowerCase()) &&
        rental.placa.toLowerCase().includes(searchByPlate.toLowerCase()),
    );
  }, [rentals, searchByName, searchByPlate]);

  async function submitRental(rentalForm: AddRentalFormData) {
    const cleanPlaca = rentalForm.placaVeiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanCpf = rentalForm.cnpjcpf.replace(/\D/g, '');
    const payload = {
      cpfLocatario: cleanCpf,
      placaVeiculo: cleanPlaca,
      dataInicio: rentalForm.inicio,
      dataFim: rentalForm.fim,
      valor: Number(rentalForm.valorLocacao),
    };

    const result = await createLocacao(payload);
    if (!result) {
      toast('Erro ao criar locação');
      throw new Error('Erro ao criar locação');
    }
    toast('Locação criada com sucesso');
  }

  const handleDeleteRental = async (id: string) => {
    try {
      await deleteLocacao(id);
      toast('Locação excluída com sucesso');
    } catch (e) {
      toast('Erro ao excluir locação');
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
                    <div className="text-sm text-gray-500">{rental.locatario}</div>
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
