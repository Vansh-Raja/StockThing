'use client';

import { mockData } from '@/lib/mockData';
import type { Transaction, Stock, Account } from '@/lib/mockData';

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  // Use UTC to ensure consistent formatting on server and client
  const day = date.getUTCDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  
  return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export default function TransactionList() {
  const transactions = mockData.transactions.map(t => {
    const stock = mockData.stocks.find(s => s.id === t.stock_id);
    const account = mockData.accounts.find(a => a.id === t.account_id);
    return { ...t, stock, account };
  }).sort((a, b) => 
    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400 text-sm">No transactions yet. Add your first transaction above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDateTime(transaction.transaction_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        transaction.transaction_type === 'buy'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {transaction.transaction_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {transaction.stock?.symbol}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {transaction.stock?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {transaction.account?.account_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {transaction.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatCurrency(transaction.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(transaction.price * transaction.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

