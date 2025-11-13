'use client';

import { useState, useEffect, useRef } from 'react';
import { stockAPI } from '@/lib/api';

interface Stock {
  id?: number;
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  current_price?: number;
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
  const [isSelected, setIsSelected] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset selection when selectedStock prop changes externally
  useEffect(() => {
    if (selectedStock) {
      setSearchTerm(`${selectedStock.symbol} - ${selectedStock.name}`);
      setIsSelected(true);
      setIsOpen(false);
    } else {
      setIsSelected(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel previous API request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search if a stock is already selected (unless user is typing new search)
    if (isSelected && searchTerm.includes(' - ')) {
      return;
    }

    // Don't search if query is too short
    if (searchTerm.length < 1) {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
      setShowNotFound(false);
      return;
    }

    // Debounce API call - wait 300ms after user stops typing
    setIsSearching(true);
    debounceTimerRef.current = setTimeout(() => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      stockAPI.search(searchTerm, 'NSE', abortControllerRef.current.signal)
        .then((data: { stocks: Stock[] }) => {
          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }
          
          const stocks = data.stocks || [];
          setResults(stocks);
          setIsOpen(stocks.length > 0);
          setIsSearching(false);
          // Show not found message if no results and search term is valid
          setShowNotFound(stocks.length === 0 && searchTerm.length >= 1 && !searchTerm.includes(' - '));
        })
        .catch((error) => {
          // Ignore abort errors
          if (error.name === 'AbortError') {
            return;
          }
          console.error('Stock search error:', error);
          setResults([]);
          setIsOpen(false);
          setIsSearching(false);
          // Show not found on error if search term is valid
          setShowNotFound(searchTerm.length >= 1 && !searchTerm.includes(' - '));
        });
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchTerm, isSelected]);

  const handleSelect = (stock: Stock) => {
    setIsSelected(true);
    setSearchTerm(`${stock.symbol} - ${stock.name}`);
    setIsOpen(false);
    setResults([]); // Clear results to prevent re-fetching
    setShowNotFound(false); // Hide not found message
    onSelect(stock);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Hide not found message when user starts typing
    setShowNotFound(false);
    
    // If user clears the selection format, reset selection state
    if (!value.includes(' - ')) {
      setIsSelected(false);
    }
    
    // If input is cleared, clear selection
    if (!value) {
      setIsSelected(false);
      onSelect(null as any);
      setResults([]);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
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
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            // Delay closing dropdown to allow click on results
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder="Enter stock symbol (e.g., RELIANCE, TCS, HDFCBANK)"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span className="text-xs text-gray-500">Fetching...</span>
          </div>
        )}
      </div>

      {/* Not found indicator - minimal and simple */}
      {showNotFound && !isSearching && !isSelected && (
        <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
          <span>Stock not found</span>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((stock, index) => (
            <button
              key={stock.id || index}
              type="button"
              onClick={() => handleSelect(stock)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{stock.symbol}</div>
                  <div className="text-sm text-gray-500">{stock.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{stock.exchange}</span>
                    {stock.sector && (
                      <>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{stock.sector}</span>
                      </>
                    )}
                  </div>
                </div>
                {stock.current_price !== undefined && stock.current_price !== null && (
                  <div className="ml-4 text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{stock.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedStock && (
        <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-semibold text-indigo-900">
                Selected: {selectedStock.symbol}
              </div>
              <div className="text-xs text-indigo-700 mt-0.5">
                {selectedStock.name} ({selectedStock.exchange})
              </div>
            </div>
            {selectedStock.current_price !== undefined && selectedStock.current_price !== null && (
              <div className="ml-4 text-right">
                <div className="text-xs text-indigo-600 mb-0.5">Current Price</div>
                <div className="text-sm font-semibold text-indigo-900">
                  ₹{selectedStock.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

