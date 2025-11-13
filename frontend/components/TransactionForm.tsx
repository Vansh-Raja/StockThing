'use client';

import { useState, useEffect } from 'react';
import StockSearch from './StockSearch';
import { accountAPI, transactionAPI } from '@/lib/api';

interface Stock {
  id?: number;
  symbol: string;
  name: string;
  exchange: string;
}

interface Account {
  id: number;
  account_name: string;
  account_type: string;
}

export default function TransactionForm({ onSubmit }: { onSubmit: () => void }) {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts from API
  useEffect(() => {
    accountAPI.getAll()
      .then((data: Account[]) => {
        setAccounts(data);
      })
      .catch((error) => {
        console.error('Error fetching accounts:', error);
        setError('Failed to load accounts');
      });
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedStock || !selectedStock.id) {
      setError('Please select a stock');
      return;
    }

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format transaction date for API (ISO 8601)
      const formattedDate = transactionDate 
        ? new Date(transactionDate).toISOString()
        : new Date().toISOString();

      await transactionAPI.create({
        account_id: parseInt(accountId),
        stock_id: selectedStock.id,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        transaction_type: 'buy', // Always 'buy' since we removed sell toggle
        transaction_date: formattedDate,
        notes: notes || undefined
      });
      
      // Reset form on success
      setSelectedStock(null);
      setAccountId('');
      setQuantity('');
      setPrice('');
      setTransactionDate(new Date().toISOString().slice(0, 16));
      setNotes('');
      setError(null);
      
      // Notify parent component
      onSubmit();
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      setError(err.message || 'Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:hover:shadow-md"
        >
          {isSubmitting ? 'Adding...' : 'Add Share'}
        </button>
      </form>
    </div>
  );
}
