import { Layout } from '../../../shared/components/layout';
import { useNavigate, useParams } from 'react-router-dom';
import { ReturnHeader } from '@/shared/components/return-header';
import { ClientInfoCard } from './components/client-info-card';
import { useState } from 'react';
import type { ClientInfoCardData } from './components/client-info-card/@types';
import { Toaster } from 'sonner';
import { useGetClientQuery } from '@/services/client';

export const ClientProfile = () => {
  const navigate = useNavigate();
  const client = {
    name: 'Lucas Silva',
    birthDate: '01/01/1982',
    cpf: '000.000.000-00',
    phone: '(83) 99999-9999',
    cep: '58000-000',
    street: 'Rua das Flores',
    neighborhood: 'Centro',
    number: '123',
    complement: 'Apto 45',
    email: 'lucas@email.com',
    city: 'Campina Grande',
    state: 'PB',

    bank: 'Banco do Brasil',
    agency: '1234',
    agencyDigit: '5',
    account: '987654',
    accountDigit: '1',

    cnhNumber: '12345678900',
    cnhCategory: 'B',
    cnhRegister: '123456789',
    cnhExpirationDate: '27/12/2030',
  };
  const [data, setData] = useState<ClientInfoCardData>(client);

  const { id } = useParams()

  console.log({id})

  const { data: clientData, isLoading, error } = useGetClientQuery(Number(id))

  console.log({clientData, isLoading, error})

  return (
    <Layout showHeader={false}>
      <div className="flex-1 overflow-auto">
        <ReturnHeader title="Perfil do Cliente" onBack={() => navigate('/clientes')} />
        <Toaster />
        <div className="p-6">
          <ClientInfoCard data={data} setData={setData} />
        </div>
      </div>
    </Layout>
  );
};
