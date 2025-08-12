import { Layout } from '../../../shared/components/layout';
import { useNavigate, useParams } from 'react-router-dom';
import { ReturnHeader } from '@/shared/components/return-header';
import { ClientInfoCard } from './components/client-info-card';
import { Toaster } from 'sonner';
import { useGetClientQuery } from '@/services/client';
import { Loader2 } from 'lucide-react';

export const ClientProfile = () => {
  const navigate = useNavigate();
  
  const { id } = useParams()
  
  console.log({id})
  
  const { data: clientData, isLoading } = useGetClientQuery(Number(id))
  
  return (
    <Layout showHeader={false}>
      <div className="flex-1 overflow-auto">
        <ReturnHeader title="Perfil do Cliente" onBack={() => navigate('/clientes')} />
        <Toaster />
        <div className="p-6">
          { isLoading || !clientData ? <Loader2 className="animate-spin" /> : <ClientInfoCard data={clientData} /> }
        </div>
      </div>
    </Layout>
  );
};
