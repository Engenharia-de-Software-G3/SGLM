import type { DisplayTableHeaderProps } from './@types';

export const DisplayTableHeader = ({ children }: DisplayTableHeaderProps) => {
  return <div className="flex items-center justify-between mb-6">{children}</div>;
};
