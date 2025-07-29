import { Label } from '@/components/ui/label';
import { MaskedInput } from '@/shared/components/masked-input';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface MaskedFormInputProps<T extends FieldValues> {
  label: string;
  id: string;
  type: 'cpf' | 'cnpj' | 'phone' | 'cep' | 'date';
  placeholder?: string;
  control: Control<T>;
  name: FieldPath<T>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MaskedFormInput<T extends FieldValues>({
  label,
  id,
  type,
  placeholder,
  control,
  name,
  error,
  required = false,
  disabled = false,
  ...props
}: MaskedFormInputProps<T>) {
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
          <MaskedInput
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
      {error && <span className="ml-4 text-sm text-red-500">{error}</span>}
    </div>
  );
}
