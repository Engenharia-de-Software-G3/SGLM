import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { VehicleActionDialogProps } from './@types';

export const VehicleActionDialog = ({
  isOpen,
  onClose,
  vehicleId,
  onFilterByVehicle,
}: VehicleActionDialogProps) => {
  const actions = [
    {
      label: 'Visualizar documento',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`Ação: Visualizar documento para veículo ${vehicleId}`),
    },
    {
      label: 'Histórico de Manutenções e Serviços',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () =>
        console.log(`Ação: Histórico de Manutenções e Serviços para veículo ${vehicleId}`),
    },
    {
      label: 'Histórico de Locações',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        console.log('🚀 Clicking Histórico de Locações for vehicleId:', vehicleId);
        onFilterByVehicle();
      },
    },
    {
      label: 'Atualizar Quilometragem',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`Ação: Atualizar Quilometragem para veículo ${vehicleId}`),
    },
    {
      label: 'Registro de Multas',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`Ação: Registro de Multas para veículo ${vehicleId}`),
    },
    {
      label: 'Gerenciamento de Acessórios',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`Ação: Gerenciamento de Acessórios para veículo ${vehicleId}`),
    },
    {
      label: 'Gerenciamento de Seguros',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`Ação: Gerenciamento de Seguros para veículo ${vehicleId}`),
    },
    {
      label: 'Periodicidade da Manutenção',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`Ação: Periodicidade da Manutenção para veículo ${vehicleId}`),
    },
    {
      label: 'Vistorias',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => console.log(`Ação: Vistorias para veículo ${vehicleId}`),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Ações do Veículo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              className={`w-full text-white ${action.color}`}
              onClick={() => {
                action.onClick();
                onClose();
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
