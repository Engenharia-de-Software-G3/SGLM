import { useState } from 'react';
import { Layout } from '../../shared/components/layout';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaginatedTable } from '@/shared/components/display-table';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { DeleteModal } from '@/shared/components/delete-modal';

const clients = [
  {
    id: 1,
    name: 'Lorem Ipsum',
    description: 'Desde DD/MM/AAAA',
    cnpj: '00.000.000/0000-00',
    cpf: '082.044.589-22',
  },
  {
    id: 2,
    name: 'Lorem Ipsum',
    description: 'Desde DD/MM/AAAA',
    cnpj: '00.000.000/0000-00',
    cpf: '082.044.589-22',
  },
  {
    id: 3,
    name: 'Lorem Ipsum',
    description: 'Desde DD/MM/AAAA',
    cnpj: '00.000.000/0000-00',
    cpf: '082.044.589-22',
  },
  {
    id: 4,
    name: 'Lorem Ipsum',
    description: 'Desde DD/MM/AAAA',
    cnpj: '00.000.000/0000-00',
    cpf: '082.044.589-22',
  },
  {
    id: 5,
    name: 'Lorem Ipsum',
    description: 'Desde DD/MM/AAAA',
    cnpj: '00.000.000/0000-00',
    cpf: '082.044.589-22',
  },
  {
    id: 6,
    name: 'Lorem Ipsum',
    description: 'Desde DD/MM/AAAA',
    cnpj: '00.000.000/0000-00',
    cpf: '082.044.589-22',
  },
];

export const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleViewClient = (clientId: number) => {
    navigate(`/clientes/${clientId}`);
  };

  const handleDeleteClient = (clientId: number) => {
    console.log('Excluindo cliente:', clientId);
    // Aqui seria implementada a lógica de exclusão
  };

  return (
    <Layout title="Gerenciamento de clientes" subtitle="Veja a lista de todos os seus clientes">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por cliente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <ActionButton
            label="Cadastrar cliente"
            icon={<Plus className="h-4 w-4 mr-1" />}
            onClick={() => navigate('/clientes/cadastro')}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={clients}
          columns={[
            { key: 'client', title: 'Cliente' },
            { key: 'cnpj', title: 'CNPJ' },
            { key: 'cpf', title: 'CPF' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">
                      {client.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.cnpj}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.cpf}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewClient(client.id)}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>

                  <DeleteModal
                    title="Tem certeza que você deseja excluir esse cliente?"
                    description="Todos os dados salvos serão excluídos."
                    actionText="Excluir cliente"
                    onConfirm={() => handleDeleteClient}
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
