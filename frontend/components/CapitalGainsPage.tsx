'use client';

import { useState, useMemo } from 'react';
import { mockData } from '@/lib/mockData';
import { calculateCapitalGains, getCapitalGainsSummary, formatDate, exportToCSV } from '@/lib/capitalGainsUtils';
import { formatCurrency } from '@/lib/portfolioUtils';
import type { CapitalGain } from '@/lib/capitalGainsUtils';

export default function CapitalGainsPage() {
  const allGains = calculateCapitalGains();
  const accounts = mockData.accounts;
  const stocks = mockData.stocks;

  const [filters, setFilters] = useState({
    accountId: '',
    stockId: '',
    dateFrom: '',
    dateTo: ''
  });

  const filteredGains = useMemo(() => {
    let filtered: CapitalGain[] = [...allGains];

    if (filters.accountId) {
      filtered = filtered.filter(g => g.account_id === parseInt(filters.accountId));
    }

    if (filters.stockId) {
      filtered = filtered.filter(g => g.stock_id === parseInt(filters.stockId));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(g => g.sell_date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(g => g.sell_date <= filters.dateTo + 'T23:59:59');
    }

    return filtered;
  }, [allGains, filters]);

  const summary = getCapitalGainsSummary(filteredGains);

  const handleExportCSV = () => {
    exportToCSV(filteredGains);
  };

  if (allGains.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400 text-sm">No capital gains data available. Sell some stocks to see capital gains.</p>
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
