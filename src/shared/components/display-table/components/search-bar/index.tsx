import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { SearchBarProps } from './@types';

export const SearchBar = ({ placeholder, value, onChange, className = '' }: SearchBarProps) => {
  return (
    <div className={`relative flex-1 max-w-md bg-white ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input placeholder={placeholder} value={value} onChange={onChange} className="pl-10" />
    </div>
  );
};
