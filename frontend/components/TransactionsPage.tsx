'use client';

import { useState } from 'react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function TransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionSubmit = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <TransactionForm onSubmit={handleTransactionSubmit} />
      <div key={refreshKey}>
        <TransactionList />
      </div>
    </div>
  );
}

