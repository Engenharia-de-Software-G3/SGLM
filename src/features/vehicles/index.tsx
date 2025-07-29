import { useState } from 'react';
import { Car, Edit, FileText, Plus } from 'lucide-react';
import { Layout } from '../../shared/components/layout';
import { PaginatedTable } from '@/shared/components/display-table';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { DeleteModal } from '@/shared/components/delete-modal';
import { Badge } from '@/components/ui/badge';
import { VehicleActionDialog } from './components/vehicle-action-dialog';
import { AddVehicleModal } from './components/add-vehicle-modal';
import { Button } from '@/components/ui/button';
import type { VehicleFormData } from './components/add-vehicle-modal/@types';

const vehicles = [
  {
    id: 1,
    name: 'Lorem Ipsum',
    plate: 'XXX-001',
    brand: 'Toyota',
    status: 'Manuntenção',
    statusColor: 'bg-orange-100 text-orange-800',
  },
  {
    id: 2,
    name: 'Lorem Ipsum',
    plate: 'XXX-002',
    brand: 'BYD',
    status: 'Locado',
    statusColor: 'bg-red-100 text-red-800',
  },
  {
    id: 3,
    name: 'Lorem Ipsum',
    plate: 'XXX-003',
    brand: 'Honda',
    status: 'Disponível',
    statusColor: 'bg-green-100 text-green-800',
  },
];

export const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleActions = (id: number) => {
    setSelectedVehicle(id);
    setShowActionDialog(true);
  };

  const handleDelete = (id: number) => {
    console.log('Excluir veículo', id);
  };

  const handleAddVehicleSubmit = (data: VehicleFormData) => {
    console.log('Novo veículo cadastrado:', data);
    // Aqui você pode atualizar a lista de veículos ou fazer uma chamada para backend
  };

  return (
    <Layout title="Gerenciamento de Veículos" subtitle="Veja a lista de todos os seus veículos">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por placa, status ou marca"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <ActionButton
            label="Adicionar veículo"
            icon={<Plus className="h-4 w-4 mr-1" />}
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={vehicles}
          columns={[
            { key: 'veiculo', title: 'Veículo' },
            { key: 'placa', title: 'Placa' },
            { key: 'marca', title: 'Marca' },
            { key: 'status', title: 'Status' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(vehicle) => (
            <tr key={vehicle.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-medium">{vehicle.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.plate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.brand}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={vehicle.statusColor}>{vehicle.status}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleActions(vehicle.id)}
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>

                  <DeleteModal
                    title="Tem certeza que você deseja excluir este veículo?"
                    description="Todos os dados salvos serão excluídos."
                    actionText="Excluir veículo"
                    onConfirm={() => handleDelete(vehicle.id)}
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

      <VehicleActionDialog
        isOpen={showActionDialog}
        onClose={() => setShowActionDialog(false)}
        vehicleId={selectedVehicle}
      />

      <AddVehicleModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddVehicleSubmit}
      />
    </Layout>
  );
};
