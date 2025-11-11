'use client';

import { useState } from 'react';
import StockSearch from './StockSearch';

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
}

export default function TransactionForm({ onSubmit }: { onSubmit: () => void }) {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [accountId, setAccountId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');

  // Mock accounts
  const accounts = [
    { id: 1, account_name: "Rahul", account_type: "individual" },
    { id: 2, account_name: "Amit", account_type: "individual" },
    { id: 3, account_name: "Amit HUF", account_type: "HUF" }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStock) {
      alert('Please select a stock');
      return;
    }

    if (!accountId) {
      alert('Please select an account');
      return;
    }

    // Mock submission
    console.log('Form submitted:', {
      stock: selectedStock,
      account_id: accountId,
      quantity,
      price,
      transaction_date: transactionDate,
      notes
    });
    
    onSubmit();
    
    // Reset form
    setSelectedStock(null);
    setAccountId('');
    setQuantity('');
    setPrice('');
    setTransactionDate(new Date().toISOString().slice(0, 16));
    setNotes('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Share</h2>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Stock Search */}
        <StockSearch 
          onSelect={(stock) => setSelectedStock(stock)} 
          selectedStock={selectedStock}
        />

        {/* Account Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
            required
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name} ({account.account_type})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={1}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Enter quantity"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Share (₹)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0.01}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Enter price per share"
            required
          />
        </div>

        {/* Date/Time Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            placeholder="Add any notes..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40"
        >
          Add Share
        </button>
      </form>
    </div>
  );
}
