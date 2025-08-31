import { Header } from '../header';
import { Sidebar } from '../sidebar/';
import type { LayoutProps } from './@types';

export const Layout = ({ children, title = '', subtitle = '', showHeader = true }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && <Header title={title} subtitle={subtitle} />}
        {children}
      </div>
    </div>
  );
};
