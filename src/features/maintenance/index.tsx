import { useState } from 'react';
import { Layout } from '@/shared/components/layout';
import { Plus, Edit, FileText } from 'lucide-react';
import { PaginatedTable } from '@/shared/components/display-table';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { DeleteModal } from '@/shared/components/delete-modal';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { AddMaintenanceModal } from './components/add-maintenance-modal';

const maintenances = [
  {
    id: 1,
    name: 'Troca de Óleo',
    supplier: 'Fornecedor X',
    plate: 'XXX-0001',
    date: '30/06/2025',
    value: 'R$ 150,00',
    mileage: '10.000 km',
  },
  {
    id: 2,
    name: 'Manutenção dos Freios',
    supplier: 'Fornecedor X',
    plate: 'XXX-0002',
    date: '28/06/2025',
    value: 'R$ 250,00',
    mileage: '15.000 km',
  },
  {
    id: 3,
    name: 'Revisão Geral',
    supplier: 'Fornecedor Y',
    plate: 'XXX-0003',
    date: '01/07/2025',
    value: 'R$ 400,00',
    mileage: '20.000 km',
  },
];

export const Maintenance = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleView = (id: number) => {
    console.log('Visualizar manutenção', id);
  };

  const handleDelete = (id: number) => {
    console.log('Excluir manutenção', id);
  };

  return (
    <Layout title="Manutenções" subtitle="Lista de serviços de manuntenção realizados">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por manuntenção"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <AddMaintenanceModal
            onAdd={(data) => console.log('Nova manutenção adicionada:', data)}
            trigger={
              <ActionButton
                label="Adicionar manutenção"
                icon={<Plus className="h-4 w-4 mr-1" />}
                className="bg-blue-600 hover:bg-blue-700"
              />
            }
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={maintenances}
          columns={[
            { key: 'maintenance', title: 'Serviço' },
            { key: 'plate', title: 'Placa' },
            { key: 'date', title: 'Data' },
            { key: 'value', title: 'Valor' },
            { key: 'mileage', title: 'Quilometragem' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(maintenance) => (
            <tr key={maintenance.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{maintenance.name}</div>
                  <div className="text-sm text-gray-500">{maintenance.supplier}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {maintenance.plate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {maintenance.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {maintenance.value}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {maintenance.mileage}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(maintenance.id)}
                    className="text-orange-600 border-orange-300 hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>

                  <DeleteModal
                    title="Tem certeza que deseja excluir esta manutenção?"
                    description="Todos os dados salvos serão excluídos."
                    actionText="Excluir manutenção"
                    onConfirm={() => handleDelete(maintenance.id)}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </Layout>
  );
};
