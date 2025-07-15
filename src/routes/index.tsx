import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from '@/features/login/login-page';
import { Dashboard } from '@/features/dashboard';
import { Clients } from '@/features/clients';
import { ClientProfile } from '@/features/clients/client-profile';
import { ClientRegister } from '@/features/clients/client-register';
import { Debits } from '@/features/debits';
import { Maintenance } from '@/features/maintenance';
import { Payments } from '@/features/payments';
import { Reports } from '@/features/reports';
import { Rental } from '@/features/rental';
import { AdditionalServices } from '@/features/additional-services';
import { Suppliers } from '@/features/suppliers';
import { Vehicles } from '@/features/vehicles';

const routes = [
  {
    path: '/',
    element: <LoginPage />,
    protected: false,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    protected: true,
  },
  {
    path: '/clientes',
    element: <Clients />,
    protected: true,
  },
  {
    path: '/clientes/:Id',
    element: <ClientProfile />,
    protected: true,
  },
  {
    path: '/clientes/cadastro',
    element: <ClientRegister />,
    protected: true,
  },
  {
    path: '/veiculos',
    element: <Vehicles />,
    protected: true,
  },
  {
    path: '/fornecedores',
    element: <Suppliers />,
    protected: true,
  },
  {
    path: '/manutencoes',
    element: <Maintenance />,
    protected: true,
  },
  {
    path: '/servicos',
    element: <AdditionalServices />,
    protected: true,
  },
  {
    path: '/pagamento',
    element: <Payments />,
    protected: true,
  },
  {
    path: '/contas',
    element: <Debits />,
    protected: true,
  },
  {
    path: '/locacoes',
    element: <Rental />,
    protected: true,
  },
  {
    path: '/relatorios',
    element: <Reports />,
    protected: true,
  },
];

const router = createBrowserRouter([
  ...routes.map((route) => ({
    path: route.path,
    element: route.element,
  })),
]);

export function Routes() {
  return <RouterProvider router={router} />;
}
