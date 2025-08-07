type StatusColor = 'text-green-600' | 'text-red-600' | 'text-yellow-600';

export interface Activity {
  id: number;
  title: string;
  date: string;
  status: string;
  statusColor: StatusColor;
}

export interface ClientRecentActivitesProps {
  title?: string;
  subtitle?: string;
  activities: Activity[];
}
