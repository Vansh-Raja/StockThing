import { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import PortfolioCard from '../components/PortfolioCard';
import SummaryCards from '../components/SummaryCards';

export default function Portfolio() {
  const { portfolioHoldings, portfolioSummary, accounts } = usePortfolio();
  const [filterAccount, setFilterAccount] = useState('');
  const [sortBy, setSortBy] = useState('symbol');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort holdings
  const filteredHoldings = useMemo(() => {
    let filtered = [...portfolioHoldings];

    // Filter by account
    if (filterAccount) {
      filtered = filtered.filter(holding =>
        holding.account_breakdown.some(acc => acc.account_id === parseInt(filterAccount))
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(holding =>
        holding.symbol.toLowerCase().includes(term) ||
        holding.name.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        case 'quantity':
          return b.total_quantity - a.total_quantity;
        case 'value':
          return b.current_value - a.current_value;
        case 'gain':
          return b.unrealized_gain_percent - a.unrealized_gain_percent;
        default:
          return 0;
      }
    });

    return filtered;
  }, [portfolioHoldings, filterAccount, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
        <p className="text-sm text-gray-500">
          Combined view of all family holdings with account breakdown
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={portfolioSummary} />

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Stock
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by symbol or name..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Account
            </label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="">All Accounts</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.account_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="symbol">Symbol</option>
              <option value="quantity">Quantity</option>
              <option value="value">Value</option>
              <option value="gain">Gain/Loss %</option>
            </select>
          </div>
        </div>
      </div>

      {/* Holdings Grid */}
      {filteredHoldings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">
            {searchTerm || filterAccount
              ? 'No holdings match your filters.'
              : 'No holdings in portfolio. Add transactions to see your portfolio here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHoldings.map((holding) => (
            <PortfolioCard key={holding.stock_id} holding={holding} />
          ))}
        </div>
      )}
    </div>
  );
}

