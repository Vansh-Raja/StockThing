'use client';

import { useState, useEffect } from 'react';
import { accountAPI, transactionAPI, stockAPI } from '@/lib/api';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  current_price?: number;
}

interface Account {
  id: number;
  account_name: string;
  account_type: string;
}

interface AccountBreakdown {
  account_id: number;
  account_name: string;
  account_type: string;
  quantity: number;
}

interface SellShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stock: Stock | null;
  accountBreakdown: AccountBreakdown[];
}

export default function SellShareModal({
  isOpen,
  onClose,
  onSuccess,
  stock,
  accountBreakdown
}: SellShareModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  // Reset form when modal opens/closes or stock changes
  useEffect(() => {
    if (isOpen && stock) {
      // Reset form
      setSelectedAccountId('');
      setQuantity('');
      setPrice('');
      setTransactionDate(new Date().toISOString().slice(0, 16));
      setNotes('');
      setError(null);
      
      // Fetch current price
      if (stock.id) {
        setIsLoadingPrice(true);
        stockAPI.search(stock.symbol, stock.exchange)
          .then((data: { stocks: Stock[] }) => {
            const foundStock = data.stocks?.[0];
            if (foundStock?.current_price) {
              setPrice(foundStock.current_price.toFixed(2));
            } else if (stock.current_price) {
              setPrice(stock.current_price.toFixed(2));
            }
            setIsLoadingPrice(false);
          })
          .catch(() => {
            // Use existing price if fetch fails
            if (stock.current_price) {
              setPrice(stock.current_price.toFixed(2));
            }
            setIsLoadingPrice(false);
          });
      }
    }
  }, [isOpen, stock]);

  // Update available quantity when account changes
  useEffect(() => {
    if (selectedAccountId && accountBreakdown.length > 0) {
      const account = accountBreakdown.find(acc => acc.account_id === parseInt(selectedAccountId));
      if (account) {
        setAvailableQuantity(account.quantity);
      } else {
        setAvailableQuantity(0);
      }
    } else {
      setAvailableQuantity(0);
    }
  }, [selectedAccountId, accountBreakdown]);

  if (!isOpen || !stock) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAccountId) {
      setError('Please select an account');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (!quantity || quantityNum <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (quantityNum > availableQuantity) {
      setError(`Cannot sell more than available quantity (${availableQuantity})`);
      return;
    }

    const priceNum = parseFloat(price);
    if (!price || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = transactionDate 
        ? new Date(transactionDate).toISOString()
        : new Date().toISOString();

      await transactionAPI.create({
        account_id: parseInt(selectedAccountId),
        stock_id: stock.id,
        quantity: quantityNum,
        price: priceNum,
        transaction_type: 'sell',
        transaction_date: formattedDate,
        notes: notes || undefined
      });

      // Reset form
      setSelectedAccountId('');
      setQuantity('');
      setPrice('');
      setTransactionDate(new Date().toISOString().slice(0, 16));
      setNotes('');
      setError(null);

      // Notify parent
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error selling shares:', err);
      setError(err.message || 'Failed to sell shares. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container - centers the modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-6 pt-6 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
                  Sell {stock.symbol}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the details for your sell transaction
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Stock Info Card */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{stock.name}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{stock.exchange}</div>
                  </div>
                  {stock.current_price && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Current Price</div>
                      <div className="text-lg font-bold text-indigo-600">
                        ₹{stock.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Selector */}
              <div>
                <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Account
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="account-select"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-900"
                  required
                >
                  <option value="">Select an account</option>
                  {accountBreakdown.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name} ({account.account_type}) - {account.quantity} shares available
                    </option>
                  ))}
                </select>
                {selectedAccountId && availableQuantity > 0 && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                    <p className="text-xs font-medium text-emerald-800">
                      ✓ Available: <span className="font-bold">{availableQuantity}</span> shares
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Sell
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="quantity-input"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={1}
                  max={availableQuantity}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={selectedAccountId ? `Enter quantity (max: ${availableQuantity})` : "Select account first"}
                  required
                  disabled={!selectedAccountId}
                />
                {selectedAccountId && availableQuantity > 0 && quantity && (
                  <p className="mt-1 text-xs text-gray-600">
                    {parseInt(quantity) > availableQuantity ? (
                      <span className="text-rose-600">⚠ Cannot sell more than {availableQuantity} shares</span>
                    ) : (
                      <span className="text-gray-500">Remaining after sale: {availableQuantity - (parseInt(quantity) || 0)} shares</span>
                    )}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Share (₹)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="price-input"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={0.01}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 disabled:bg-gray-100"
                    placeholder="Enter price per share"
                    required
                    disabled={isLoadingPrice}
                  />
                  {isLoadingPrice && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    </div>
                  )}
                </div>
                {isLoadingPrice && (
                  <p className="mt-1 text-xs text-gray-500">Loading current market price...</p>
                )}
                {!isLoadingPrice && price && quantity && selectedAccountId && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-800">
                      Total Sale Value: <span className="font-bold">₹{(parseFloat(price) * (parseInt(quantity) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Date/Time */}
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedAccountId || !quantity || !price}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Selling...
                    </>
                  ) : (
                    'Sell Shares'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

