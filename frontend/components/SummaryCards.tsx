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
      accentColor: 'border-l-indigo-500'
    },
    {
      title: 'Total Invested',
      value: formatCurrency(summary.total_invested),
      subtitle: 'Total amount invested',
      accentColor: 'border-l-blue-500'
    },
    {
      title: 'Unrealized Gain/Loss',
      value: formatCurrency(summary.unrealized_gain),
      valuePercent: `${summary.unrealized_gain_percent >= 0 ? '+' : ''}${summary.unrealized_gain_percent.toFixed(2)}%`,
      subtitle: 'Unrealized profit/loss',
      accentColor: summary.unrealized_gain >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500',
      valueColor: summary.unrealized_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
    },
    {
      title: 'Holdings',
      value: summary.total_holdings.toString(),
      subtitle: 'Number of stocks',
      accentColor: 'border-l-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-lg border-l-4 ${card.accentColor} border-t border-r border-b border-gray-200 p-5 hover:shadow-sm transition-shadow`}
        >
          <div className="flex flex-col h-full">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">{card.title}</p>
            <div className="flex-1 flex flex-col justify-center min-h-[72px]">
              <p className={`text-2xl font-semibold leading-tight ${card.valueColor || 'text-gray-900'}`}>
                {card.value}
              </p>
              {card.valuePercent && (
                <p className={`text-sm font-medium mt-1.5 ${card.valueColor || 'text-gray-600'}`}>
                  {card.valuePercent}
                </p>
              )}
              {!card.valuePercent && <div className="h-5"></div>}
            </div>
            <p className="text-xs text-gray-400 mt-3">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

