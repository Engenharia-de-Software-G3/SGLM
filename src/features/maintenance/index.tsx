import { useEffect, useState } from 'react';
import { Layout } from '@/shared/components/layout';
import { Plus, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { PaginatedTable } from '@/shared/components/display-table';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { AddMaintenanceModal } from './components/add-maintenance-modal';
import {
  getManutencoes,
  createManutencao,
  deleteManutencao,
} from '@/services/maintenance/functions';
import { Manutencao, CreateManutencaoRequest } from '@/services/maintenance/types';
import { UpdateModal } from '@/shared/components/update-modal';

export const Maintenance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchManutencoes = async () => {
      setLoading(true);
      try {
        const allManutencoes = await getManutencoes();
        setManutencoes(allManutencoes);
      } catch (err) {
        console.error('Erro ao buscar manutenções:', err);
        setManutencoes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchManutencoes();
  }, []);

  useEffect(() => {
    const storedVehicle = localStorage.getItem('filterMaintenanceByVehicle');
    if (storedVehicle) {
      try {
        const placa = JSON.parse(storedVehicle);
        setSearchTerm(placa);
      } catch (error) {
        console.error('Erro ao parsear filterMaintenanceByVehicle:', error);
      }
      localStorage.removeItem('filterMaintenanceByVehicle');
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteManutencao(id);
      await loadManutencoes();
    } catch (error) {
      console.error('Erro ao deletar manutenção:', error);
    }
  };

  const loadManutencoes = async () => {
    setLoading(true);
    try {
      const res = await getManutencoes();
      const manutencoesList = Array.isArray(res) ? res : [];
      setManutencoes(manutencoesList);
    } catch (err) {
      console.error('Erro ao buscar manutenções:', err);
      setManutencoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data: CreateManutencaoRequest) => {
    try {
      await createManutencao(data);
      await loadManutencoes();
    } catch (error) {
      console.error('Erro ao criar manutenção:', error);
    }
  };

  const filtered = Array.isArray(manutencoes)
    ? manutencoes.filter(
        (m) =>
          m.nomeServico.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.placaVeiculo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  return (
    <Layout title="Manutenções" subtitle="Lista de serviços de manutenção realizados">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por manutenção"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <AddMaintenanceModal
            onAdd={handleAdd}
            trigger={
              <ActionButton
                label="Adicionar manutenção"
                icon={<Plus className="h-4 w-4 mr-1" />}
                className="bg-blue-600 hover:bg-blue-700"
              />
            }
          />
        </DisplayTableHeader>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <PaginatedTable
            data={filtered}
            columns={[
              { key: 'maintenance', title: 'Serviço' },
              { key: 'plate', title: 'Placa' },
              { key: 'date', title: 'Data' },
              { key: 'value', title: 'Valor' },
              { key: 'mileage', title: 'Quilometragem' },
              { key: 'status', title: 'Status' },
              { key: 'actions', title: 'Ações' },
            ]}
            renderRow={(m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{m.nomeServico}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {m.placaVeiculo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(m.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {m.valor.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {m.quilometragem} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={m.status || 'em_andamento'} type="maintenance" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <UpdateModal
                      title="Tem certeza que deseja atualizar o status dessa manutenção?"
                      description=""
                      actionText="Atualizar manutenção"
                      onConfirm={() => handleDelete(m.id)}
                    />
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </Layout>
  );
};
