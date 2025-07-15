import { useState } from 'react';
import { Layout } from '../../shared/components/layout';
import { Button } from '@/components/ui/button';
import { DeleteModal } from '@/shared/components/delete-modal';
import { FileText, Edit, Plus } from 'lucide-react';
import { PaginatedTable } from '@/shared/components/display-table';
import { DisplayTableHeader } from '@/shared/components/display-table/components/display-table-header';
import { SearchBar } from '@/shared/components/display-table/components/search-bar';
import { ActionButton } from '@/shared/components/display-table/components/action-button';
import { RentalTypeModal } from './components/rental-type-modal';
import { AddRentalModal } from './components/add-rental-modal';

const rentals = [
  {
    id: 1,
    locatario: 'Lorem Ipsum',
    placa: 'ABC-1234',
    cpf: '082.044.589-22',
  },
  {
    id: 2,
    locatario: 'Lorem Ipsum',
    placa: 'XYZ-9876',
    cpf: '082.044.589-22',
  },
  {
    id: 3,
    locatario: 'Lorem Ipsum',
    placa: 'DEF-5678',
    cpf: '082.044.589-22',
  },
  {
    id: 4,
    locatario: 'Lorem Ipsum',
    placa: 'GHI-2468',
    cpf: '082.044.589-22',
  },
];

export const Rental = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isTypeModalOpen, setTypeModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [clientType, setClientType] = useState<'fisica' | 'juridica'>('fisica');

  const [formData, setFormData] = useState({
    cpfCnpj: '',
    placa: '',
    dataInicio: '',
    dataFim: '',
    placaVeiculo: '',
    valorLocacao: '',
  });

  const handleDeleteRental = (id: number) => {
    console.log('Excluindo locação:', id);
  };

  const handleOpenForm = () => {
    setTypeModalOpen(true);
  };

  const handleTypeSelect = (type: 'fisica' | 'juridica') => {
    setClientType(type);
    setTypeModalOpen(false);
    setFormModalOpen(true);
  };

  const handleFormChange = (changes: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...changes }));
  };

  const handleFormSubmit = () => {
    console.log('Locação cadastrada:', formData, 'Tipo:', clientType);
    setFormData({
      cpfCnpj: '',
      placa: '',
      dataInicio: '',
      dataFim: '',
      placaVeiculo: '',
      valorLocacao: '',
    });
    setFormModalOpen(false);
  };

  return (
    <Layout title="Gerenciamento de locações" subtitle="Veja todas as locações">
      <div className="flex-1 overflow-auto p-6">
        <DisplayTableHeader>
          <SearchBar
            placeholder="Filtrar por locatário"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <ActionButton
            label="Cadastrar locação"
            icon={<Plus className="h-4 w-4 mr-1" />}
            onClick={handleOpenForm}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </DisplayTableHeader>

        <PaginatedTable
          data={rentals}
          columns={[
            { key: 'client', title: 'Locatário' },
            { key: 'placa', title: 'Placa' },
            { key: 'cpf', title: 'CPF' },
            { key: 'actions', title: 'Ações' },
          ]}
          renderRow={(rental) => (
            <tr key={rental.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">
                      {rental.locatario
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{rental.locatario}</div>
                    <div className="text-sm text-gray-500">{rental.locatario}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rental.placa}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rental.cpf}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>

                  <DeleteModal
                    title="Tem certeza que deseja excluir essa locação?"
                    description="Todos os dados salvos serão excluídos."
                    actionText="Excluir locação"
                    onConfirm={() => handleDeleteRental(rental.id)}
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

      <RentalTypeModal
        open={isTypeModalOpen}
        onOpenChange={setTypeModalOpen}
        clientType={clientType}
        onSelect={handleTypeSelect}
      />

      <AddRentalModal
        open={isFormModalOpen}
        onOpenChange={setFormModalOpen}
        clientType={clientType}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
      />
    </Layout>
  );
};
