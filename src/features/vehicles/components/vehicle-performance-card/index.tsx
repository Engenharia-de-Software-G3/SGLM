import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Loader2 } from 'lucide-react';

interface VehicleActivity {
  id: number;
  title: string;
  date: string;
  status: string;
  statusColor: string;
}

interface VehicleRecentActivitiesCardProps {
  activities: VehicleActivity[];
  isLoading?: boolean;
  onFilterByVehicle?: () => void;
  className?: string;
}

export const VehicleRecentActivitiesCard = ({
  activities = [],
  isLoading = false,
  onFilterByVehicle,
  className = '',
}: VehicleRecentActivitiesCardProps) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
          {onFilterByVehicle && (
            <button onClick={onFilterByVehicle} className="text-sm text-primary hover:underline">
              Filtrar por veículo
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Últimas movimentações do veículo</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg transition-colors hover:bg-muted"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                  <p className={`text-xs ${activity.statusColor} mt-1`}>{activity.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhuma atividade registrada</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
