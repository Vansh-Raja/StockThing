import AccountPill from './AccountPill';
import { formatCurrency, formatIndianNumber } from '../utils/portfolioUtils';

export default function PortfolioCard({ holding }) {
  const {
    symbol,
    name,
    exchange,
    sector,
    total_quantity,
    account_breakdown,
    avg_purchase_price,
    current_price,
    total_invested,
    current_value,
    unrealized_gain,
    unrealized_gain_percent,
    day_change_percent
  } = holding;

  const isGain = unrealized_gain >= 0;
  const isDayGain = parseFloat(day_change_percent) >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-xl font-bold text-gray-900">{symbol}</h3>
            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-md">
              {exchange}
            </span>
            {sector && (
              <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-md">
                {sector}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(current_price)}
          </p>
          <p className={`text-sm font-semibold ${isDayGain ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isDayGain ? '+' : ''}{day_change_percent}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Quantity</p>
          <p className="text-lg font-bold text-gray-900">{total_quantity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Avg Purchase Price</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(avg_purchase_price)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Invested</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(total_invested)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Value</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(current_value)}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">Unrealized Gain/Loss</p>
          <div className="text-right">
            <p className={`text-xl font-bold ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isGain ? '+' : ''}{formatCurrency(unrealized_gain)}
            </p>
            <p className={`text-sm font-semibold ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isGain ? '+' : ''}{unrealized_gain_percent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Account Breakdown</p>
        <div className="flex flex-wrap gap-2">
          {account_breakdown.map((account, index) => {
            const percentage = (account.quantity / total_quantity) * 100;
            return (
              <AccountPill
                key={index}
                accountName={account.account_name}
                quantity={account.quantity}
                percentage={percentage}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

