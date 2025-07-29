import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url';
  placeholder?: string;
  control: Control<T>;
  name: FieldPath<T>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  label,
  id,
  type = 'text',
  placeholder,
  control,
  name,
  error,
  required = false,
  disabled = false,
  ...props
}: FormInputProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value, name: fieldName } }) => (
          <Input
            id={id}
            name={fieldName}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
