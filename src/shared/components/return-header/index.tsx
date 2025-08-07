import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PageHeaderProps } from './@types';

export const ReturnHeader = ({ title, onBack }: PageHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
      </div>
    </div>
  );
};
