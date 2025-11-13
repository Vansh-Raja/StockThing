'use client';

import { useState, useMemo, useEffect } from 'react';
import { portfolioAPI, accountAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/portfolioUtils';
import SummaryCards from './SummaryCards';
import PortfolioTable from './PortfolioTable';

interface PortfolioHolding {
  stock_id: number;
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  total_quantity: number;
  account_breakdown: Array<{
    account_id: number;
    account_name: string;
    account_type: string;
    quantity: number;
  }>;
  avg_purchase_price: number;
  current_price: number;
  total_invested: number;
  current_value: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
  day_change_percent: string;
}

interface AccountHolding {
  account_id: number;
  account_name: string;
  account_type: string;
  stocks: Array<{
    stock_id: number;
    symbol: string;
    name: string;
    exchange: string;
    sector?: string;
    quantity: number;
    avg_purchase_price: number;
    current_price: number;
    total_invested: number;
    current_value: number;
    unrealized_gain: number;
    unrealized_gain_percent: number;
  }>;
  total_quantity: number;
  total_invested: number;
  current_value: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
}

interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
  total_holdings: number;
}

interface Account {
  id: number;
  account_name: string;
  account_type: string;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [accountHoldings, setAccountHoldings] = useState<AccountHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    total_value: 0,
    total_invested: 0,
    unrealized_gain: 0,
    unrealized_gain_percent: 0,
    total_holdings: 0
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [scripData, headData, summaryData, accountsData] = await Promise.all([
        portfolioAPI.getScripView(1),
        portfolioAPI.getHeadView(1),
        portfolioAPI.getSummary(1),
        accountAPI.getAll()
      ]);

      setHoldings(scripData.holdings || []);
      setAccountHoldings(headData.account_holdings || []);
      setSummary(summaryData);
      setAccounts(accountsData || []);
    } catch (err: any) {
      console.error('Error loading portfolio data:', err);
      setError('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 text-sm mt-4">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-rose-600 text-sm">{error}</p>
        <button
          onClick={loadPortfolioData}
          className="mt-4 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

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
          <button
            onClick={loadPortfolioData}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refresh portfolio data"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
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
