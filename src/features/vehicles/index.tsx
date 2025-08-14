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
import type { VehicleEdit } from './components/edit-vehicle-modal/@types';

export const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleEdit[]>([
    {
      id: 1,
      plate: 'ABC-1234',
      brand: 'Toyota',
      model: 'Corolla',
      status: 'Disponível',
      statusColor: statusColorMap['Disponível'],
      year: 2022,
      color: 'Branco',
      fuel: 'Flex',
      category: 'Sedan',
      currentMileage: 45000,
      dailyRate: 120,
      initialMileage: 20000,
      renavam: '12345678901',
      chassis: '9BWHE21JX24060831',
      engine: '2.0 16V',
      doors: 4,
      seats: 5,
      transmission: 'Automático',
      acquisitionDate: '2022-01-15',
      acquisitionValue: 85000,
      insuranceCompany: 'Porto Seguro',
      insurancePolicy: 'PS123456789',
      insuranceExpiry: '2024-12-31',
      licensePlateExpiry: '2024-08-15',
      nextMaintenanceKm: 50000,
    },
    {
      id: 2,
      plate: 'XXX-002',
      brand: 'Honda',
      model: 'Fan 150',
      status: 'Manutenção',
      statusColor: statusColorMap['Manutenção'],
      year: 2021,
      color: 'Vermelho',
      fuel: 'Gasolina',
      category: 'Moto',
      currentMileage: 25000,
      dailyRate: 80,
      initialMileage: 10000,
      renavam: '98765432109',
      chassis: '9BWHE21JX24060832',
      engine: '150cc',
      doors: 0,
      seats: 2,
      transmission: 'Manual',
      acquisitionDate: '2021-06-10',
      acquisitionValue: 15000,
      insuranceCompany: 'Porto Seguro',
      insurancePolicy: 'PS987654321',
      insuranceExpiry: '2024-11-30',
      licensePlateExpiry: '2024-07-20',
      nextMaintenanceKm: 30000,
    },
    {
      id: 3,
      plate: 'XXX-003',
      brand: 'Yamaha',
      model: 'Scooter',
      status: 'Disponível',
      statusColor: statusColorMap['Disponível'],
      year: 2023,
      color: 'Azul',
      fuel: 'Gasolina',
      category: 'Moto',
      currentMileage: 15000,
      dailyRate: 60,
      initialMileage: 5000,
      renavam: '45678912345',
      chassis: '9BWHE21JX24060833',
      engine: '125cc',
      doors: 0,
      seats: 2,
      transmission: 'Automático',
      acquisitionDate: '2023-03-05',
      acquisitionValue: 12000,
      insuranceCompany: 'Porto Seguro',
      insurancePolicy: 'PS456789123',
      insuranceExpiry: '2025-01-15',
      licensePlateExpiry: '2024-09-10',
      nextMaintenanceKm: 20000,
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
      console.log('Data status:', data.status);
      console.log('Vehicle to edit status:', vehicleToEdit.status);
      if (!data.status || !['Disponível', 'Locado', 'Manutenção'].includes(data.status)) {
        console.error('Error: Invalid or missing status');
        return;
      }
      const status = data.status;
      console.log('Selected status:', status);
      const updatedVehicle = {
        ...vehicleToEdit,
        brand: data.marca,
        model: data.modelo,
        plate: data.placa,
        status,
        statusColor: statusColorMap[status] || 'bg-gray-100 text-gray-800',
        year: Number(data.ano),
        color: data.cor,
        fuel: data.combustivel,
        category: data.categoria,
        currentMileage: Number(data.quilometragemAtual),
        dailyRate: Number(data.valorDiario),
        initialMileage: Number(data.quilometragemCompra) || vehicleToEdit.initialMileage,
        renavam: data.renavam,
        chassis: data.chassi,
        engine: data.motor,
        doors: Number(data.portas),
        seats: Number(data.assentos),
        transmission: data.transmissao,
        acquisitionDate: data.dataCompra || vehicleToEdit.acquisitionDate,
        acquisitionValue: Number(data.valorDiario) * 365,
        insuranceCompany: vehicleToEdit.insuranceCompany,
        insurancePolicy: data.numeroDocumento || vehicleToEdit.insurancePolicy,
        insuranceExpiry: vehicleToEdit.insuranceExpiry,
        licensePlateExpiry: vehicleToEdit.licensePlateExpiry,
        nextMaintenanceKm: Number(data.proximaManutencao),
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
      plate: data.placa,
      brand: data.marca,
      model: data.modelo,
      status: data.status,
      statusColor: statusColorMap[data.status] || 'bg-gray-100 text-gray-800',
      year: Number(data.ano),
      color: data.cor,
      fuel: data.combustivel,
      category: data.categoria,
      currentMileage: Number(data.quilometragemAtual),
      dailyRate: Number(data.valorDiario),
      initialMileage: Number(data.quilometragemCompra) || 0,
      renavam: data.renavam,
      chassis: data.chassi,
      engine: data.motor,
      doors: Number(data.portas),
      seats: Number(data.assentos),
      transmission: data.transmissao,
      acquisitionDate: data.dataCompra || new Date().toISOString().split('T')[0],
      acquisitionValue: Number(data.valorDiario) * 365,
      insuranceCompany: '',
      insurancePolicy: data.numeroDocumento || '',
      insuranceExpiry: '',
      licensePlateExpiry: '',
      nextMaintenanceKm: Number(data.proximaManutencao),
    };
    setVehicles((prev) => [...prev, newVehicle]);
    setShowAddModal(false);
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
            { key: 'brand', title: 'Marca do veículo' },
            { key: 'model', title: 'Modelo' },
            { key: 'plate', title: 'Placa' },
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
