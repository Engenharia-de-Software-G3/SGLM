import { Button } from '@/components/ui/button';
import type { ActionButtonProps } from './@types';

export const ActionButton = ({ label, icon, onClick, className = '' }: ActionButtonProps) => {
  return (
    <Button className={className} onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
};
