import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MoreHorizontal, Car, Gauge, Calendar } from 'lucide-react';
import { VehicleActionDialog } from './components/vehicle-action-dialog';

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

export const VehicleProfile = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

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

  if (!vehicle) {
    return <div>Carregando...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'rented':
        return 'bg-blue-500';
      case 'maintenance':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'rented':
        return 'Locado';
      case 'maintenance':
        return 'Manutenção';
      default:
        return 'Desconhecido';
    }
  };

  const kmUsed = vehicle.currentMileage - vehicle.initialMileage;
  const kmToMaintenance = vehicle.nextMaintenanceKm - vehicle.currentMileage;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/veiculos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-muted-foreground">{vehicle.plate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(vehicle.status)}>{getStatusText(vehicle.status)}</Badge>
          <Button variant="outline" onClick={() => setIsActionDialogOpen(true)}>
            <MoreHorizontal className="w-4 h-4 mr-2" />
            Mais ações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quilometragem</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicle.currentMileage.toLocaleString()} km</div>
            <p className="text-xs text-muted-foreground">
              +{kmUsed.toLocaleString()} km desde a aquisição
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Manutenção</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicle.nextMaintenanceKm.toLocaleString()} km
            </div>
            <p className="text-xs text-muted-foreground">
              Em {kmToMaintenance.toLocaleString()} km
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Diário</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {vehicle.dailyRate}</div>
            <p className="text-xs text-muted-foreground">Por dia</p>
          </CardContent>
        </Card>
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
                <p className="text-sm font-medium text-muted-foreground">Vencimento do Seguro</p>
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

      <VehicleActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        vehicleId={Number(vehicle.id)}
      />
    </div>
  );
};
