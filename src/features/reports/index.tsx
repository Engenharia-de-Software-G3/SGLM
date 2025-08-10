import { Button } from '@/components/ui/button';
import { Layout } from '../../shared/components/layout';
import { Download } from 'lucide-react';
import { ReportField } from './components/report-field';

export const Reports = () => {
  return (
    <Layout title="Gerenciamento de Relatórios" subtitle="Gere um novo relatório">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Relatório</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportField label="Faturamento" id="faturamento" value="" placeholder="R$" />
          <ReportField label="Veículos Locados" id="veiculos-locados" value="" />
          <ReportField label="Veículos Parados" id="veiculos-parados" value="" />
          <ReportField label="Total da Frota" id="total-frota" value="" />
          <ReportField
            label="Gastos com Manutenção"
            id="gastos-manutencao"
            value=""
            placeholder="R$"
          />
          <ReportField
            label="Gastos com Pagamentos"
            id="gastos-pagamentos"
            value=""
            placeholder="R$"
          />
          <ReportField label="Clientes Ativos" id="clientes-ativos" value="" />
          <ReportField label="Clientes Inativos" id="clientes-inativos" value="" />
        </div>
      </div>
    </Layout>
  );
};
