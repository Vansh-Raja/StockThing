import PortfolioPage from '@/components/PortfolioPage';
import AuthGuard from '@/components/AuthGuard';

export default function Portfolio() {
  return (
    <AuthGuard>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
          <p className="text-sm text-gray-500">
            Combined view of all family holdings with account breakdown
          </p>
        </div>
        <PortfolioPage />
      </div>
    </AuthGuard>
  );
}

