export interface ClientInfoCardProps {
  name: string;
  age: number;
  city: string;
  status: string;
  reputation: string;
  email: string;
  phone: string;
  rentalsCount: number;
  description?: string;
  onEditPhoto?: () => void;
}
