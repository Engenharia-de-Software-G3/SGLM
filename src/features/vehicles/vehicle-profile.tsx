import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { VehicleInfoCard } from '../vehicles/components/vehicle-info-card';
import { VehicleRecentActivitiesCard } from '../vehicles/components/vehicle-recent-activities-card';
import { Layout } from '@/shared/components/layout';
import { ReturnHeader } from '@/shared/components/return-header';
import { VehicleActionDialog } from './components/vehicle-action-dialog';
import { useGetVehicleQuery, useGetVehicleActivitiesQuery, useUpdateVehicleMutation } from '@/services/vehicle';
import type { VehicleData } from '@/services/vehicle/types';
import { toast } from 'sonner';
import { queryClient } from '@/lib/tanstack/query-client';

export const VehicleProfile = () => {
  const { chassi } = useParams<{ chassi: string }>();
  const navigate = useNavigate();
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleData | null>(null);
  const [localVehicle, setLocalVehicle] = useState<VehicleData | null>(null);

  const { mutate: updateVehicle } = useUpdateVehicleMutation();

  const {
    data: vehicleQuery,
    isLoading: isLoadingVehicle,
    error: vehicleError,
  } = useGetVehicleQuery(chassi || '');

  useEffect(() => {
     if (vehicleQuery) setLocalVehicle(vehicleQuery);
  }, [vehicleQuery]);

  const {
    data: activities = [],
    isLoading: isLoadingActivities,
  } = useGetVehicleActivitiesQuery(chassi || '');

  const handleOpenActionDialog = () => {
    if (localVehicle) {
      setVehicleToEdit(localVehicle);
      setIsActionDialogOpen(true);
    }
  };

  const handleEditSave = (data: Partial<VehicleData>) => {
    if (!vehicleToEdit) return;

    updateVehicle(
      { id: vehicleToEdit.id, payload: data },
      {
        onSuccess: () => {
          setLocalVehicle((prev) => (prev ? { ...prev, ...data } : prev));
          toast.success('Quilometragem atualizada com sucesso!');
          queryClient.invalidateQueries({ queryKey: ['vehicle'] });
          setIsActionDialogOpen(false);
          setVehicleToEdit(null);
        },
        onError: () => toast.error('Erro ao atualizar veículo'),
      }
    );
  };

  const filterByVehicle = () => {
    if (localVehicle?.placa) {
      localStorage.setItem('filterRentalsByVehicle', JSON.stringify(localVehicle.placa));
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

  if (vehicleError || !localVehicle) {
    console.error('❌ Vehicle error:', vehicleError);
    console.error('❌ Chassi usado:', chassi);

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
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <Button
            variant="outline"
            onClick={handleOpenActionDialog}
            className="flex items-center gap-2"
          >
            <MoreHorizontal className="w-4 h-4" />
            Mais ações
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {localVehicle && (
            <VehicleInfoCard
              marca={localVehicle.marca}
              modelo={localVehicle.modelo}
              placa={localVehicle.placa}
              ano={localVehicle.ano}
              cor={localVehicle.cor}
              status={localVehicle.status}
              quilometragemAtual={localVehicle.quilometragem}
            />
          )}

          <VehicleRecentActivitiesCard
            activities={activities}
            isLoading={isLoadingActivities}
          />
        </div>
      </div>

      <VehicleActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        onSave={handleEditSave}
        vehicle={localVehicle}
        onFilterByVehicle={filterByVehicle}
      />
    </Layout>
  );
};
