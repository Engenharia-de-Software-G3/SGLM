import { Layout } from '../../shared/components/layout';
import { DashboardChart } from './components/dashboard-chart';
import { StatsCards } from './components/stats-cards';

export const Dashboard = () => {
  const now = new Date();
  const formattedDateTime = now.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Layout title="Olá, Erick Gomes" subtitle={formattedDateTime}>
      <div className="flex-1 overflow-auto p-6">
        <StatsCards />
        <DashboardChart />
      </div>
    </Layout>
  );
};
