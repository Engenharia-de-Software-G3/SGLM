import type { ReactNode } from 'react';

export type Column = {
  title: string;
  key: string;
};

export type PaginatedTableProps<T> = {
  data: T[];
  columns: Column[];
  renderRow: (item: T) => ReactNode;
  rowsPerPageOptions?: number[];
};
