import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import type { SuccessRegisterCardProps } from './@types';

export const SuccessRegisterCard = ({
  title = 'Cliente cadastrado com sucesso!',
  description = 'Seu cliente foi cadastrado e aparecerá na sua lista de clientes',
}: SuccessRegisterCardProps) => {
  return (
    <Card className="p-8 text-center max-w-md">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
};
