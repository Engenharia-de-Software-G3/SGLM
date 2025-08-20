import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

interface VehicleActivity {
  id: number;
  title: string;
  date: string;
  status: string;
  statusColor: string;
}

interface VehicleRecentActivitiesCardProps {
  activities: VehicleActivity[];
  onFilterByVehicle: () => void;
}

export const VehicleRecentActivitiesCard = ({
  activities,
  onFilterByVehicle,
}: VehicleRecentActivitiesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
        <p className="text-sm text-gray-600">Últimas movimentações do veículo</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.date}</p>
                <p className={`text-xs ${activity.statusColor} mt-1`}>{activity.status}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button onClick={onFilterByVehicle} className="bg-blue-600 hover:bg-blue-700 w-full">
            Ver histórico de locações do veículo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
