import { useState } from 'react';
import { Layout } from '@/shared/components/layout';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DeleteModal } from '@/shared/components/delete-modal';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { PaginatedTable } from '@/shared/components/display-table';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { AddPaymentModal } from './components/add-payment-modal';

const payments = [
  { id: 1, tipo: 'Dinheiro' },
  { id: 2, tipo: 'Cartão de Débito' },
  { id: 3, tipo: 'Cartão de Crédito' },
  { id: 4, tipo: 'PIX' },
  { id: 5, tipo: 'Boleto' },
  { id: 6, tipo: 'Cheque' },
];

export const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: number) => {
    console.log('Excluir pagamento', id);
  };

  return (
    <Layout
      title="Formas de Pagamento"
      subtitle="Veja aqui todas as formas de pagamento disponíveis em sua Locadora"
    >
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por forma de pagamento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <AddPaymentModal
            onAdd={(data) => console.log('Nova forma de pagamento:', data)}
            trigger={
              <ActionButton
                label="Cadastrar forma de pagamento"
                icon={<Plus className="h-4 w-4 mr-1" />}
                className="bg-blue-600 hover:bg-blue-700"
              />
            }
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={payments}
          columns={[
            { key: 'tipo', title: 'Tipo' },
            { key: 'spacer', title: '' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(pagamento) => (
            <tr key={pagamento.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {pagamento.tipo}
              </td>

              <td className="w-300" />

              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <DeleteModal
                    title="Tem certeza que deseja excluir esta forma de pagamento?"
                    description="Todos os dados salvos serão excluídos."
                    actionText="Excluir pagamento"
                    onConfirm={() => handleDelete(pagamento.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </Layout>
  );
};
