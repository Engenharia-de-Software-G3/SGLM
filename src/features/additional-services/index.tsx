import { useState } from 'react';
import { Layout } from '@/shared/components/layout';
import { Button } from '@/components/ui/button';
import { DeleteModal } from '@/shared/components/delete-modal';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { PaginatedTable } from '@/shared/components/display-table';
import { Plus, Edit } from 'lucide-react';
import { AddServiceModal } from './components/additional-services-modal';

const mockData = [
  { id: 1, nome: 'Entrega', descricao: 'Lorem ipsum', data: '10/07/2025', valor: 'R$ 150,00' },
  { id: 2, nome: 'Reboque', descricao: 'Descrição X', data: '09/07/2025', valor: 'R$ 250,00' },
  { id: 3, nome: 'Transporte', descricao: 'Descrição Y', data: '08/07/2025', valor: 'R$ 100,00' },
];

export const AdditionalServices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    descricao: '',
  });

  const handleDelete = (id: number) => {
    console.log('Excluindo serviço:', id);
  };

  const handleFormChange = (changes: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  const handleFormSubmit = () => {
    console.log('Serviço adicional cadastrado:', formData);
    setFormData({ nome: '', valor: '', descricao: '' });
    setFormModalOpen(false);
  };

  return (
    <Layout title="Serviços Adicionais" subtitle="Veja todos seus serviços adicionais">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ActionButton
            label="Cadastrar Serviço"
            icon={<Plus className="h-4 w-4 mr-1" />}
            onClick={() => setFormModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={mockData}
          columns={[
            { key: 'nome', title: 'Nome' },
            { key: 'descricao', title: 'Descrição' },
            { key: 'data', title: 'Data' },
            { key: 'valor', title: 'Valor' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(service) => (
            <tr key={service.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {service.descricao}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.data}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.valor}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <DeleteModal
                    title="Tem certeza que deseja excluir este serviço?"
                    description="Todos os dados salvos serão excluídos."
                    actionText="Excluir serviço"
                    onConfirm={() => handleDelete(service.id)}
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

      <AddServiceModal
        open={isFormModalOpen}
        onOpenChange={setFormModalOpen}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
      />
    </Layout>
  );
};
