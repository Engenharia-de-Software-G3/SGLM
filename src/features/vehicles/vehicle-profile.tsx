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

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  status: 'available' | 'rented' | 'maintenance';
  currentMileage: number;
  initialMileage: number;
  year: number;
  color: string;
  fuel: string;
  category: string;
  renavam: string;
  chassis: string;
  engine: string;
  doors: number;
  seats: number;
  transmission: string;
  acquisitionDate: string;
  acquisitionValue: number;
  dailyRate: number;
  insuranceCompany: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  licensePlateExpiry: string;
  nextMaintenanceKm: number;
}

const activities = [
  {
    id: 1,
    title: 'Entrega de veículo',
    date: '11.07.2024, 16:30 PM',
    status: 'No prazo e sem problemas',
    statusColor: 'text-green-600',
  },
  {
    id: 2,
    title: 'Devolução de Veículo',
    date: '11.05.2024, 16:30 PM',
    status: 'Atrasado e com problema',
    statusColor: 'text-red-600',
  },
  {
    id: 3,
    title: 'Manutenção Preventiva',
    date: '11.04.2024, 16:30 PM',
    status: 'Concluído',
    statusColor: 'text-blue-600',
  },
];


export const VehicleProfile = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  useEffect(() => {
    // Simulando busca de dados do veículo
    const mockVehicle: Vehicle = {
      id: vehicleId || '1',
      brand: 'Toyota',
      model: 'Corolla',
      plate: 'ABC-1234',
      status: 'available',
      currentMileage: 45000,
      initialMileage: 20000,
      year: 2022,
      color: 'Branco',
      fuel: 'Flex',
      category: 'Sedan',
      renavam: '12345678901',
      chassis: '9BWHE21JX24060831',
      engine: '2.0 16V',
      doors: 4,
      seats: 5,
      transmission: 'Automático',
      acquisitionDate: '2022-01-15',
      acquisitionValue: 85000,
      dailyRate: 120,
      insuranceCompany: 'Porto Seguro',
      insurancePolicy: 'PS123456789',
      insuranceExpiry: '2024-12-31',
      licensePlateExpiry: '2024-08-15',
      nextMaintenanceKm: 50000,
    };
    setVehicle(mockVehicle);
  }, [vehicleId]);

    const filterByVehicle = () => {
      localStorage.setItem("filterRentalsByVehicle", JSON.stringify(vehicle.plate || ''))
      navigate("/locacoes");
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
            brand={vehicle.brand}
            model={vehicle.model}
            plate={vehicle.plate}
            year={vehicle.year}
            color={vehicle.color}
            status={vehicle.status}
            category={vehicle.category}
            currentMileage={vehicle.currentMileage}
            dailyRate={vehicle.dailyRate}
            fuel={vehicle.fuel}
            nextMaintenanceKm={vehicle.nextMaintenanceKm}
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
                    <p className="text-sm">{vehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                    <p className="text-sm">{vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Placa</p>
                    <p className="text-sm">{vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ano</p>
                    <p className="text-sm">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cor</p>
                    <p className="text-sm">{vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Combustível</p>
                    <p className="text-sm">{vehicle.fuel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                    <p className="text-sm">{vehicle.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Transmissão</p>
                    <p className="text-sm">{vehicle.transmission}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">RENAVAM</p>
                    <p className="text-sm">{vehicle.renavam}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Chassi</p>
                    <p className="text-sm">{vehicle.chassis}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Motor</p>
                    <p className="text-sm">{vehicle.engine}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Portas</p>
                    <p className="text-sm">{vehicle.doors}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assentos</p>
                    <p className="text-sm">{vehicle.seats}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">KM Inicial</p>
                    <p className="text-sm">{vehicle.initialMileage.toLocaleString()} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Financeiras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Aquisição</p>
                    <p className="text-sm">
                      {new Date(vehicle.acquisitionDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor de Aquisição</p>
                    <p className="text-sm">R$ {vehicle.acquisitionValue.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Diário</p>
                    <p className="text-sm">R$ {vehicle.dailyRate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Seguro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Seguradora</p>
                    <p className="text-sm">{vehicle.insuranceCompany}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Apólice</p>
                    <p className="text-sm">{vehicle.insurancePolicy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Vencimento do Seguro
                    </p>
                    <p className="text-sm">
                      {new Date(vehicle.insuranceExpiry).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vencimento da Placa</p>
                    <p className="text-sm">
                      {new Date(vehicle.licensePlateExpiry).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => filterByVehicle()} className="bg-blue-600 hover:bg-blue-700 mt-5 w-100">
              Ver histórico de locações do veículo
          </Button>

        </div>

        {showActionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Mais Ações</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Editar Informações
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Histórico de Manutenções
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Gerar Relatório
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600">
                  Excluir Veículo
                </Button>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <VehicleActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        vehicleId={Number(vehicle.id)}
      />
    </Layout>
  );
};
