import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { VehicleActionDialogProps } from './@types';
import { toast } from 'sonner';
import { useUpdateVehicleMutation } from '@/services/vehicle';

export const VehicleActionDialog = ({
  isOpen,
  onClose,
  vehicle,
  onFilterByVehicle,
  // onSave

}: VehicleActionDialogProps) => {
  const [isEditingKm, setIsEditingKm] = useState(false);
  const [newKm, setNewKm] = useState<string>('');

  const { mutateAsync: updateVehicle } = useUpdateVehicleMutation();

  const actions = [
    {
      label: 'Visualizar documento',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`📄 Visualizar documento do veículo ${vehicle?.id}`),
    },
    {
      label: 'Histórico de Manutenções e Serviços',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`🛠 Histórico de Manutenções do veículo ${vehicle?.id}`),
    },
    {
      label: 'Histórico de Locações',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        console.log(`📜 Histórico de Locações do veículo ${vehicle?.id}`);
        onFilterByVehicle();
      },
    },
    {
      label: 'Atualizar Quilometragem',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        console.log('✏️ Iniciando edição de quilometragem');
        setIsEditingKm(true);
      },
    },
    {
      label: 'Registro de Multas',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`🚦 Registro de Multas do veículo ${vehicle?.id}`),
    },
    {
      label: 'Gerenciamento de Acessórios',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`🔧 Gerenciamento de Acessórios do veículo ${vehicle?.id}`),
    },
    {
      label: 'Gerenciamento de Seguros',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`🛡 Gerenciamento de Seguros do veículo ${vehicle?.id}`),
    },
    {
      label: 'Periodicidade da Manutenção',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`📆 Periodicidade da Manutenção do veículo ${vehicle?.id}`),
    },
    {
      label: 'Vistorias',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`🔍 Vistorias do veículo ${vehicle?.id}`),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Ações do Veículo</DialogTitle>
        </DialogHeader>

        {isEditingKm && vehicle ? (
          <div className="space-y-4">
            <p>
              Quilometragem atual: <strong>{vehicle.quilometragem}</strong> km
            </p>
            <div>
              <label className="block mb-1">Nova Quilometragem:</label>
              <input
                type="text"
                value={newKm}
                onChange={(e) => setNewKm(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                placeholder={`Digite a nova quilometragem (maior que ${vehicle.quilometragem} km )`}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('❌ Cancelando edição de quilometragem');
                  setIsEditingKm(false);
                }}
              >
                Cancelar
              </Button>
              <Button
              onClick={() => {
                if (!vehicle) return;
                
                // Remove caracteres não numéricos e transforma em número
                const sanitizedKm = newKm.trim().replace(/\D/g, '');
                const newKmNumber = Number(sanitizedKm);
                
                if (!sanitizedKm || isNaN(newKmNumber)) {
                  toast.error('Informe uma quilometragem válida');
                  return;
                }
                
                if (newKmNumber <= Number(vehicle.quilometragem)) {
                  toast.error(`A nova quilometragem deve ser maior ou igual à atual (${vehicle.quilometragem} km)`);
                  return;
                }
                
                updateVehicle({ id: vehicle.id, payload: { quilometragemAtual: newKm } });
                // Chama a função passada do parent
                // onSave?.({
                //   quilometragemAtual: sanitizedKm,
                //   marca: vehicle.marca,
                //   modelo: vehicle.modelo,
                //   placa: vehicle.placa,
                //   ano: vehicle.ano,
                //   cor: vehicle.cor,
                //   chassi: vehicle.chassi,
                //   quilometragemCompra: vehicle.quilometragemNaCompra,
                //   dataCompra: vehicle.dataCompra,
                //   local: vehicle.local,
                //   nome: vehicle.nome,
                //   observacoes: vehicle.observacoes,
                //   status: vehicle.status,
                // });

                setIsEditingKm(false);
                setNewKm('');
              }}
            >
              Salvar
            </Button>

            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                className={`w-full text-white ${action.color}`}
                onClick={() => {
                  console.log('🖱 Clicou na ação:', action.label);
                  action.onClick();
                  if (action.label !== 'Atualizar Quilometragem') {
                    onClose();
                  }
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
