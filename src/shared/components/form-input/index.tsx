import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import type { ReactNode, ChangeEvent } from 'react';

interface FieldProps {
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  [key: string]: unknown;
}

interface FormInputProps<T extends FieldValues> {
  label?: string;
  id: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url';
  placeholder?: string;
  control: Control<T>;
  name: FieldPath<T>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode | ((props: FieldProps) => ReactNode);
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
  className = '',
  children,
  ...props
}: Readonly<FormInputProps<T>>) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value, name: fieldName } }) => {
          const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (type === 'number') {
              console.log('handleChange - valor original:', e.target.value);
              // Remove tudo exceto números
              const onlyNumbers = e.target.value.replace(/\D/g, '');
              if (onlyNumbers) {
                const numberValue = parseInt(onlyNumbers, 10) / 100;
                console.log('handleChange - valor convertido:', numberValue);
                onChange(numberValue);
              } else {
                onChange(0);
              }
            } else {
              onChange(e.target.value);
            }
          };

          const handleBlur = () => {
            if (type === 'number' && value) {
              console.log('handleBlur - valor atual:', value);
              // Preserva zeros à direita
              const preservedValue = Number(value.toFixed(2));
              console.log('handleBlur - valor preservado:', preservedValue);
              onChange(preservedValue);
            }
            onBlur();
          };

          let displayValue = value;
          if (type === 'number') {
            if (value) {
              displayValue = value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            } else {
              displayValue = '';
            }
          }

          const fieldProps: FieldProps = {
            id,
            name: fieldName,
            type: type === 'number' ? 'text' : type,
            placeholder,
            disabled,
            className: `h-10 ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`,
            value: displayValue,
            onChange: handleChange,
            onBlur: handleBlur,
            ...props,
          };

          if (children) {
            return (
              <div className={error ? 'border-red-500' : ''}>
                {typeof children === 'function'
                  ? (children as (props: FieldProps) => ReactNode)(fieldProps)
                  : children}
              </div>
            );
          }

          return <Input {...fieldProps} />;
        }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
