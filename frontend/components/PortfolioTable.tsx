'use client';

import { formatCurrency } from '@/lib/portfolioUtils';
import type { PortfolioHolding, AccountHolding } from '@/lib/portfolioUtils';
import { useState, Fragment } from 'react';
import SellShareModal from './SellShareModal';

interface PortfolioTableProps {
  holdings?: PortfolioHolding[];
  accountHoldings?: AccountHolding[];
  mode: 'scrip' | 'head';
  onRefresh?: () => void;
}

export default function PortfolioTable({ holdings, accountHoldings, mode, onRefresh }: PortfolioTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number | string>>(new Set());
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<PortfolioHolding | null>(null);

  const toggleRow = (id: number | string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSellClick = (e: React.MouseEvent, holding: PortfolioHolding) => {
    e.stopPropagation(); // Prevent row click
    setSelectedStock(holding);
    setSellModalOpen(true);
  };

  const handleSellSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
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
      <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Rs.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">CMP</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Profit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings.map((holding) => {
                const isExpanded = expandedRows.has(holding.stock_id);
                return (
                  <Fragment key={holding.stock_id}>
                    <tr 
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button 
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          onClick={() => toggleRow(holding.stock_id)}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => toggleRow(holding.stock_id)}
                      >
                        <div className="font-semibold text-gray-900">{holding.symbol}</div>
                        <div className="text-xs text-gray-500">{holding.name}</div>
                        <div className="text-xs text-gray-400">{holding.exchange}</div>
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-900 cursor-pointer"
                        onClick={() => toggleRow(holding.stock_id)}
                      >
                        {holding.total_quantity}
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right text-gray-700 cursor-pointer"
                        onClick={() => toggleRow(holding.stock_id)}
                      >
                        {formatCurrency(holding.avg_purchase_price)}
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right text-gray-700 cursor-pointer"
                        onClick={() => toggleRow(holding.stock_id)}
                      >
                        {formatCurrency(holding.total_invested)}
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-900 cursor-pointer"
                        onClick={() => toggleRow(holding.stock_id)}
                      >
                        {formatCurrency(holding.current_price)}
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-900 cursor-pointer"
                        onClick={() => toggleRow(holding.stock_id)}
                      >
                        {formatCurrency(holding.current_value)}
                      </td>
                      <td 
                        className={`px-4 py-4 whitespace-nowrap text-right font-semibold cursor-pointer ${
                          holding.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                        onClick={() => toggleRow(holding.stock_id)}
                      >
                        {holding.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(holding.unrealized_gain)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => handleSellClick(e, holding)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-full transition-colors"
                            title="Sell shares"
                          >
                            Sell
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            title="More options"
                            disabled
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && holding.account_breakdown.map((account, idx) => (
                      <tr key={`${holding.stock_id}-${account.account_id}`} className="bg-gray-50">
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 pl-12">
                          <span className="text-sm text-gray-600">{account.account_name}</span>
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-gray-700">
                          {account.quantity}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(holding.avg_purchase_price)}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(holding.avg_purchase_price * account.quantity)}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(holding.current_price)}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(holding.current_price * account.quantity)}
                        </td>
                        <td className={`px-4 py-2 text-right text-sm font-medium ${
                          (holding.current_price - holding.avg_purchase_price) * account.quantity >= 0 
                            ? 'text-emerald-600' 
                            : 'text-rose-600'
                        }`}>
                          {(holding.current_price - holding.avg_purchase_price) * account.quantity >= 0 ? '+' : ''}
                          {formatCurrency((holding.current_price - holding.avg_purchase_price) * account.quantity)}
                        </td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedStock && (
        <SellShareModal
          isOpen={sellModalOpen}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedStock(null);
          }}
          onSuccess={handleSellSuccess}
          stock={{
            id: selectedStock.stock_id,
            symbol: selectedStock.symbol,
            name: selectedStock.name,
            exchange: selectedStock.exchange,
            current_price: selectedStock.current_price
          }}
          accountBreakdown={selectedStock.account_breakdown}
        />
      )}
    </>
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
      <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Account</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Rate</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Rs.</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">CMP</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Value</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Profit</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accountHoldings.map((account) => {
                const isExpanded = expandedRows.has(account.account_id);
                return (
                  <Fragment key={account.account_id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button 
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          onClick={() => toggleRow(account.account_id)}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => toggleRow(account.account_id)}
                      >
                        <div className="font-semibold text-gray-900">{account.account_name}</div>
                        <div className="text-xs text-gray-500">{account.account_type}</div>
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-900 cursor-pointer"
                        onClick={() => toggleRow(account.account_id)}
                      >
                        {account.total_quantity}
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right text-gray-700 cursor-pointer"
                        onClick={() => toggleRow(account.account_id)}
                      >
                        {formatCurrency(account.total_invested / account.total_quantity)}
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right text-gray-700 cursor-pointer"
                        onClick={() => toggleRow(account.account_id)}
                      >
                        {formatCurrency(account.total_invested)}
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-900 cursor-pointer"
                        onClick={() => toggleRow(account.account_id)}
                      >
                        {formatCurrency(account.current_value / account.total_quantity)}
                      </td>
                      <td 
                        className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-900 cursor-pointer"
                        onClick={() => toggleRow(account.account_id)}
                      >
                        {formatCurrency(account.current_value)}
                      </td>
                      <td 
                        className={`px-4 py-4 whitespace-nowrap text-right font-semibold cursor-pointer ${
                          account.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                        onClick={() => toggleRow(account.account_id)}
                      >
                        {account.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(account.unrealized_gain)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {/* Actions column - empty for head view as selling is per stock, not per account */}
                      </td>
                    </tr>
                    {isExpanded && account.stocks.map((stock) => {
                      // Create a holding-like object for the modal
                      const stockHolding: PortfolioHolding = {
                        stock_id: stock.stock_id,
                        symbol: stock.symbol,
                        name: stock.name,
                        exchange: stock.exchange,
                        sector: stock.sector,
                        total_quantity: stock.quantity,
                        account_breakdown: [{
                          account_id: account.account_id,
                          account_name: account.account_name,
                          account_type: account.account_type,
                          quantity: stock.quantity
                        }],
                        avg_purchase_price: stock.avg_purchase_price,
                        current_price: stock.current_price,
                        total_invested: stock.total_invested,
                        current_value: stock.current_value,
                        unrealized_gain: stock.unrealized_gain,
                        unrealized_gain_percent: stock.unrealized_gain_percent,
                        day_change_percent: '0.00' // Not displayed in UI, but required by interface
                      };
                      
                      return (
                        <tr key={`${account.account_id}-${stock.stock_id}`} className="bg-gray-50">
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 pl-12">
                            <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                            <div className="text-xs text-gray-500">{stock.name}</div>
                            <div className="text-xs text-gray-400">{stock.exchange}</div>
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">
                            {stock.quantity}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">
                            {formatCurrency(stock.avg_purchase_price)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">
                            {formatCurrency(stock.total_invested)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">
                            {formatCurrency(stock.current_price)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">
                            {formatCurrency(stock.current_value)}
                          </td>
                          <td className={`px-4 py-2 text-right text-sm font-medium ${
                            stock.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {stock.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(stock.unrealized_gain)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStock(stockHolding);
                                  setSellModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-full transition-colors"
                                title="Sell shares"
                              >
                                Sell
                              </button>
                              <button
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                title="More options"
                                disabled
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedStock && (
        <SellShareModal
          isOpen={sellModalOpen}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedStock(null);
          }}
          onSuccess={handleSellSuccess}
          stock={{
            id: selectedStock.stock_id,
            symbol: selectedStock.symbol,
            name: selectedStock.name,
            exchange: selectedStock.exchange,
            current_price: selectedStock.current_price
          }}
          accountBreakdown={selectedStock.account_breakdown}
        />
      )}
    </>
    );
  }

  return null;
}

