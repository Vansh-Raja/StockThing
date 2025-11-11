'use client';

import { useState, useEffect } from 'react';
import { mockData } from '@/lib/mockData';

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
}

interface StockSearchProps {
  onSelect: (stock: Stock) => void;
  selectedStock?: Stock | null;
}

export default function StockSearch({ onSelect, selectedStock }: StockSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Mock stock search - in production, this would call yfinance API
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const matchedStocks = mockData.stocks
        .filter(stock => 
          stock.symbol.toLowerCase().includes(term) ||
          stock.name.toLowerCase().includes(term)
        )
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          exchange: stock.exchange
        }))
        .slice(0, 10); // Limit to 10 results
      
      setResults(matchedStocks);
      setIsOpen(matchedStocks.length > 0);
      setIsSearching(false);
    }, 300);
  }, [searchTerm]);

  const handleSelect = (stock: Stock) => {
    setSearchTerm(`${stock.symbol} - ${stock.name}`);
    setIsOpen(false);
    onSelect(stock);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Share
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onSelect(null as any);
            }
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Enter share name or symbol (e.g., RELIANCE, TCS)"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((stock, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(stock)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-semibold text-gray-900">{stock.symbol}</div>
              <div className="text-sm text-gray-500">{stock.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stock.exchange}</div>
            </button>
          ))}
        </div>
      )}

      {selectedStock && (
        <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="text-sm font-semibold text-indigo-900">
            Selected: {selectedStock.symbol}
          </div>
          <div className="text-xs text-indigo-700 mt-0.5">
            {selectedStock.name} ({selectedStock.exchange})
          </div>
        </div>
      )}
    </div>
  );
}

