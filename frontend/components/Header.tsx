'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Transactions' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/capital-gains', label: 'Capital Gains' },
    { path: '/accounts', label: 'Accounts' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Stock Portfolio
            </Link>
            {user && (
              <span className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                {user.username}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <nav className="flex space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
              </nav>
            )}
            
            {user ? (
              <button
                onClick={() => logout()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 transition-all duration-200 hover:shadow-sm active:scale-95"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-all duration-200 hover:shadow-sm active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

