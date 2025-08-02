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

const formatCurrency = (value: string): string => {
  const onlyNumbers = value.replace(/\D/g, '');
  
  const numberValue = parseInt(onlyNumbers, 10) / 100;
  
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseCurrency = (formattedValue: string): number => {
  const numberString = formattedValue
    .replace('R$', '')
    .replace('.', '')
    .replace(',', '.')
    .trim();
  
  return parseFloat(numberString) || 0;
};

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
}: FormInputProps<T>) {
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
              const formattedValue = formatCurrency(e.target.value);
              e.target.value = formattedValue;
              onChange(parseCurrency(formattedValue));
            } else {
              onChange(e.target.value);
            }
          };

          const handleBlur = () => {
            if (type === 'number' && value) {
              const formattedValue = formatCurrency(String(value));
              onChange(parseCurrency(formattedValue));
            }
            onBlur();
          };

          const displayValue = type === 'number' 
            ? value ? formatCurrency(String(value)) : ''
            : value;

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