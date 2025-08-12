import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '@/shared/components/layout';
import { RentalInfoCard } from './components/rental-info-card';
import type { RentalInfoCardData } from './components/rental-info-card/@types';
import { useGetLocacaoQuery } from '@/services/rental';
import { toast } from 'sonner';
import { useClientsQuery } from '@/services/client';

function toProfileData(
  locacao: any,
): RentalInfoCardData {
  return {
    locatario: locacao.nomeLocatario,
    cnpjcpf: locacao.clienteId,
    telefone: '',
    email: '',
    placaVeiculo: locacao.placaVeiculo,
    marca: '',
    modelo: '',
    ano: '',
    cor: '',
    chassi: '',
    inicio: locacao.dataInicio,
    fim: locacao.dataFim,
    valorLocacao: String(locacao.valor ?? ''),
    intervaloPagamento: '',
    observacoes: '',
    formaPagamento: '',
    statusPagamento: '',
    localEntrega: '',
    localDevolucao: '',
    quilometragemInicial: '',
    quilometragemFinal: '',
  };
}

export const RentalProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: locacaoData, isLoading } = useGetLocacaoQuery(id!);
  const { data: clientsData } = useClientsQuery();

  const cpfToClientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (clientsData?.clientes) {
      for (const c of clientsData.clientes) {
        map.set(c.cpf, c.nomeCompleto);
      }
    }
    return map;
  }, [clientsData]);

  const rentalData = useMemo(() => {
    if (!locacaoData) return undefined;
    return toProfileData(locacaoData);
  }, [locacaoData]);

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
