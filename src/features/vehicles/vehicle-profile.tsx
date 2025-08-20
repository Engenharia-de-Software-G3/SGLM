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
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  const {
    data: vehicle,
    isLoading: isLoadingVehicle,
    error: vehicleError,
  } = useGetVehicleQuery(Number(vehicleId));

  const {
    data: activities,
    isLoading: isLoadingActivities,
    error: activitiesError,
  } = useGetVehicleActivitiesQuery(Number(vehicleId));

  const filterByVehicle = () => {
    localStorage.setItem('filterRentalsByVehicle', JSON.stringify(vehicle?.placa || ''));
    navigate('/locacoes');
  };

  if (isLoadingVehicle || isLoadingActivities) {
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
    return (
      <Layout>
        <ReturnHeader title="Perfil do Veículo" onBack={() => navigate('/veiculos')} />
        <div className="p-6 text-center">
          <p className="text-red-600">Erro ao carregar dados do veículo</p>
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
          <VehicleInfoCard
            marca={vehicle.marca}
            modelo={vehicle.modelo}
            placa={vehicle.placa}
            ano={vehicle.ano}
            cor={vehicle.cor}
            status="Disponível"
            quilometragemAtual={vehicle.quilometragem || '0'}
          />

          {activitiesError ? (
            <div className="mt-4 text-red-600">Erro ao carregar atividades recentes</div>
          ) : (
            <VehicleRecentActivitiesCard
              activities={activities || []}
              onFilterByVehicle={filterByVehicle}
              isLoading={isLoadingActivities}
            />
          )}
        </div>
      </div>

      <VehicleActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        vehicleId={Number(vehicleId)}
      />
    </Layout>
  );
};
