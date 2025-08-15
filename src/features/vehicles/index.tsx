// Refactored file: /home/user/Documentos/es/SGLM/src/features/vehicles/index.tsx
import { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { EditVehicleModal } from './components/edit-vehicle-modal';
import { statusColorMap } from '@/lib/utils';
import type { VeiculoFormulario } from '@/features/vehicles/types';

interface VehicleEdit extends VeiculoFormulario {
  id: number;
  statusColor: string;
}

export const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleEdit[]>([
    {
      id: 1,
      marca: 'Toyota',
      modelo: 'Corolla',
      placa: 'ABC-1234',
      ano: '2022',
      cor: 'Branco',
      chassi: '9BWHE21JX24060831',
      quilometragemAtual: '45000',
      quilometragemCompra: '20000',
      dataCompra: '2022-01-15',
      local: '',
      nome: '',
      observacoes: '',
      status: 'Disponível',
      statusColor: statusColorMap['Disponível'],
    },
    {
      id: 2,
      marca: 'Honda',
      modelo: 'Fan 150',
      placa: 'XXX-002',
      ano: '2021',
      cor: 'Vermelho',
      chassi: '9BWHE21JX24060832',
      quilometragemAtual: '25000',
      quilometragemCompra: '10000',
      dataCompra: '2021-06-10',
      local: '',
      nome: '',
      observacoes: '',
      status: 'Manutenção',
      statusColor: statusColorMap['Manutenção'],
    },
    {
      id: 3,
      marca: 'Yamaha',
      modelo: 'Scooter',
      placa: 'XXX-003',
      ano: '2023',
      cor: 'Azul',
      chassi: '9BWHE21JX24060833',
      quilometragemAtual: '15000',
      quilometragemCompra: '5000',
      dataCompra: '2023-03-05',
      local: '',
      nome: '',
      observacoes: '',
      status: 'Disponível',
      statusColor: statusColorMap['Disponível'],
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedVehicle] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleEdit | null>(null);

  useEffect(() => {
    console.log('Vehicles state updated:', vehicles);
  }, [vehicles]);

  const handleEdit = (id: number) => {
    const vehicle = vehicles.find((v) => v.id === id);
    if (vehicle) {
      console.log('Vehicle to edit:', vehicle);
      setVehicleToEdit(vehicle);
      setShowEditModal(true);
    }
  };

  const handleEditSave = (data: VeiculoFormulario) => {
    if (vehicleToEdit) {
      console.log('Received form data:', data);
      if (!data.status || !['Disponível', 'Locado', 'Manutenção'].includes(data.status)) {
        console.error('Error: Invalid or missing status');
        return;
      }
      const status = data.status;
      const updatedVehicle: VehicleEdit = {
        ...vehicleToEdit,
        marca: data.marca,
        modelo: data.modelo,
        placa: data.placa,
        ano: data.ano,
        cor: data.cor,
        chassi: data.chassi,
        quilometragemAtual: data.quilometragemAtual,
        quilometragemCompra: data.quilometragemCompra,
        dataCompra: data.dataCompra,
        local: data.local,
        nome: data.nome,
        observacoes: data.observacoes,
        status,
        statusColor: statusColorMap[status] || 'bg-gray-100 text-gray-800',
      };
      console.log('Updating vehicle:', updatedVehicle);
      setVehicles((prev) => {
        const newVehicles = prev.map((vehicle) =>
          vehicle.id === vehicleToEdit.id ? updatedVehicle : vehicle,
        );
        console.log('New vehicles state:', newVehicles);
        return [...newVehicles];
      });
      setShowEditModal(false);
      setVehicleToEdit(null);
    }
  };

  const handleActions = (id: number) => {
    navigate(`/veiculos/${id}`);
  };

  const handleDelete = (id: number) => {
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
  };

  const handleAddVehicleSubmit = (data: VeiculoFormulario) => {
    if (!data.status || !['Disponível', 'Locado', 'Manutenção'].includes(data.status)) {
      console.error('Error: Invalid or missing status in add vehicle');
      return;
    }
    const newVehicle: VehicleEdit = {
      id: vehicles.length + 1,
      marca: data.marca,
      modelo: data.modelo,
      placa: data.placa,
      ano: data.ano,
      cor: data.cor,
      chassi: data.chassi,
      quilometragemAtual: data.quilometragemAtual,
      quilometragemCompra: data.quilometragemCompra,
      dataCompra: data.dataCompra,
      local: data.local,
      nome: data.nome,
      observacoes: data.observacoes,
      status: data.status,
      statusColor: statusColorMap[data.status] || 'bg-gray-100 text-gray-800',
    };
    setVehicles((prev) => [...prev, newVehicle]);
    setShowAddModal(false);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      vehicle.placa.toLowerCase().includes(term) ||
      vehicle.marca.toLowerCase().includes(term) ||
      vehicle.modelo.toLowerCase().includes(term);
    const matchesStatus = statusFilter === '' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  console.log('Rendering with filteredVehicles:', filteredVehicles);
  console.log('Current statusFilter:', statusFilter);

  return (
    <Layout title="Gerenciamento de Veículos" subtitle="Veja a lista de todos os seus veículos">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por marca, modelo ou placa"
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
                hover:bg-red-100 hover:text-red-800
                ${statusFilter === 'Locado' ? 'bg-red-100 text-red-800 font-bold' : ''}
              `}
            >
              Locados
            </Button>
            <Button
              onClick={() => setStatusFilter('Manutenção')}
              className={`
                bg-white text-gray-700 border border-gray-300
                hover:bg-orange-100 hover:text-orange-800
                ${statusFilter === 'Manutenção' ? 'bg-orange-100 text-orange-800 font-bold' : ''}
              `}
            >
              Manutenção
            </Button>
            <Button
              onClick={() => setStatusFilter('Disponível')}
              className={`
                bg-white text-gray-700 border border-gray-300
                hover:bg-green-100 hover:text-green-800
                ${statusFilter === 'Disponível' ? 'bg-green-100 text-green-800 font-bold' : ''}
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
          key={JSON.stringify(vehicles)} // Atualizado para usar JSON.stringify do estado completo
          data={filteredVehicles}
          columns={[
            { key: 'marca', title: 'Marca do veículo' },
            { key: 'modelo', title: 'Modelo' },
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
                  <div className="font-medium">{vehicle.marca}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.modelo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.placa}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={vehicle.statusColor || 'bg-gray-100 text-gray-800'}>
                  {vehicle.status || 'Desconhecido'}
                </Badge>
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
                    onClick={() => handleEdit(vehicle.id)}
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
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddVehicleSubmit}
      />

      <EditVehicleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setVehicleToEdit(null);
        }}
        onSave={handleEditSave}
        vehicle={vehicleToEdit}
      />
    </Layout>
  );
};