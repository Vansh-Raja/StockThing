'use client';

import { useState, useMemo, useEffect } from 'react';
import { capitalGainsAPI, accountAPI, stockAPI } from '@/lib/api';
import { formatDate, exportToCSV } from '@/lib/capitalGainsUtils';
import { formatCurrency } from '@/lib/portfolioUtils';

interface CapitalGain {
  id: number;
  stock_id: number;
  account_id: number;
  stock?: {
    id: number;
    symbol: string;
    name: string;
  };
  account?: {
    id: number;
    account_name: string;
  };
  buy_date: string;
  sell_date: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  capital_gain: number;
  capital_gain_percent: number;
  holding_period: number;
  is_long_term: boolean;
}

interface Account {
  id: number;
  account_name: string;
  account_type: string;
}

interface Stock {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
}

interface CapitalGainsSummary {
  totalGain: number;
  shortTermGains: number;
  longTermGains: number;
}

export default function CapitalGainsPage() {
  const [allGains, setAllGains] = useState<CapitalGain[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    accountId: '',
    stockId: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadCapitalGainsData();
  }, []);

  const loadCapitalGainsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load accounts and stocks for filters
      const [accountsData, stocksData] = await Promise.all([
        accountAPI.getAll(),
        // For stocks, we'll need to get them from transactions or create a stocks endpoint
        // For now, let's fetch from the gains data
        Promise.resolve([])
      ]);

      setAccounts(accountsData || []);

      // Load capital gains with current filters
      const apiFilters: any = { family_id: 1 };
      if (filters.accountId) apiFilters.account_id = parseInt(filters.accountId);
      if (filters.stockId) apiFilters.stock_id = parseInt(filters.stockId);
      if (filters.dateFrom) apiFilters.from_date = filters.dateFrom;
      if (filters.dateTo) apiFilters.to_date = filters.dateTo;

      const gainsData = await capitalGainsAPI.getAll(apiFilters);
      const gains = gainsData.gains || [];
      
      setAllGains(gains);
      
      // Extract unique stocks from gains
      const uniqueStocks = new Map<number, Stock>();
      gains.forEach((gain: CapitalGain) => {
        if (gain.stock && !uniqueStocks.has(gain.stock.id)) {
          uniqueStocks.set(gain.stock.id, {
            id: gain.stock.id,
            symbol: gain.stock.symbol,
            name: gain.stock.name,
            exchange: 'NSE' // Default, could be enhanced
          });
        }
      });
      setStocks(Array.from(uniqueStocks.values()));
    } catch (err: any) {
      console.error('Error loading capital gains data:', err);
      setError('Failed to load capital gains data');
    } finally {
      setIsLoading(false);
    }
  };

  const round = (num: number, decimals: number) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  // Reload when filters change
  useEffect(() => {
    loadCapitalGainsData();
  }, [filters.accountId, filters.stockId, filters.dateFrom, filters.dateTo]);

  const filteredGains = useMemo(() => {
    // API already filters, but we can do client-side filtering if needed
    return allGains;
  }, [allGains]);

  // Calculate summary
  const summary: CapitalGainsSummary = useMemo(() => {
    const totalGain = filteredGains.reduce((sum, g) => sum + g.capital_gain, 0);
    const shortTermGains = filteredGains
      .filter(g => !g.is_long_term)
      .reduce((sum, g) => sum + g.capital_gain, 0);
    const longTermGains = filteredGains
      .filter(g => g.is_long_term)
      .reduce((sum, g) => sum + g.capital_gain, 0);
    
    return {
      totalGain: round(totalGain, 2),
      shortTermGains: round(shortTermGains, 2),
      longTermGains: round(longTermGains, 2)
    };
  }, [filteredGains]);

  const handleExportCSV = () => {
    exportToCSV(filteredGains);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 text-sm mt-4">Loading capital gains...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-rose-600 text-sm">{error}</p>
        <button
          onClick={loadCapitalGainsData}
          className="mt-4 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (allGains.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400 text-sm">No capital gains data available. Sell some stocks to see capital gains.</p>
        <button
          onClick={loadCapitalGainsData}
          className="mt-4 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Capital Gains</p>
          <p className={`text-2xl font-bold ${summary.totalGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(summary.totalGain)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Short-term Gains</p>
          <p className={`text-2xl font-bold ${summary.shortTermGains >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(summary.shortTermGains)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Long-term Gains</p>
          <p className={`text-2xl font-bold ${summary.longTermGains >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(summary.longTermGains)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={loadCapitalGainsData}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refresh capital gains data"
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
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Buy Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sell Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Buy Price</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Sell Price</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Capital Gain</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Holding Period</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGains.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No capital gains match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredGains.map((gain) => (
                    <tr key={gain.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{gain.stock?.symbol}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{gain.stock?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {gain.account?.account_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(gain.buy_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(gain.sell_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {gain.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {formatCurrency(gain.buy_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {formatCurrency(gain.sell_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-semibold ${gain.capital_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {gain.capital_gain >= 0 ? '+' : ''}{formatCurrency(gain.capital_gain)}
                        </div>
                        <div className={`text-xs font-medium ${gain.capital_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {gain.capital_gain_percent >= 0 ? '+' : ''}{gain.capital_gain_percent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {gain.holding_period} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          gain.is_long_term 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {gain.is_long_term ? 'Long-term' : 'Short-term'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
