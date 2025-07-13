import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from '@/features/login/login-page';

const routes = [
  {
    path: '/',
    element: <LoginPage />,
    protected: false,
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
