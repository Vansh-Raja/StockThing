'use client';

import { useState, useRef } from 'react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function TransactionsPage() {
  const refreshKeyRef = useRef(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionSubmit = () => {
    // Trigger refresh of transaction list
    refreshKeyRef.current += 1;
    setRefreshKey(refreshKeyRef.current);
  };

  return (
    <div className="space-y-8">
      <TransactionForm onSubmit={handleTransactionSubmit} />
      <TransactionList refreshKey={refreshKey} />
    </div>
  );
}

