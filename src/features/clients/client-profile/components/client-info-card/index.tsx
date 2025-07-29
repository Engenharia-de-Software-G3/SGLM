import { Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ClientInfoCardProps } from './@types';

export const ClientInfoCard = ({
  name,
  age,
  city,
  status,
  reputation,
  email,
  phone,
  rentalsCount,
  description,
  onEditPhoto,
}: ClientInfoCardProps) => {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center relative">
            {onEditPhoto && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditPhoto}
                className="absolute bottom-0 right-0 p-1 h-6 w-6"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>
            <p className="text-gray-600 mb-2">
              {age} anos | {city}
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{status}</span>
            </div>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800">{reputation}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div>
          <span className="text-sm text-gray-600">Email:</span>
          <p className="font-medium">{email}</p>
        </div>
        <div>
          <span className="text-sm text-gray-600">Telefone:</span>
          <p className="font-medium">{phone}</p>
        </div>
        <div>
          <span className="text-sm text-gray-600">Número de locações:</span>
          <p className="font-medium">{rentalsCount} vezes</p>
        </div>
      </div>
    </Card>
  );
};
