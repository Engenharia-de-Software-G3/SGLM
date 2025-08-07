import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ClientRecentActivitesProps } from './@types';

export const ClientRecentActivitesCard = ({
  title = 'Atividades Recentes',
  subtitle = 'Últimas atualizações de ações do cliente.',
  activities,
}: ClientRecentActivitesProps) => {
  return (
    <Card className="p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{activity.title}</h4>
              <p className="text-sm text-gray-500">{activity.date}</p>
              <p className={`text-sm font-medium ${activity.statusColor}`}>{activity.status}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
