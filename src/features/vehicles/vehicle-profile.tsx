import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { VehicleInfoCard } from '../vehicles/components/vehicle-info-card';
import { VehicleRecentActivitiesCard } from '../vehicles/components/vehicle-recent-activities-card';
import { Layout } from '@/shared/components/layout/index';
import { ReturnHeader } from '@/shared/components/return-header/index';
import { VehicleActionDialog } from './components/vehicle-action-dialog/index';
import type { VeiculoEditado } from '../vehicles/components/edit-vehicle-modal/@types';

const activities = [
  {
    id: 1,
    title: 'Entrega de veículo',
    date: '11.07.2024, 16:30',
    status: 'No prazo e sem problemas',
    statusColor: 'text-green-600',
  },
  {
    id: 2,
    title: 'Devolução de Veículo',
    date: '11.05.2024, 16:30',
    status: 'Atrasado e com problema',
    statusColor: 'text-red-600',
  },
  {
    id: 3,
    title: 'Manutenção Preventiva',
    date: '11.04.2024, 16:30',
    status: 'Concluído',
    statusColor: 'text-blue-600',
  },
];

export const VehicleProfile = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<VeiculoEditado | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  useEffect(() => {
    // Simulando busca de dados do veículo
    const mockVehicle: VeiculoEditado = {
      id: Number(vehicleId) || 1,
      marca: 'Toyota',
      modelo: 'Corolla',
      placa: 'ABC-1234',
      ano: '2022',
      cor: 'Branco',
      chassi: '9BWHE21JX24060831',
      quilometragemAtual: '45000',
      quilometragemCompra: '20000',
      dataCompra: '15/01/2022',
      local: '',
      nome: '',
      observacoes: '',
      status: 'Disponível',
      statusColor: 'bg-green-100 text-green-800',
      arquivo: null,
    };
    setVehicle(mockVehicle);
  }, [vehicleId]);

  const filterByVehicle = () => {
    localStorage.setItem('filterRentalsByVehicle', JSON.stringify(vehicle?.placa || ''));
    navigate('/locacoes');
  };

  if (!vehicle) {
    return <div className="p-6">Carregando...</div>;
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
            status={vehicle.status}
            quilometragemAtual={vehicle.quilometragemAtual}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <VehicleRecentActivitiesCard activities={activities} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Marca</p>
                    <p className="text-sm">{vehicle.marca}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                    <p className="text-sm">{vehicle.modelo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Placa</p>
                    <p className="text-sm">{vehicle.placa}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ano</p>
                    <p className="text-sm">{vehicle.ano}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cor</p>
                    <p className="text-sm">{vehicle.cor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especificações Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Chassi</p>
                    <p className="text-sm">{vehicle.chassi}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quilometragem Inicial</p>
                    <p className="text-sm">{parseInt(vehicle.quilometragemCompra).toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quilometragem Atual</p>
                    <p className="text-sm">{parseInt(vehicle.quilometragemAtual).toLocaleString()} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Aquisição</p>
                    <p className="text-sm">
                      {new Date(vehicle.dataCompra).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Local</p>
                    <p className="text-sm">{vehicle.local}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="text-sm">{vehicle.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-sm">{vehicle.observacoes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => filterByVehicle()} className="bg-blue-600 hover:bg-blue-700 mt-5 w-full">
            Ver histórico de locações do veículo
          </Button>
        </div>
      </div>

      <VehicleActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        vehicleId={vehicle.id}
      />
    </Layout>
  );
};