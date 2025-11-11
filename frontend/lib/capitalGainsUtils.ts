import { mockData } from './mockData';
import type { Transaction, Stock, Account } from './mockData';
import { formatCurrency } from './portfolioUtils';

export interface CapitalGain {
  id: number;
  stock_id: number;
  account_id: number;
  stock?: Stock;
  account?: Account;
  buy_date: string;
  sell_date: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  capital_gain: number;
  capital_gain_percent: number;
  holding_period: number;
  is_long_term: boolean;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function calculateCapitalGains(): CapitalGain[] {
  const transactions = mockData.transactions;
  const stocks = mockData.stocks;
  const accounts = mockData.accounts;

  // Get all sell transactions
  const sellTransactions = transactions
    .filter(t => t.transaction_type === 'sell')
    .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

  const capitalGains: CapitalGain[] = [];
  const buyQueue: Record<string, Transaction[]> = {};

  // Initialize buy queue for each stock-account combination
  transactions
    .filter(t => t.transaction_type === 'buy')
    .forEach(buy => {
      const key = `${buy.stock_id}-${buy.account_id}`;
      if (!buyQueue[key]) {
        buyQueue[key] = [];
      }
      buyQueue[key].push(buy);
    });

  // Sort buy transactions by date (FIFO)
  Object.keys(buyQueue).forEach(key => {
    buyQueue[key].sort((a, b) => 
      new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );
  });

  // Process each sell transaction
  sellTransactions.forEach((sell, index) => {
    const key = `${sell.stock_id}-${sell.account_id}`;
    const buys = buyQueue[key] || [];
    
    let remainingQuantity = sell.quantity;
    let sellProcessed = 0;

    // Match with buy transactions (FIFO)
    for (const buy of buys) {
      if (remainingQuantity <= 0) break;
      if (buy.quantity <= 0) continue;

      const quantityToMatch = Math.min(remainingQuantity, buy.quantity);
      const buyDate = new Date(buy.transaction_date);
      const sellDate = new Date(sell.transaction_date);
      const holdingPeriod = Math.floor((sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
      const isLongTerm = holdingPeriod >= 365;

      const capitalGain = (sell.price - buy.price) * quantityToMatch;
      const capitalGainPercent = buy.price > 0 ? ((sell.price - buy.price) / buy.price) * 100 : 0;

      capitalGains.push({
        id: capitalGains.length + 1,
        stock_id: sell.stock_id,
        account_id: sell.account_id,
        stock: stocks.find(s => s.id === sell.stock_id),
        account: accounts.find(a => a.id === sell.account_id),
        buy_date: buy.transaction_date,
        sell_date: sell.transaction_date,
        quantity: quantityToMatch,
        buy_price: buy.price,
        sell_price: sell.price,
        capital_gain: capitalGain,
        capital_gain_percent: capitalGainPercent,
        holding_period: holdingPeriod,
        is_long_term: isLongTerm
      });

      buy.quantity -= quantityToMatch;
      remainingQuantity -= quantityToMatch;
      sellProcessed += quantityToMatch;
    }
  });

  return capitalGains;
}

export function getCapitalGainsSummary(gains: CapitalGain[]) {
  const totalGain = gains.reduce((sum, g) => sum + g.capital_gain, 0);
  const shortTermGains = gains
    .filter(g => !g.is_long_term)
    .reduce((sum, g) => sum + g.capital_gain, 0);
  const longTermGains = gains
    .filter(g => g.is_long_term)
    .reduce((sum, g) => sum + g.capital_gain, 0);

  return {
    totalGain,
    shortTermGains,
    longTermGains
  };
}

export function exportToCSV(gains: CapitalGain[]) {
  const headers = ['Stock', 'Account', 'Buy Date', 'Sell Date', 'Quantity', 'Buy Price', 'Sell Price', 'Capital Gain', 'Holding Period', 'Type'];
  const rows = gains.map(g => [
    g.stock?.symbol || '',
    g.account?.account_name || '',
    formatDate(g.buy_date),
    formatDate(g.sell_date),
    g.quantity.toString(),
    g.buy_price.toString(),
    g.sell_price.toString(),
    g.capital_gain.toString(),
    `${g.holding_period} days`,
    g.is_long_term ? 'Long-term' : 'Short-term'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `capital-gains-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

