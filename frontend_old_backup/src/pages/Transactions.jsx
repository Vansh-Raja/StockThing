import { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

export default function Transactions() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionSubmit = () => {
    // Trigger a refresh of the transaction list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-sm text-gray-500">
          Add buy or sell transactions to track your stock portfolio
        </p>
      </div>

      <div className="space-y-8">
        <TransactionForm onSubmit={handleTransactionSubmit} />
        <div key={refreshKey}>
          <TransactionList />
        </div>
      </div>
    </div>
  );
}

