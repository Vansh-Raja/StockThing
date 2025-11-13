import CapitalGainsPage from '@/components/CapitalGainsPage';
import AuthGuard from '@/components/AuthGuard';

export default function CapitalGains() {
  return (
    <AuthGuard>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Capital Gains Statement</h1>
          <p className="text-sm text-gray-500">
            View realized capital gains and losses from sold stocks
          </p>
        </div>
        <CapitalGainsPage />
      </div>
    </AuthGuard>
  );
}

