import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '@/shared/components/layout';
import { RentalInfoCard } from './components/rental-info-card';
import type { RentalInfoCardData } from './components/rental-info-card/@types';

// Mock data for demonstration - in a real app this would come from an API
const mockRentalData: RentalInfoCardData = {
  // Dados do Locatário
  locatario: 'João Silva Santos',
  cnpjcpf: '123.456.789-00',
  telefone: '(11) 99999-9999',
  email: 'joao.silva@email.com',

  // Dados do Veículo
  placaVeiculo: 'ABC1234',
  marca: 'Toyota',
  modelo: 'Corolla',
  ano: '2023',
  cor: 'Prata',
  chassi: '9BWZZZ377VT004251',

  // Dados da Locação
  inicio: '01/12/2024',
  fim: '15/12/2024',
  valorLocacao: '150.00',
  intervaloPagamento: 'semanal',
  observacoes: 'Veículo em excelente estado',

  // Dados de Pagamento
  formaPagamento: 'Cartão de crédito',
  statusPagamento: 'Pago',

  // Dados de Entrega/Devolução
  localEntrega: 'Rua das Flores, 123 - São Paulo/SP',
  localDevolucao: 'Rua das Flores, 123 - São Paulo/SP',
  quilometragemInicial: '50000',
  quilometragemFinal: '52000',
};

export const RentalProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rentalData, setRentalData] = useState<RentalInfoCardData>(mockRentalData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchRentalData = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setRentalData(mockRentalData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching rental data:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchRentalData();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/locacoes');
  };

  if (loading) {
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

  return (
    <Layout title={`Locação #${id}`} subtitle="Detalhes completos da locação">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para locações
          </Button>
        </div>

        <RentalInfoCard data={rentalData} setData={setRentalData} />
      </div>
    </Layout>
  );
};
