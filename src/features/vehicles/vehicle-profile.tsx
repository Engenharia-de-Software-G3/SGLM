import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { VehicleInfoCard } from '../vehicles/components/vehicle-info-card';
import { VehicleRecentActivitiesCard } from '../vehicles/components/vehicle-recent-activities-card';
import { Layout } from '@/shared/components/layout';
import { ReturnHeader } from '@/shared/components/return-header';
import { VehicleActionDialog } from './components/vehicle-action-dialog';
import { useGetVehicleQuery, useGetVehicleActivitiesQuery } from '@/services/vehicle';

export const VehicleProfile = () => {
  const { chassi } = useParams<{ chassi: string }>();
  const navigate = useNavigate();
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Buscar dados do veículo
  const {
    data: vehicle,
    isLoading: isLoadingVehicle,
    error: vehicleError,
  } = useGetVehicleQuery(chassi || '');

  // Buscar atividades do veículo
  const {
    data: activities = [], // Valor padrão para evitar undefined
    isLoading: isLoadingActivities,
  } = useGetVehicleActivitiesQuery(chassi || '');

  const filterByVehicle = () => {
    if (vehicle?.placa) {
      localStorage.setItem('filterRentalsByVehicle', JSON.stringify(vehicle.placa));
      navigate('/locacoes');
    }
  };

  if (isLoadingVehicle) {
    return (
      <Layout>
        <ReturnHeader title="Perfil do Veículo" onBack={() => navigate('/veiculos')} />
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (vehicleError || !vehicle) {
    console.error('❌ Vehicle error:', vehicleError);
    console.error('❌ Chassi used:', chassi);

    return (
      <Layout>
        <ReturnHeader title="Perfil do Veículo" onBack={() => navigate('/veiculos')} />
        <div className="p-6 text-center">
          <p className="text-red-600 mb-2">Erro ao carregar dados do veículo</p>
          <p className="text-gray-600 text-sm">Chassi: {chassi || 'não fornecido'}</p>
          <p className="text-gray-600 text-sm">
            Erro: {vehicleError?.message || 'Erro desconhecido'}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ReturnHeader title="Perfil do Veículo" onBack={() => navigate('/veiculos')} />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4"></div>
          <Button
            variant="outline"
            onClick={() => setIsActionDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <MoreHorizontal className="w-4 h-4" />
            Mais ações
          </Button>
        </div>

        <div className="p-6">
          { vehicle && (
          <VehicleInfoCard
            marca={vehicle.marca}
            modelo={vehicle.modelo}
            placa={vehicle.placa}
            ano={vehicle.ano}
            cor={vehicle.cor}
            status={vehicle.status}
            quilometragemAtual={vehicle.quilometragem}
            />
          )}

          <VehicleRecentActivitiesCard
            activities={activities}
            isLoading={isLoadingActivities} // Passando isLoading das atividades
          />
        </div>
      </div>

      <VehicleActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        vehicleId={chassi || ''}
        onFilterByVehicle={filterByVehicle}
      />
    </Layout>
  );
};
