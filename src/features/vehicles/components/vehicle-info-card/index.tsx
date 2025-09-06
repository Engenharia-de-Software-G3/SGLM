import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car } from 'lucide-react';
import { StatusVehicle } from '@/services/vehicle/types';

interface VehicleInfoCardProps {
  readonly marca: string;
  readonly modelo: string;
  readonly placa: string;
  readonly ano: string;
  readonly cor: string;
  readonly status: StatusVehicle;
  readonly quilometragemAtual: string;
}

export function VehicleInfoCard({
  marca,
  modelo,
  placa,
  ano,
  cor,
  status,
  quilometragemAtual,
}: VehicleInfoCardProps) {
  const getStatusColor = (status: StatusVehicle) => {
    console.log(`status: getStatusColor`, { status });
    switch (status) {
      case 'disponivel':
        return 'bg-green-100 text-green-800';
      case 'alugado':
        return 'bg-red-100 text-red-800';
      case 'manutencao':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: StatusVehicle) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'alugado':
        return 'Locado';
      case 'manutencao':
        return 'Manutenção';
      default:
        return 'Indefinido';
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <Car className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {marca} {modelo}
            </h2>
            <p className="text-gray-600 mb-2">
              {ano} | {cor}
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {parseInt(quilometragemAtual).toLocaleString()} km rodados
              </span>
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div>
          <span className="text-sm text-gray-600">Placa:</span>
          <p className="font-medium">{placa}</p>
        </div>
      </div>
    </Card>
  );
}
