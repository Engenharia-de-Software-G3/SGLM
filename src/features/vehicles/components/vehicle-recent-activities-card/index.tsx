import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { VehicleActivity } from '@/services/vehicle/types';

interface VehicleRecentActivitiesCardProps {
  activities: VehicleActivity[];
  isLoading: boolean;
}

export const VehicleRecentActivitiesCard = ({
  activities,
  isLoading,
}: VehicleRecentActivitiesCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
          <p className="text-sm text-gray-600">Carregando atividades...</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma atividade encontrada</p>
              <p className="text-sm mt-1">Este veículo ainda não possui atividades registradas.</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  <p className={`text-xs font-medium mt-1 ${activity.statusColor}`}>
                    {activity.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
