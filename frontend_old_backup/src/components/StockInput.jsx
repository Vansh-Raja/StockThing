import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export default function StockInput({ value, onChange, label, required = false }) {
  const { stocks } = usePortfolio();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value.toUpperCase();
    onChange(inputValue);

    if (inputValue.length > 0) {
      const filtered = stocks.filter(
        stock => stock.symbol.toUpperCase().includes(inputValue) ||
                 stock.name.toUpperCase().includes(inputValue)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (stock) => {
    onChange(stock.symbol);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => value && setShowSuggestions(true)}
        onBlur={handleBlur}
        placeholder="Enter stock symbol (e.g., RELIANCE, TCS)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        required={required}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {suggestions.map((stock) => (
            <div
              key={stock.id}
              onClick={() => handleSelect(stock)}
              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="font-semibold text-gray-900">{stock.symbol}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stock.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

