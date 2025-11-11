import { usePortfolio } from '../context/PortfolioContext';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { formatCurrency } from '../utils/portfolioUtils';
import { useState, useMemo } from 'react';

export default function CapitalGainsTable() {
  const { transactions, stocks, accounts } = usePortfolio();
  const [filters, setFilters] = useState({
    accountId: '',
    stockId: '',
    dateFrom: '',
    dateTo: ''
  });

  // Calculate capital gains from sell transactions
  const capitalGains = useMemo(() => {
    const sellTransactions = transactions.filter(t => t.transaction_type === 'sell');
    
    return sellTransactions.map(sellTransaction => {
      // Find corresponding buy transactions for this stock and account
      const buyTransactions = transactions
        .filter(t => 
          t.stock_id === sellTransaction.stock_id &&
          t.account_id === sellTransaction.account_id &&
          t.transaction_type === 'buy' &&
          new Date(t.transaction_date) <= new Date(sellTransaction.transaction_date)
        )
        .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

      // Calculate average buy price (FIFO method simplified)
      let remainingQuantity = sellTransaction.quantity;
      let totalBuyCost = 0;
      let buyDate = null;

      for (const buyTransaction of buyTransactions) {
        if (remainingQuantity <= 0) break;
        
        const quantityUsed = Math.min(remainingQuantity, buyTransaction.quantity);
        totalBuyCost += buyTransaction.price * quantityUsed;
        remainingQuantity -= quantityUsed;
        
        if (!buyDate) {
          buyDate = buyTransaction.transaction_date;
        }
      }

      const avgBuyPrice = sellTransaction.quantity > 0 
        ? totalBuyCost / sellTransaction.quantity 
        : 0;
      
      const sellPrice = sellTransaction.price;
      const totalInvested = avgBuyPrice * sellTransaction.quantity;
      const totalProceeds = sellPrice * sellTransaction.quantity;
      const capitalGain = totalProceeds - totalInvested;
      const capitalGainPercent = totalInvested > 0 
        ? (capitalGain / totalInvested) * 100 
        : 0;

      const holdingPeriod = buyDate 
        ? Math.floor((new Date(sellTransaction.transaction_date) - new Date(buyDate)) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: sellTransaction.id,
        stock: sellTransaction.stock,
        account: sellTransaction.account,
        buy_date: buyDate,
        sell_date: sellTransaction.transaction_date,
        quantity: sellTransaction.quantity,
        buy_price: avgBuyPrice,
        sell_price: sellPrice,
        total_invested: totalInvested,
        total_proceeds: totalProceeds,
        capital_gain: capitalGain,
        capital_gain_percent: capitalGainPercent,
        holding_period: holdingPeriod,
        is_long_term: holdingPeriod > 365
      };
    });
  }, [transactions]);

  // Apply filters
  const filteredGains = useMemo(() => {
    return capitalGains.filter(gain => {
      if (filters.accountId && gain.account?.id !== parseInt(filters.accountId)) return false;
      if (filters.stockId && gain.stock?.id !== parseInt(filters.stockId)) return false;
      if (filters.dateFrom && new Date(gain.sell_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(gain.sell_date) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [capitalGains, filters]);

  const totalGain = filteredGains.reduce((sum, g) => sum + g.capital_gain, 0);
  const shortTermGains = filteredGains.filter(g => !g.is_long_term).reduce((sum, g) => sum + g.capital_gain, 0);
  const longTermGains = filteredGains.filter(g => g.is_long_term).reduce((sum, g) => sum + g.capital_gain, 0);

  const handleExportCSV = () => {
    const headers = ['Stock', 'Account', 'Buy Date', 'Sell Date', 'Quantity', 'Buy Price', 'Sell Price', 'Capital Gain', 'Holding Period'];
    const rows = filteredGains.map(g => [
      g.stock?.symbol || '',
      g.account?.account_name || '',
      g.buy_date ? formatDate(g.buy_date) : '',
      formatDate(g.sell_date),
      g.quantity,
      g.buy_price.toFixed(2),
      g.sell_price.toFixed(2),
      g.capital_gain.toFixed(2),
      g.holding_period
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capital-gains-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (capitalGains.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400 text-sm">No capital gains data available. Sell some stocks to see capital gains.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
            <select
              value={filters.accountId}
              onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.account_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
            <select
              value={filters.stockId}
              onChange={(e) => setFilters({ ...filters, stockId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="">All Stocks</option>
              {stocks.map(stock => (
                <option key={stock.id} value={stock.id}>{stock.symbol}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Capital Gains</p>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(totalGain)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Short-term Gains</p>
            <p className={`text-2xl font-bold ${shortTermGains >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(shortTermGains)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Long-term Gains</p>
            <p className={`text-2xl font-bold ${longTermGains >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(longTermGains)}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 font-semibold"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide -mx-6">
          <div className="min-w-full inline-block">
            <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buy Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sell Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buy Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sell Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capital Gain</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Holding Period</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredGains.map((gain) => (
                <tr key={gain.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{gain.stock?.symbol}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{gain.stock?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {gain.account?.account_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {gain.buy_date ? formatDate(gain.buy_date) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(gain.sell_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {gain.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatCurrency(gain.buy_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatCurrency(gain.sell_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${gain.capital_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {gain.capital_gain >= 0 ? '+' : ''}{formatCurrency(gain.capital_gain)}
                    </div>
                    <div className={`text-xs font-medium ${gain.capital_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {gain.capital_gain_percent >= 0 ? '+' : ''}{gain.capital_gain_percent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 font-medium">{gain.holding_period} days</div>
                    <div className={`text-xs font-medium ${gain.is_long_term ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {gain.is_long_term ? 'Long-term' : 'Short-term'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

