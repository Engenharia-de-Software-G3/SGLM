import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/shared/components/layout';
import { ReturnHeader } from '@/shared/components/return-header';
import { RentalInfoCard } from './components/rental-info-card';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useGetLocacaoQuery } from '@/services/rental';
import { useClientsQuery } from '@/services/client';
import { useVehiclesQuery } from '@/services/vehicle';
import type { LocacaoInterface } from '@/services/rental/types';
import type { ClientData } from '@/lib/generateContractPDF';
import type { VehicleData } from '@/services/vehicle/types';
import type { RentalInfoCardData } from './components/rental-info-card/@types';

function toProfileData(
  locacao: LocacaoInterface,
  client: ClientData | null,
  vehicle: VehicleData | null
): RentalInfoCardData {
  return {
    locatario: client?.nomeCompleto || '',
    cnpjcpf: client?.cpf || client?.cnpj || '',
    telefone: client?.telefone || '',
    email: client?.email || '',
    placaVeiculo: locacao.placaVeiculo,
    marca: vehicle?.marca || '',
    modelo: vehicle?.modelo || '',
    ano: vehicle?.ano || '',
    cor: vehicle?.cor || '',
    chassi: vehicle?.chassi || '',
    inicio: locacao.dataInicio,
    fim: locacao.dataFim,
    valorLocacao: String(locacao.valor) || '',
    intervaloPagamento: locacao.periodicidadePagamento || 'Mensal',
    observacoes: '',
    formaPagamento: ''//locacao.metodoPagamento || 'Pix',
    ,statusPagamento: '',
    localEntrega: '',
    localDevolucao: '',
    quilometragemInicial: vehicle?.quilometragem || '',
    quilometragemFinal: '',
  };
}

export const RentalProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Busca locação
  const { data: locacaoData, isLoading, isError } = useGetLocacaoQuery(id!);

  // Busca clientes e veículos
  const { data: clientsData } = useClientsQuery();
  const { data: vehiclesData } = useVehiclesQuery();

  // Localiza o cliente
  const client = useMemo<ClientData | null>(() => {
    if (!locacaoData || !clientsData) return null;
    const cleanCpf = locacaoData.clienteId;
    return (
      clientsData.clientes.find(
        (c: ClientData) => c.cpf.replace(/\D/g, '') === cleanCpf
      ) || null
    );
  }, [locacaoData, clientsData]);

  // Localiza o veículo
  const vehicle = useMemo<VehicleData | null>(() => {
    if (!locacaoData || !vehiclesData?.veiculos) return null;
    const cleanPlaca = locacaoData.placaVeiculo.toUpperCase();
    return (
      vehiclesData.veiculos.find(
        (v: VehicleData) => v.placa.toUpperCase() === cleanPlaca
      ) || null
    );
  }, [locacaoData, vehiclesData]);

  // Monta dados para o RentalInfoCard
  const rentalData = useMemo(() => {
    if (!locacaoData) return null;
    return toProfileData(locacaoData, client, vehicle);
  }, [locacaoData, client, vehicle]);

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
        <div className="text-red-600 p-6">
          Não foi possível carregar os dados da locação.
        </div>
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
