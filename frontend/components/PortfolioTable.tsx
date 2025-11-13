'use client';

import { formatCurrency } from '@/lib/portfolioUtils';
import type { PortfolioHolding, AccountHolding } from '@/lib/portfolioUtils';
import { useState, Fragment, useMemo } from 'react';
import SellShareModal from './SellShareModal';

interface DateHolding {
  transaction_id: number;
  purchase_date: string;
  stock_id: number;
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  account_id: number;
  account_name: string;
  account_type: string;
  purchase_quantity: number;
  remaining_quantity: number;
  purchase_price: number;
  current_price: number;
  invested_value: number;
  current_value: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
}

interface PortfolioTableProps {
  holdings?: PortfolioHolding[];
  accountHoldings?: AccountHolding[];
  dateHoldings?: DateHolding[];
  mode: 'scrip' | 'head' | 'date';
  onRefresh?: () => void;
}

export default function PortfolioTable({ holdings, accountHoldings, dateHoldings, mode, onRefresh }: PortfolioTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number | string>>(new Set());
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<PortfolioHolding | null>(null);
  const [prefillAccountId, setPrefillAccountId] = useState<number | undefined>(undefined);
  const [prefillQuantity, setPrefillQuantity] = useState<number | undefined>(undefined);
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleRow = (id: number | string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSellClick = (e: React.MouseEvent, holding: PortfolioHolding, accountId?: number, quantity?: number) => {
    e.stopPropagation(); // Prevent row click
    setSelectedStock(holding);
    setPrefillAccountId(accountId);
    setPrefillQuantity(quantity);
    setSellModalOpen(true);
  };

  const handleSellSuccess = () => {
    setPrefillAccountId(undefined);
    setPrefillQuantity(undefined);
    if (onRefresh) {
      onRefresh();
    }
  };

  const sortedDateHoldings = useMemo(() => {
    if (!dateHoldings || mode !== 'date') return [];
    
    const sorted = [...dateHoldings];
    sorted.sort((a, b) => {
      const dateA = new Date(a.purchase_date).getTime();
      const dateB = new Date(b.purchase_date).getTime();
      return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [dateHoldings, dateSortOrder, mode]);

  const toggleDateSort = () => {
    setDateSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
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
                          className="text-gray-400 hover:text-gray-600 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
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
                            className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-full transition-all duration-200 hover:shadow-md hover:shadow-rose-500/30 active:scale-95"
                            title="Sell shares"
                          >
                            Sell
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => handleSellClick(e, holding, account.account_id, account.quantity)}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-full transition-all duration-200 hover:shadow-md hover:shadow-rose-500/30 active:scale-95"
                              title="Sell shares"
                            >
                              Sell
                            </button>
                          </div>
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
      {selectedStock && (
        <SellShareModal
          isOpen={sellModalOpen}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedStock(null);
            setPrefillAccountId(undefined);
            setPrefillQuantity(undefined);
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
          prefillAccountId={prefillAccountId}
          prefillQuantity={prefillQuantity}
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
                                  handleSellClick(e, stockHolding, account.account_id, stock.quantity);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-full transition-all duration-200 hover:shadow-md hover:shadow-rose-500/30 active:scale-95"
                                title="Sell shares"
                              >
                                Sell
                              </button>
                              <button
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
            setPrefillAccountId(undefined);
            setPrefillQuantity(undefined);
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
          prefillAccountId={prefillAccountId}
          prefillQuantity={prefillQuantity}
        />
      )}
    </>
    );
  }

  if (mode === 'date' && dateHoldings) {
    if (dateHoldings.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No holdings match your filters.</p>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Purchase Date View</h3>
            <button
              onClick={toggleDateSort}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95 flex items-center gap-2"
              title={`Sort by date ${dateSortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              <svg 
                className={`w-4 h-4 transition-transform ${dateSortOrder === 'desc' ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {dateSortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Purchase Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Account</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Quantity</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Purchase Price</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">CMP</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Invested</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Current</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Profit</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDateHoldings.map((holding) => {
                  const purchaseDate = new Date(holding.purchase_date);
                  const formattedDate = purchaseDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  
                  // Create a PortfolioHolding-like object for the modal
                  const stockHolding: PortfolioHolding = {
                    stock_id: holding.stock_id,
                    symbol: holding.symbol,
                    name: holding.name,
                    exchange: holding.exchange,
                    sector: holding.sector,
                    total_quantity: holding.remaining_quantity,
                    account_breakdown: [{
                      account_id: holding.account_id,
                      account_name: holding.account_name,
                      account_type: holding.account_type,
                      quantity: holding.remaining_quantity
                    }],
                    avg_purchase_price: holding.purchase_price,
                    current_price: holding.current_price,
                    total_invested: holding.invested_value,
                    current_value: holding.current_value,
                    unrealized_gain: holding.unrealized_gain,
                    unrealized_gain_percent: holding.unrealized_gain_percent,
                    day_change_percent: '0.00'
                  };
                  
                  return (
                    <tr key={holding.transaction_id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
                        <div className="text-xs text-gray-500">
                          {purchaseDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-semibold text-gray-900">{holding.symbol}</div>
                        <div className="text-xs text-gray-500">{holding.name}</div>
                        <div className="text-xs text-gray-400">{holding.exchange}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{holding.account_name}</div>
                        <div className="text-xs text-gray-500">{holding.account_type}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {holding.remaining_quantity}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                        {formatCurrency(holding.purchase_price)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(holding.current_price)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                        {formatCurrency(holding.invested_value)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(holding.current_value)}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-right text-sm font-semibold ${
                        holding.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {holding.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(holding.unrealized_gain)}
                        <div className="text-xs font-normal">
                          ({holding.unrealized_gain >= 0 ? '+' : ''}{holding.unrealized_gain_percent.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => handleSellClick(e, stockHolding, holding.account_id, holding.remaining_quantity)}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-full transition-all duration-200 hover:shadow-md hover:shadow-rose-500/30 active:scale-95"
                            title="Sell shares"
                          >
                            Sell
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="More options"
                            disabled
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
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
              setPrefillAccountId(undefined);
              setPrefillQuantity(undefined);
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
            prefillAccountId={prefillAccountId}
            prefillQuantity={prefillQuantity}
          />
        )}
      </>
    );
  }

  return null;
}

