import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { menuItems } from './@types';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col py-3">
      <div className="p-4 border-b border-gray-200 mb-4">
        <h1 className="text-3xl font-bold text-gray-900 text-center font-russo">SGLM</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`
                flex items-center px-5 py-4 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
