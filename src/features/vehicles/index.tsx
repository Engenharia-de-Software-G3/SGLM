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
import { useCreateVehicleMutation, useDeleteVehicleMutation, useUpdateVehicleMutation, useVehiclesQuery } from '@/services/vehicle';
import { CreateVehicleInterface, StatusVehicle, UpdateVehicleInterface, VehicleData } from '@/services/vehicle/types';
import { toast } from 'sonner';

export const Vehicles = () => {
  const navigate = useNavigate();
  const { data: vehicles } = useVehiclesQuery();

  const { mutate: createVehicle } = useCreateVehicleMutation();
  const { mutate: deleteVehicle } = useDeleteVehicleMutation();
  const { mutate: updateVehicle } = useUpdateVehicleMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleData | null>(null);

  useEffect(() => {
    console.log(vehicles);
  }, [vehicles]);

  const handleEditSave = (data: VeiculoFormulario) => {
    if (vehicleToEdit) {
      if (!data.status || !['disponivel', 'locado', 'vendido'].includes(data.status)) {
        console.error('Error: Invalid or missing status');
        return;
      }

      if (!vehicleToEdit.id) {
        toast.error('Ocorreu um erro');
        console.error('Error: Vehicle ID is required');
        return;
      }

      updateVehicle({ id: vehicleToEdit.id.toString(), payload: data as UpdateVehicleInterface });
    }
  };

  const handleOpenEditModal = (id: string) => {
    const vehicle = vehicles?.veiculos.find((v) => v.id === id);
    if (vehicle) {
      setVehicleToEdit(vehicle);
      setShowEditModal(true);
    }
  };

  const handleActions = (id: string) => {
    navigate(`/veiculos/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteVehicle(id);
  };

  const handleAddVehicleSubmit = (data: VeiculoFormulario) => {
    console.log(`data before submiting: `, { data})

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
      renavam: "",
      status: data.status as StatusVehicle,
      dataCadastro: data.dataCompra,
      dataAtualizacao: "",
      dataVenda: "",
      file: data.arquivo,
    };

    console.log(`payload before submiting: `, { payload})

    createVehicle(payload);
  };

  const filteredVehicles = useMemo(() => {
    if (!vehicles || !vehicles.veiculos) return [];

    // return vehicles?.vehicles.filter((vehicle) => {
    //   const term = searchTerm.toLowerCase();
    //   const matchesSearch =
    //     vehicle.placa.toLowerCase().includes(term) ||
    //     vehicle.marca.toLowerCase().includes(term) ||
    //     vehicle.modelo.toLowerCase().includes(term);
    //   // const matchesStatus = statusFilter === '' 
    //   // return matchesSearch ;
    //   return true;
    // });
    return vehicles.veiculos
  }, [vehicles])

  useEffect(() => {
    console.log({vehicles})
  }, [vehicles])

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
          key={vehicles?.veiculos?.length || 0} // Simplificado para reagir a mudanças no array
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
                <Badge className={'bg-gray-100 text-gray-800'}>
                  {/* {vehicle.status || 'Desconhecido'} */}
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
        vehicle={vehicleToEdit }
      />
    </Layout>
  );
};