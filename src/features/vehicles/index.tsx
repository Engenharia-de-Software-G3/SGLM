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
import { useNavigate } from 'react-router-dom';

export interface VehicleActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string | number | null;
}

export const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      plate: 'ABC-1234',
      brand: 'Toyota',
      model: 'Corolla',
      status: 'Disponível',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 2,
      plate: 'XXX-002',
      brand: 'Honda',
      model: 'Fan 150',
      status: 'Locado',
      statusColor: 'bg-red-100 text-red-800',
    },
    {
      id: 3,
      plate: 'XXX-003',
      brand: 'Yamaha',
      model: 'Scooter',
      status: 'Disponível',
      statusColor: 'bg-green-100 text-green-800',
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedVehicle] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleActions = (id: number) => {
    navigate(`/veiculos/${id}`);
  };

  const handleDelete = (id: number) => {
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
  };

  const handleAddVehicleSubmit = (data: VehicleFormData) => {
    const newVehicle = {
      id: vehicles.length + 1,
      plate: data.placa,
      brand: data.marca,
      model: data.modelo,
      status: 'Disponível',
      statusColor: 'bg-green-100 text-green-800',
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      vehicle.plate.toLowerCase().includes(term) ||
      vehicle.brand.toLowerCase().includes(term) ||
      vehicle.model.toLowerCase().includes(term);

    const matchesStatus = statusFilter === '' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout title="Gerenciamento de Veículos" subtitle="Veja a lista de todos os seus veículos">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por placa, status ou marca"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-4 ml-4">
            <Button
              onClick={() => setStatusFilter('')}
              className={`
                bg-white text-gray-700 border border-gray-300
                hover:bg-blue-100 hover:text-blue-700
                ${statusFilter === '' ? 'bg-blue-100 text-blue-700 font-bold' : ''}
              `}
            >
              Todos
            </Button>
            <Button
              onClick={() => setStatusFilter('Locado')}
              className={`
                 bg-white text-gray-700 border border-gray-300
                 hover:bg-red-100 hover:text-red-700
                 ${statusFilter === 'Locado' ? 'bg-red-100 text-red-700 font-bold' : ''}
               `}
            >
              Locados
            </Button>
            <Button
              onClick={() => setStatusFilter('Manuntenção')}
              className={`
                 bg-white text-gray-700 border border-gray-300
                 hover:bg-orange-100 hover:text-orange-700
                 ${statusFilter === 'Manuntenção' ? 'bg-orange-100 text-orange-700 font-bold' : ''}
               `}
            >
              Manutenção
            </Button>
            <Button
              onClick={() => setStatusFilter('Disponível')}
              className={`
                 bg-white text-gray-700 border border-gray-300
                 hover:bg-green-100 hover:text-green-700
                 ${statusFilter === 'Disponível' ? 'bg-green-100 text-green-700 font-bold' : ''}
               `}
            >
              Disponíveis
            </Button>
          </div>

          <ActionButton
            label="Adicionar veículo"
            icon={<Plus className="h-4 w-4 mr-1" />}
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={filteredVehicles}
          columns={[
            { key: 'marca', title: 'Marca do veículo' },
            { key: 'model', title: 'Modelo' },
            { key: 'placa', title: 'Placa' },
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
                  <div className="font-medium">{vehicle.brand}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.plate}</td>
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
        vehicleId={selectedVehicle ?? null}
      />

      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddVehicleSubmit}
      />
    </Layout>
  );
};
