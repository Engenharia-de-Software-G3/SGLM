import { useState } from 'react';
import { Layout } from '@/shared/components/layout';
import { Plus, Edit, User } from 'lucide-react';
import { PaginatedTable } from '@/shared/components/display-table';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { DeleteModal } from '@/shared/components/delete-modal';
import { AddSupplierModal } from './components/add-supplier-modal';
import { Button } from '@/components/ui/button';

const mockSuppliers = [
  {
    id: 1,
    nome: 'João Silva',
    categoria: 'Peças',
    cpfCnpj: '082.044.589-22',
    tipo: 'fisica',
  },
  {
    id: 2,
    nome: 'MotoX LTDA',
    categoria: 'Serviços',
    cpfCnpj: '00.000.000/0000-00',
    tipo: 'juridica',
  },
  {
    id: 3,
    nome: 'Oficina ABC',
    categoria: 'Manutenção',
    cpfCnpj: '11.111.111/0001-11',
    tipo: 'juridica',
  },
];

export const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cep: '',
    bairro: '',
    cidade: '',
    estado: '',
    tipo: 'fisica' as 'fisica' | 'juridica',
  });

  const handleChange = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = () => {
    console.log('Fornecedor cadastrado:', formData);
    setSuppliers((prev) => [...prev, { id: prev.length + 1, ...formData }]);
    setIsModalOpen(false);
    setFormData({
      nome: '',
      categoria: '',
      cpfCnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      cep: '',
      bairro: '',
      cidade: '',
      estado: '',
      tipo: 'fisica',
    });
  };

  const handleDelete = (id: number) => {
    console.log('Excluindo fornecedor', id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Layout title="Gerenciamento de Fornecedores" subtitle="Veja sua lista de fornecedores">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por fornecedor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <ActionButton
            label="Cadastrar fornecedor"
            icon={<Plus className="h-4 w-4 mr-1" />}
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={suppliers}
          columns={[
            { key: 'fornecedor', title: 'Fornecedor' },
            { key: 'cpfCnpj', title: 'CPF/CNPJ' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(fornecedor) => (
            <tr key={fornecedor.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{fornecedor.nome}</div>
                    <div className="text-sm text-gray-500">{fornecedor.categoria}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{fornecedor.cpfCnpj}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <DeleteModal
                    title="Tem certeza que deseja excluir este fornecedor?"
                    description="Todos os dados salvos serão excluídos."
                    actionText="Excluir fornecedor"
                    onConfirm={() => handleDelete(fornecedor.id)}
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

      <AddSupplierModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
};
