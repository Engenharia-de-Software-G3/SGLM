import {
  BarChart3,
  Users,
  Car,
  Building2,
  Wrench,
  Settings,
  CreditCard,
  Calculator,
  MapPin,
  FileText,
} from 'lucide-react';

export const menuItems = [
  { name: 'Visão Geral', icon: BarChart3, path: '/dashboard' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Veículos', icon: Car, path: '/veiculos' },
  { name: 'Fornecedores', icon: Building2, path: '/fornecedores' },
  { name: 'Manutenções', icon: Wrench, path: '/manutencoes' },
  { name: 'Serviços Adicionais', icon: Settings, path: '/servicos' },
  { name: 'Pagamento', icon: CreditCard, path: '/pagamento' },
  { name: 'Contas', icon: Calculator, path: '/contas' },
  { name: 'Locações', icon: MapPin, path: '/locacoes' },
  { name: 'Relatórios', icon: FileText, path: '/relatorios' },
];
