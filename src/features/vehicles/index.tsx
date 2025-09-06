import { useEffect, useMemo, useState } from 'react';
import { Car, Edit, FileText, Plus } from 'lucide-react';
import { Layout } from '../../shared/components/layout';
import { PaginatedTable } from '@/shared/components/display-table';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { DeleteModal } from '@/shared/components/delete-modal';
import { Badge } from '@/components/ui/badge';
import { AddVehicleModal } from './components/add-vehicle-modal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EditVehicleModal } from './components/edit-vehicle-modal';
import type { VeiculoFormulario } from '@/features/vehicles/types';
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useUpdateVehicleMutation,
  useVehiclesQuery,
} from '@/services/vehicle';
import {
  CreateVehicleInterface,
  StatusVehicle,
  UpdateVehicleInterface,
  VehicleData,
} from '@/services/vehicle/types';
import { toast, Toaster } from 'sonner';

function getStatusProps(status: StatusVehicle) {
  switch (status) {
    case 'disponivel':
      return { className: 'bg-green-100 text-green-800', text: 'Disponível' };
    case 'alugado':
      return { className: 'bg-red-100 text-red-800', text: 'Locado' };
    case 'manutencao':
      return { className: 'bg-orange-100 text-orange-800', text: 'Manutenção' };
    default:
      return { className: 'bg-gray-100 text-gray-800', text: 'Indefinido' };
  }
}

export const Vehicles = () => {
  const navigate = useNavigate();

  const { mutate: createVehicle } = useCreateVehicleMutation();
  const { mutate: deleteVehicle } = useDeleteVehicleMutation();
  const { mutate: updateVehicle } = useUpdateVehicleMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusVehicle | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleData | null>(null);

  const { data: vehicles } = useVehiclesQuery({
    status: statusFilter,
    search: searchTerm,
    page: 1,
  });

  const handleEditSave = (data: VeiculoFormulario) => {
    if (vehicleToEdit) {
      if (!data.status || !['disponivel', 'alugado', 'manutencao'].includes(data.status)) {
        console.error('Error: Invalid or missing status');
        return;
      }

      if (!vehicleToEdit.id) {
        toast.error('Ocorreu um erro');
        console.error('Error: Vehicle ID is required');
        return;
      }

      if (data.quilometragemAtual < data.quilometragemCompra) {
        toast.error('A quilometragem atual não pode ser menor que a quilometragem de compra');
        return;
      }

      updateVehicle({ id: vehicleToEdit.id.toString(), payload: data as UpdateVehicleInterface });
    }
  };

  const handleOpenEditModal = (id: string) => {
    const vehicle = vehicles?.veiculos.find((v: { id: string }) => v.id === id);

    console.log(`vehicle: searched`, { vehicle });
    if (vehicle) {
      setVehicleToEdit(vehicle);
      setShowEditModal(true);
    }
  };

  const handleActions = (id: string) => {
    navigate(`/veiculos/${id}`);
  };

  const handleDelete = (id: string) => {
    const vehicle = vehicles?.veiculos.find((v: { id: string }) => v.id === id);
    if (vehicle?.status === 'alugado') {
      toast.error('O veículo está locado e não pode ser excluído');
      return;
    }

    if (vehicle?.status === 'manutencao') {
      toast.error('O veículo está em manutenção e não pode ser excluído');
      return;
    }

    deleteVehicle(id);
  };

  const handleAddVehicleSubmit = (data: VeiculoFormulario) => {
    console.log(`data before submiting: `, { data });

    const payload: CreateVehicleInterface = {
      chassi: data.chassi,
      dataCompra: data.dataCompra,
      local: data.local,
      marca: data.marca,
      modelo: data.modelo,
      nome: data.nome,
      cor: data.cor,
      observacoes: data.observacoes,
      placa: data.placa,
      quilometragem: data.quilometragemAtual,
      quilometragemNaCompra: data.quilometragemCompra,
      ano: data.ano,
      renavam: '',
      status: data.status,
      dataCadastro: data.dataCompra,
      dataAtualizacao: '',
      dataVenda: '',
      file: data.arquivo,
    };

    if (data.quilometragemAtual < data.quilometragemCompra) {
      toast.error('A quilometragem atual não pode ser menor que a quilometragem de compra');
      return;
    }

    console.log(`payload before submiting: `, { payload });

    createVehicle(payload);
  };

  const filteredVehicles = useMemo(() => {
    if (!vehicles?.veiculos) return [];
    return vehicles.veiculos;
  }, [vehicles]);

  useEffect(() => {
    console.log({ vehicles });
  }, [vehicles]);

  return (
    <Layout title="Gerenciamento de Veículos" subtitle="Veja a lista de todos os seus veículos">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por marca"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-4 ml-4">
            <Button
              onClick={() => setStatusFilter(undefined)}
              className={`
                bg-white text-gray-700 border border-gray-300
                hover:bg-blue-100 hover:text-blue-700
                ${statusFilter === undefined ? 'bg-blue-100 text-blue-700 font-bold' : ''}
              `}
            >
              Todos
            </Button>
            <Button
              onClick={() => setStatusFilter('disponivel')}
              className={`
                bg-white text-gray-700 border border-gray-300
                hover:bg-green-100 hover:text-green-800
                ${statusFilter === 'disponivel' ? 'bg-green-100 text-green-800 font-bold' : ''}
              `}
            >
              Disponíveis
            </Button>
            <Button
              onClick={() => setStatusFilter('alugado')}
              className={`
                bg-white text-gray-700 border border-gray-300
                hover:bg-red-100 hover:text-red-800
                ${statusFilter === 'alugado' ? 'bg-red-100 text-red-800 font-bold' : ''}
              `}
            >
              Locados
            </Button>
            <Button
              onClick={() => setStatusFilter('manutencao')}
              className={`
                bg-white text-gray-700 border border-gray-300
                hover:bg-orange-100 hover:text-orange-800
                ${statusFilter === 'manutencao' ? 'bg-orange-100 text-orange-800 font-bold' : ''}
              `}
            >
              Manutenção
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
          key={vehicles?.veiculos?.length || 0}
          data={filteredVehicles || []}
          columns={[
            { key: 'marca', title: 'Marca do veículo' },
            { key: 'modelo', title: 'Modelo' },
            { key: 'placa', title: 'Placa' },
            { key: 'status', title: 'Status' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(vehicle: VehicleData) => (
            <tr key={vehicle.chassi} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-medium">{vehicle.marca}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {vehicle.modelo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.placa}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getStatusProps(vehicle.status).className}>
                  {getStatusProps(vehicle.status).text}
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
                    onClick={() => handleOpenEditModal(vehicle.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

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

      <Toaster />
    </Layout>
  );
};
