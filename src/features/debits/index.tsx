import { useState } from 'react';
import { Layout } from '../../shared/components/layout';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, ExternalLink } from 'lucide-react';
import { PaginatedTable } from '@/shared/components/display-table';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { DeleteModal } from '@/shared/components/delete-modal';
import { Button } from '@/components/ui/button';
import { AddDebitModal } from './components/add-debit-modal';
import { ActionButton } from '@/shared/components/display-table/components/action-button';

const debits = [
  {
    id: 1,
    name: 'Troca de Óleo',
    description: 'Fornecedor X',
    dueDate: '30/06/2025',
    value: 'R$ 150,00',
    status: 'Pago',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 2,
    name: 'Manutenção dos Freios',
    description: 'Fornecedor X',
    dueDate: '28/06/2025',
    value: 'R$ 250,00',
    status: 'Perto de vencer',
    statusColor: 'bg-red-100 text-red-800',
  },
  {
    id: 3,
    name: 'Revisão Geral',
    description: 'Fornecedor Y',
    dueDate: '01/07/2025',
    value: 'R$ 400,00',
    status: 'Pendente',
    statusColor: 'bg-orange-100 text-orange-800',
  },
];

export const Debits = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleView = (debitId: number) => {
    console.log('Visualizar débito', debitId);
  };

  const handleDelete = (debitId: number) => {
    console.log('Excluir débito', debitId);
  };

  return (
    <Layout title="Contas a Pagar" subtitle="Veja a lista de contas registradas">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por conta"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <AddDebitModal
            onAdd={(data) => console.log('Nova conta adicionada:', data)}
            trigger={
              <ActionButton
                label="Adicionar conta"
                icon={<Plus className="h-4 w-4 mr-1" />}
                className="bg-blue-600 hover:bg-blue-700"
              />
            }
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={debits}
          columns={[
            { key: 'debit', title: 'Conta' },
            { key: 'dueDate', title: 'Vencimento' },
            { key: 'value', title: 'Valor' },
            { key: 'status', title: 'Status' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(debit) => (
            <tr key={debit.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{debit.name}</div>
                  <div className="text-sm text-gray-500">{debit.description}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{debit.dueDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{debit.value}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={debit.statusColor}>{debit.status}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(debit.id)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  <DeleteModal
                    title="Tem certeza que deseja excluir essa conta?"
                    description="Todos os dados salvos serão excluídos."
                    actionText="Excluir conta"
                    onConfirm={() => handleDelete(debit.id)}
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
