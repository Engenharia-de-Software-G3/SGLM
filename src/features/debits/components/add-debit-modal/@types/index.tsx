import type { ReactNode } from 'react';

export type AddDebitModalProps = {
  trigger: ReactNode;
  onAdd: (data: { name: string; description: string; dueDate: string; value: string }) => void;
};
