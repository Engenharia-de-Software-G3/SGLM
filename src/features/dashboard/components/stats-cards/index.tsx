import { Card } from '@/components/ui/card';
import { Users, Car, TrendingUp } from 'lucide-react';

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-green-600 mb-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Clientes</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">10.983</p>
          </div>
          <div className="text-green-500">
            <TrendingUp className="h-12 w-12 opacity-20" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <Car className="h-5 w-5" />
              <span className="text-sm font-medium">Veículos Locados</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">10.983</p>
          </div>
          <div className="text-blue-500">
            <TrendingUp className="h-12 w-12 opacity-20" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-orange-50 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-orange-600 mb-2">
              <Car className="h-5 w-5" />
              <span className="text-sm font-medium">Veículos Disponíveis</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">10.983</p>
          </div>
          <div className="text-orange-500">
            <TrendingUp className="h-12 w-12 opacity-20" />
          </div>
        </div>
      </Card>
    </div>
  );
};
