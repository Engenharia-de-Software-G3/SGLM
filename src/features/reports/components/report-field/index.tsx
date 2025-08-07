import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ReportFieldProps } from './@types';

export const ReportField = ({ label, id, value, placeholder }: ReportFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </Label>
    <Input id={id} value={value} placeholder={placeholder} readOnly className="bg-white" />
  </div>
);
