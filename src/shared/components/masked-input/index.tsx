import { IMaskInput } from 'react-imask';
import type { CSSProperties, FormEventHandler } from 'react';

interface MaskedInputProps {
  type: 'cpf' | 'cnpj' | 'phone' | 'cep' | 'date';
  id?: string;
  style?: CSSProperties;
  className?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onAccept?: (value: string) => void;
  onChange?: FormEventHandler<HTMLInputElement>;
  onBlur?: () => void;
  name?: string;
}

const maskConfig = {
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  phone: '(00) 00000-0000',
  cep: '00000-000',
  date: '00/00/0000',
};

const baseClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function MaskedInput({
  type,
  placeholder,
  className,
  onChange,
  onAccept,
  onBlur,
  id,
  name,
  value,
  disabled,
  readOnly,
  ...rest
}: MaskedInputProps) {
  return (
    <IMaskInput
      mask={maskConfig[type]}
      placeholder={placeholder || maskConfig[type]}
      className={className || baseClassName}
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onBlur={onBlur}
      onAccept={(val: string) => {
        if (onChange) {
          onChange({
            target: { value: val, name },
          } as React.ChangeEvent<HTMLInputElement>);
        }
        if (onAccept) {
          onAccept(val);
        }
      }}
      {...rest}
    />
  );
}
