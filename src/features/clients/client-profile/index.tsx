import { Layout } from '../../../shared/components/layout';
import { useNavigate } from 'react-router-dom';
import { PerformanceChart } from './components/performance-chart';
import { ReturnHeader } from '@/shared/components/return-header';
import { ClientInfoCard } from './components/client-info-card';
import { ClientRecentActivitesCard } from '../client-recent-activities-card';
import type { Activity } from '../client-recent-activities-card/@types';

const activities: Activity[] = [
  {
    id: 1,
    title: 'Entrega de veículo',
    date: '11.07.2024, 16:30 PM',
    status: 'No prazo e sem problemas',
    statusColor: 'text-green-600',
  },
  {
    id: 2,
    title: 'Entrega de Veículo',
    date: '11.05.2024, 16:30 PM',
    status: 'Atrasado e com problema',
    statusColor: 'text-red-600',
  },
  {
    id: 3,
    title: 'Entrega de Veículo',
    date: '11.04.2024, 16:30 PM',
    status: 'Atrasado',
    statusColor: 'text-yellow-600',
  },
];

export const ClientProfile = () => {
  const navigate = useNavigate();

  return (
    <Layout showHeader={false}>
      <div className="flex-1 overflow-auto">
        <ReturnHeader title="Perfil do Cliente" onBack={() => navigate('/clientes')} />

        <div className="p-6">
          <ClientInfoCard
            name="Lucas Silva"
            age={41}
            city="Campina Grande"
            status="Locação ativa e em dia"
            reputation="Reputação boa"
            email="lucas@email.com"
            phone="(83) 99999 - 9999"
            rentalsCount={13}
            description="(Descrição pessoal sobre o cliente)"
            onEditPhoto={() => console.log('Editar foto')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientRecentActivitesCard activities={activities} />
            <PerformanceChart />
          </div>
        </div>
      </div>
    </Layout>
  );
};
