import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '@/shared/components/layout';
import { RentalInfoCard } from './components/rental-info-card';
import type { RentalInfoCardData } from './components/rental-info-card/@types';
import { useGetLocacaoQuery } from '@/services/rental';
import { toast } from 'sonner';
import { useClientsQuery } from '@/services/client';
import { LocacaoData, ClientData, VehicleData } from '@/lib/generateContractPDF';
import { useVehiclesQuery } from '@/services/vehicle/functions';

function toProfileData(
  locacao: LocacaoData,
  client: ClientData | null,
  vehicle: VehicleData | null
): RentalInfoCardData {
  return {
    locatario: client?.nomeCompleto || locacao.nomeLocatario || '',
    cnpjcpf: client?.cpf || client?.cnpj || '', // Added fallback to empty string
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
    formaPagamento: '',
    statusPagamento: '',
    localEntrega: '',
    localDevolucao: '',
    quilometragemInicial: vehicle?.quilometragem || '',
    quilometragemFinal: '',
  };
}

export const RentalProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: locacaoData, isLoading } = useGetLocacaoQuery(id!);
  const { data: clientsData } = useClientsQuery();
  const { data: vehiclesData } = useVehiclesQuery();


  const client = useMemo(() => {
    if (!locacaoData || !clientsData) return null;
    const cleanCpf = locacaoData.clienteId.replace(/\D/g, '');
    return clientsData.clientes.find((c: ClientData) => c.cpf.replace(/\D/g, '') === cleanCpf);
  }, [locacaoData, clientsData]);

  const vehicle = useMemo(() => {
    if (!locacaoData || !vehiclesData?.vehicles) return null;
    const cleanPlaca = locacaoData.placaVeiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    return vehiclesData.vehicles.find((v: VehicleData) => v.placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === cleanPlaca);
  }, [locacaoData, vehiclesData]);

  const rentalData = useMemo(() => {
    if (!locacaoData || !client || !vehicle) return null;
    return toProfileData(locacaoData, client, vehicle);
  }, [locacaoData, client, vehicle]);

  const handleBack = () => {
    navigate('/locacoes');
  };

  if (isLoading) {
    return (
      <Layout title="Carregando..." subtitle="Aguarde enquanto carregamos os dados">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando dados da locação...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!rentalData) {
    toast('Erro ao carregar dados da locação');
    return (
      <Layout title={`Locação #${id}`} subtitle="Detalhes completos da locação">
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para locações
            </Button>
          </div>
          <div className="text-red-600">Não foi possível carregar os dados da locação.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Locação #${id}`} subtitle="Detalhes completos da locação">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para locações
          </Button>
        </div>

        <RentalInfoCard data={rentalData} setData={() => {}} />
      </div>
    </Layout>
  );
};


