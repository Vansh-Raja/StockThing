import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePortfolio } from '../context/PortfolioContext';
import { getCurrentDateTime } from '../utils/dateUtils';
import StockInput from './StockInput';
import DatePicker from './DatePicker';

export default function TransactionForm({ onSubmit }) {
  const { accounts, stocks, addTransaction, getStockBySymbol } = usePortfolio();
  const [transactionType, setTransactionType] = useState('buy');
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      transaction_type: 'buy',
      stock_symbol: '',
      account_id: '',
      quantity: '',
      price: '',
      transaction_date: getCurrentDateTime(),
      notes: ''
    }
  });

  const selectedStockSymbol = watch('stock_symbol');
  const selectedStock = selectedStockSymbol ? getStockBySymbol(selectedStockSymbol) : null;

  const handleFormSubmit = (data) => {
    const stock = getStockBySymbol(data.stock_symbol);
    if (!stock) {
      alert('Please select a valid stock');
      return;
    }

    const transactionData = {
      account_id: parseInt(data.account_id),
      stock_id: stock.id,
      transaction_type: transactionType,
      quantity: parseInt(data.quantity),
      price: parseFloat(data.price),
      transaction_date: data.transaction_date || getCurrentDateTime(),
      notes: data.notes || ''
    };

    addTransaction(transactionData);
    onSubmit && onSubmit(transactionData);
    reset();
    setTransactionType('buy');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Transaction</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Transaction Type
          </label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setTransactionType('buy');
                setValue('transaction_type', 'buy');
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                transactionType === 'buy'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => {
                setTransactionType('sell');
                setValue('transaction_type', 'sell');
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                transactionType === 'sell'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Stock Symbol */}
        <StockInput
          value={selectedStockSymbol}
          onChange={(value) => setValue('stock_symbol', value)}
          label="Stock Symbol"
          required
        />
        {errors.stock_symbol && (
          <p className="text-red-500 text-sm">{errors.stock_symbol.message}</p>
        )}
        {selectedStock && (
          <p className="text-sm text-gray-600">
            {selectedStock.name} ({selectedStock.exchange})
          </p>
        )}

        {/* Account Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            {...register('account_id', { required: 'Please select an account' })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name} ({account.account_type})
              </option>
            ))}
          </select>
          {errors.account_id && (
            <p className="text-red-500 text-sm mt-1">{errors.account_id.message}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            {...register('quantity', {
              required: 'Quantity is required',
              min: { value: 1, message: 'Quantity must be at least 1' }
            })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Enter quantity"
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
          )}
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
            {...register('price', {
              required: 'Price is required',
              min: { value: 0.01, message: 'Price must be greater than 0' }
            })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Enter price per share"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Date/Time Picker */}
        <DatePicker
          value={watch('transaction_date')}
          onChange={(value) => setValue('transaction_date', value)}
          label="Date & Time"
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            placeholder="Add any notes..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md ${
            transactionType === 'buy'
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40'
              : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30 hover:shadow-lg hover:shadow-rose-500/40'
          }`}
        >
          {transactionType === 'buy' ? 'Buy Stock' : 'Sell Stock'}
        </button>
      </form>
    </div>
  );
}

