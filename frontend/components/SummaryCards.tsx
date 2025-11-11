'use client';

import { formatCurrency } from '@/lib/portfolioUtils';
import type { PortfolioSummary } from '@/lib/portfolioUtils';

interface SummaryCardsProps {
  summary: PortfolioSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Value',
      value: formatCurrency(summary.total_value),
      subtitle: 'Current portfolio value',
      color: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Total Invested',
      value: formatCurrency(summary.total_invested),
      subtitle: 'Total amount invested',
      color: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Unrealized Gain/Loss',
      value: formatCurrency(summary.unrealized_gain),
      valuePercent: `${summary.unrealized_gain_percent >= 0 ? '+' : ''}${summary.unrealized_gain_percent.toFixed(2)}%`,
      subtitle: 'Unrealized profit/loss',
      color: summary.unrealized_gain >= 0 ? 'bg-emerald-100' : 'bg-rose-100',
      textColor: summary.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
    },
    {
      title: 'Holdings',
      value: summary.total_holdings.toString(),
      subtitle: 'Number of stocks',
      color: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor || 'text-gray-900'}`}>
                {card.value}
              </p>
              {card.valuePercent && (
                <p className={`text-sm font-semibold mt-1 ${card.textColor}`}>
                  {card.valuePercent}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">{card.subtitle}</p>
            </div>
            <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-sm`}>
              <div className="w-6 h-6 bg-white rounded-lg opacity-30"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

