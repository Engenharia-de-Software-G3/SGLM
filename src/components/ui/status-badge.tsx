import { Badge } from '@/components/ui/badge';

export type StatusType = 'rental' | 'maintenance' | 'vehicle' | 'client';

export interface StatusBadgeProps {
  status: string;
  type: StatusType;
}

function getRentalStatusProps(status: string) {
  switch (status) {
    case 'ativa':
      return { className: 'bg-green-100 text-green-800', text: 'Ativa' };
    case 'finalizada':
      return { className: 'bg-gray-100 text-gray-800', text: 'Finalizada' };
    case 'cancelada':
      return { className: 'bg-red-100 text-red-800', text: 'Cancelada' };
    default:
      return { className: 'bg-gray-100 text-gray-800', text: 'Indefinido' };
  }
}

function getMaintenanceStatusProps(status: string) {
  switch (status) {
    case 'em_andamento':
      return { className: 'bg-orange-100 text-orange-800', text: 'Em Andamento' };
    case 'concluida':
      return { className: 'bg-green-100 text-green-800', text: 'Concluída' };
    case 'cancelada':
      return { className: 'bg-red-100 text-red-800', text: 'Cancelada' };
    default:
      return { className: 'bg-gray-100 text-gray-800', text: 'Indefinido' };
  }
}

function getVehicleStatusProps(status: string) {
  switch (status) {
    case 'disponivel':
      return { className: 'bg-green-100 text-green-800', text: 'Disponível' };
    case 'alugado':
      return { className: 'bg-red-100 text-red-800', text: 'Locado' };
    case 'manutencao':
      return { className: 'bg-orange-100 text-orange-800', text: 'Manutenção' };
    default:
      return { className: 'bg-gray-100 text-gray-800', text: 'Indefinido' };
  }
}

function getClientStatusProps(status: string) {
  switch (status) {
    case 'ativo':
      return { className: 'bg-green-100 text-green-800', text: 'Ativo' };
    case 'inativo':
      return { className: 'bg-gray-100 text-gray-800', text: 'Inativo' };
    case 'bloqueado':
      return { className: 'bg-red-100 text-red-800', text: 'Bloqueado' };
    default:
      return { className: 'bg-gray-100 text-gray-800', text: 'Indefinido' };
  }
}

export function StatusBadge({ status, type }: Readonly<StatusBadgeProps>) {
  let statusProps;

  switch (type) {
    case 'rental':
      statusProps = getRentalStatusProps(status);
      break;
    case 'maintenance':
      statusProps = getMaintenanceStatusProps(status);
      break;
    case 'vehicle':
      statusProps = getVehicleStatusProps(status);
      break;
    case 'client':
      statusProps = getClientStatusProps(status);
      break;
    default:
      statusProps = { className: 'bg-gray-100 text-gray-800', text: 'Indefinido' };
  }

  return <Badge className={statusProps.className}>{statusProps.text}</Badge>;
}
