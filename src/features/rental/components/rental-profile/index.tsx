import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/shared/components/layout';
import { ReturnHeader } from '@/shared/components/return-header';
import { RentalInfoCard } from './components/rental-info-card';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLocacoesQuery } from '@/services/rental';
import { useClientsQuery } from '@/services/client';
import { useVehiclesQuery } from '@/services/vehicle';
import type { LocacaoInterface } from '@/services/rental/types';
import type { ClientData } from '@/lib/generateContractPDF';
import type { VehicleData } from '@/services/vehicle/types';
import type { RentalInfoCardData } from './components/rental-info-card/@types';

function toProfileData(
  locacao: LocacaoInterface,
  client: ClientData | null,
  vehicle: VehicleData | null,
): RentalInfoCardData {
  return {
    id: locacao.id || 'N/A', // Adicionado para contractData
    locatario: client?.nomeCompleto || '',
    cnpjcpf: client?.cpf || client?.cnpj || '',
    telefone: client?.telefone || '',
    email: client?.email || '',
    placaVeiculo: locacao.placaVeiculo || '',
    marca: vehicle?.marca || '',
    modelo: vehicle?.modelo || '',
    ano: vehicle?.ano || '',
    cor: vehicle?.cor || '',
    chassi: vehicle?.chassi || '',
    inicio: locacao.dataInicio || '',
    fim: locacao.dataFim || '',
    valorLocacao: String(locacao.valor) || '',
    intervaloPagamento: locacao.periocidadePagamento || 'Mensal',
    formaPagamento: locacao.metodoPagamento || 'Pix',
    statusPagamento: '',
    localEntrega: '',
    localDevolucao: '',
    quilometragemInicial: vehicle?.quilometragemNaCompra || '',
    quilometragemFinal: vehicle?.quilometragem || '',
  };
}

export const RentalProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Busca todas as locações
  const { data: locacoesData, isLoading, isError } = useLocacoesQuery();
  console.log('Locacoes carregadas:', locacoesData);

  // Localiza a locação pelo ID
  const locacao = useMemo(() => {
    if (!locacoesData?.locacoes || !id) return null;
    const found = locacoesData.locacoes.find((l: { id: string }) => l.id === id) || null;
    console.log('Locação encontrada:', found);
    return found;
  }, [locacoesData, id]);

  // Busca clientes e veículos
  const { data: clientsData } = useClientsQuery();
  console.log('Clientes carregados:', clientsData);

  const { data: vehiclesData } = useVehiclesQuery();
  console.log('Veículos carregados:', vehiclesData);

  // Localiza o cliente
  const client = useMemo<ClientData | null>(() => {
    if (!locacao || !clientsData?.clientes) return null;
    const foundClient =
      clientsData.clientes.find(
        (c: { cpf?: string }) =>
          c.cpf?.replace(/\D/g, '') === locacao.clienteId?.replace(/\D/g, ''),
      ) || null;
    console.log('Cliente encontrado:', foundClient);
    return foundClient;
  }, [locacao, clientsData]);

  // Localiza o veículo
  const vehicle = useMemo<VehicleData | null>(() => {
    if (!locacao || !vehiclesData?.veiculos) return null;
    const placa = locacao.placaVeiculo?.toUpperCase() || '';
    const foundVehicle =
      vehiclesData.veiculos.find((v: { placa?: string }) => v.placa?.toUpperCase() === placa) ||
      null;
    console.log('Veículo encontrado:', foundVehicle);
    return foundVehicle;
  }, [locacao, vehiclesData]);

  // Monta dados para o RentalInfoCard
  const rentalData = useMemo<RentalInfoCardData | null>(() => {
    if (!locacao) return null;
    const data = toProfileData(locacao, client, vehicle);
    console.log('Dados do RentalInfoCard:', data);
    return data;
  }, [locacao, client, vehicle]);

  if (isLoading) {
    return (
      <Layout showHeader={false}>
        <ReturnHeader title="Detalhes da Locação" onBack={() => navigate('/locacoes')} />
        <Toaster />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-gray-500" />
        </div>
      </Layout>
    );
  }

  if (isError || !rentalData) {
    toast('Locação não encontrada ou erro na requisição');
    return (
      <Layout showHeader={false}>
        <ReturnHeader title="Detalhes da Locação" onBack={() => navigate('/locacoes')} />
        <Toaster />
        <div className="text-red-600 p-6">Não foi possível carregar os dados da locação.</div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      <ReturnHeader title={`Locação #${id}`} onBack={() => navigate('/locacoes')} />
      <Toaster />
      <div className="p-6">
        <RentalInfoCard data={rentalData} setData={() => {}} />
      </div>
    </Layout>
  );
};
