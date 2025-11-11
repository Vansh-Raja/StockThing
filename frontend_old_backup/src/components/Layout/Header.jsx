import { Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';

export default function Header() {
  const location = useLocation();
  const { currentFamily } = usePortfolio();

  const navItems = [
    { path: '/', label: 'Transactions' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/capital-gains', label: 'Capital Gains' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Stock Portfolio
            </Link>
            {currentFamily && (
              <span className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                {currentFamily.name}
              </span>
            )}
          </div>
          
          <nav className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

