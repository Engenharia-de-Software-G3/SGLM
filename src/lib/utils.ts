import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusColorMap: Record<string, string> = {
  Disponível: 'bg-green-100 text-green-800',
  Locado: 'bg-red-100 text-red-800',
  Manutenção: 'bg-orange-100 text-orange-800',
};
