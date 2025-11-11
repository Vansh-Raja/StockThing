'use client';

import { formatCurrency } from '@/lib/portfolioUtils';
import type { PortfolioHolding, AccountHolding } from '@/lib/portfolioUtils';
import { useState, Fragment } from 'react';

interface PortfolioTableProps {
  holdings?: PortfolioHolding[];
  accountHoldings?: AccountHolding[];
  mode: 'scrip' | 'head';
}

export default function PortfolioTable({ holdings, accountHoldings, mode }: PortfolioTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number | string>>(new Set());

  const toggleRow = (id: number | string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (mode === 'scrip' && holdings) {
    if (holdings.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No holdings match your filters.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Rate</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Rs.</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">CMP</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Value</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings.map((holding) => {
                const isExpanded = expandedRows.has(holding.stock_id);
                return (
                  <Fragment key={holding.stock_id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRow(holding.stock_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? '−' : '+'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{holding.symbol}</div>
                        <div className="text-xs text-gray-500">{holding.name}</div>
                        <div className="text-xs text-gray-400">{holding.exchange}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                        {holding.total_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                        {formatCurrency(holding.avg_purchase_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                        {formatCurrency(holding.total_invested)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                        {formatCurrency(holding.current_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                        {formatCurrency(holding.current_value)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                        holding.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {holding.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(holding.unrealized_gain)}
                      </td>
                    </tr>
                    {isExpanded && holding.account_breakdown.map((account, idx) => (
                      <tr key={`${holding.stock_id}-${account.account_id}`} className="bg-gray-50">
                        <td className="px-6 py-2"></td>
                        <td className="px-6 py-2 pl-12">
                          <span className="text-sm text-gray-600">{account.account_name}</span>
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {account.quantity}
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(holding.avg_purchase_price)}
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(holding.avg_purchase_price * account.quantity)}
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(holding.current_price)}
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(holding.current_price * account.quantity)}
                        </td>
                        <td className={`px-6 py-2 text-right text-sm font-medium ${
                          (holding.current_price - holding.avg_purchase_price) * account.quantity >= 0 
                            ? 'text-emerald-600' 
                            : 'text-rose-600'
                        }`}>
                          {(holding.current_price - holding.avg_purchase_price) * account.quantity >= 0 ? '+' : ''}
                          {formatCurrency((holding.current_price - holding.avg_purchase_price) * account.quantity)}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mode === 'head' && accountHoldings) {
    if (accountHoldings.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No holdings match your filters.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Rate</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Rs.</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">CMP</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Value</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accountHoldings.map((account) => {
                const isExpanded = expandedRows.has(account.account_id);
                return (
                  <Fragment key={account.account_id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRow(account.account_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? '−' : '+'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{account.account_name}</div>
                        <div className="text-xs text-gray-500">{account.account_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                        {account.total_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                        {formatCurrency(account.total_invested / account.total_quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                        {formatCurrency(account.total_invested)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                        {formatCurrency(account.current_value / account.total_quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                        {formatCurrency(account.current_value)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                        account.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {account.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(account.unrealized_gain)}
                      </td>
                    </tr>
                    {isExpanded && account.stocks.map((stock) => (
                      <tr key={`${account.account_id}-${stock.stock_id}`} className="bg-gray-50">
                        <td className="px-6 py-2"></td>
                        <td className="px-6 py-2 pl-12">
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-xs text-gray-500">{stock.name}</div>
                          <div className="text-xs text-gray-400">{stock.exchange}</div>
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {stock.quantity}
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(stock.avg_purchase_price)}
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(stock.total_invested)}
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(stock.current_price)}
                        </td>
                        <td className="px-6 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(stock.current_value)}
                        </td>
                        <td className={`px-6 py-2 text-right text-sm font-medium ${
                          stock.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {stock.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(stock.unrealized_gain)}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

