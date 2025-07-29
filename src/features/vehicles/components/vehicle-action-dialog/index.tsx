import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { VehicleActionDialogProps } from './@types';

export const VehicleActionDialog = ({ isOpen, onClose, vehicleId }: VehicleActionDialogProps) => {
  const actions = [
    { label: 'Visualizar documento', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Histórico de Manutenções e Serviços', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Histórico de Locações', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Atualizar Quilometragem', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Registro de Multas', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Gerenciamento de Acessórios', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Gerenciamento de Seguros', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Periodicidade da Manutenção', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Vistorias', color: 'bg-blue-600 hover:bg-blue-700' },
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
                console.log(`Ação: ${action.label} para veículo ${vehicleId}`);
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
