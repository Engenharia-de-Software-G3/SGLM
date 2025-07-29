import { useEffect, useRef, useState } from 'react';
import { Layout } from '../../shared/components/layout';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaginatedTable } from '@/shared/components/display-table';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { DeleteModal } from '@/shared/components/delete-modal';
import { Badge } from '@/components/ui/badge';

const initialClients = [
  {
    id: 1,
    name: 'Lorem Ipsum1',
    description: 'Desde DD/MM/AAAA',
    cpfcnpj: '00.000.000/0000-00',
    status: 'Inativo',
    statusColor: 'bg-red-100 text-red-800',
  },
  {
    id: 2,
    name: 'Lorem Ipsum2',
    description: 'Desde DD/MM/AAAA',
    cpfcnpj: '082.044.589-22',
    status: 'Ativo',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 3,
    name: 'Lorem Ipsum3',
    description: 'Desde DD/MM/AAAA',
    cpfcnpj: '00.000.000/0000-00',
    status: 'Ativo',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 4,
    name: 'Lorem Ipsum4',
    description: 'Desde DD/MM/AAAA',
    cpfcnpj: '00.000.000/0000-00',
    status: 'Ativo',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 5,
    name: 'Lorem Ipsum5',
    description: 'Desde DD/MM/AAAA',
    cpfcnpj: '082.044.589-22',
    status: 'Inativo',
    statusColor: 'bg-red-100 text-red-800',
  },
  {
    id: 6,
    name: 'Lorem Ipsum6',
    description: 'Desde DD/MM/AAAA',
    cpfcnpj: '00.000.000/0000-00',
    status: 'Inativo',
    statusColor: 'bg-red-100 text-red-800',
  },
];

export const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState(initialClients);
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewClient = (clientId: number) => {
    navigate(`/clientes/${clientId}`);
  };

  const handleDeleteClient = (clientId: number) => {
    setClients((prevClients) => prevClients.filter((c) => c.id !== clientId));
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addedRef = useRef(false);

  useEffect(() => {
    if (location.state?.newClient && !addedRef.current) {
      setClients((prev) => [...prev, location.state.newClient]);
      addedRef.current = true;
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

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
          key={searchTerm}
          data={filteredClients}
          columns={[
            { key: 'client', title: 'Cliente' },
            { key: 'cpf/cnpj', title: 'CPF/CNPJ' },
            { key: 'status', title: 'Status' },
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.cpfcnpj}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={client.statusColor}>{client.status}</Badge>
              </td>
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
                    onConfirm={() => handleDeleteClient(client.id)}
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
