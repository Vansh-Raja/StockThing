import TransactionsPage from '@/components/TransactionsPage';

export default function Home() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-sm text-gray-500">
          Add buy or sell transactions to track your stock portfolio
        </p>
      </div>
      <TransactionsPage />
    </div>
  );
}
