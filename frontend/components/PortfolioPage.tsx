'use client';

import { useState, useMemo } from 'react';
import { mockData, mockCurrentPrices } from '@/lib/mockData';
import { getPortfolioData, getAccountPortfolioData, formatCurrency, type PortfolioHolding, type AccountHolding } from '@/lib/portfolioUtils';
import SummaryCards from './SummaryCards';
import PortfolioTable from './PortfolioTable';

export default function PortfolioPage() {
  const { holdings, summary } = getPortfolioData();
  const { accountHoldings } = getAccountPortfolioData();
  const accounts = mockData.accounts;

  const [viewMode, setViewMode] = useState<'scrip' | 'head'>('scrip');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState('');

  const filteredHoldings = useMemo(() => {
    let filtered: PortfolioHolding[] = [...holdings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(h =>
        h.symbol.toLowerCase().includes(term) ||
        h.name.toLowerCase().includes(term)
      );
    }

    if (filterAccount) {
      filtered = filtered.filter(h =>
        h.account_breakdown.some(acc => acc.account_id === parseInt(filterAccount))
      );
    }

    filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));

    return filtered;
  }, [holdings, filterAccount, searchTerm]);

  const filteredAccountHoldings = useMemo(() => {
    let filtered: AccountHolding[] = [...accountHoldings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.map(account => ({
        ...account,
        stocks: account.stocks.filter(s =>
          s.symbol.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term)
        )
      })).filter(account => account.stocks.length > 0);
    }

    if (filterAccount) {
      filtered = filtered.filter(acc => acc.account_id === parseInt(filterAccount));
    }

    filtered.sort((a, b) => a.account_name.localeCompare(b.account_name));

    return filtered;
  }, [accountHoldings, filterAccount, searchTerm]);

  return (
    <>
      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* View Toggle and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('scrip')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'scrip'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Scrip View
            </button>
            <button
              onClick={() => setViewMode('head')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'head'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Head View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Portfolio Table */}
      {viewMode === 'scrip' ? (
        <PortfolioTable holdings={filteredHoldings} mode="scrip" />
      ) : (
        <PortfolioTable accountHoldings={filteredAccountHoldings} mode="head" />
      )}
    </>
  );
}
