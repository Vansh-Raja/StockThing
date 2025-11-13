import { mockData, mockCurrentPrices } from './mockData';
import type { Transaction, Stock, Account } from './mockData';

export interface PortfolioHolding {
  stock_id: number;
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  total_quantity: number;
  account_breakdown: Array<{
    account_id: number;
    account_name: string;
    account_type: string;
    quantity: number;
  }>;
  avg_purchase_price: number;
  current_price: number;
  total_invested: number;
  current_value: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
  day_change_percent: string;
}

export interface AccountHolding {
  account_id: number;
  account_name: string;
  account_type: string;
  stocks: Array<{
    stock_id: number;
    symbol: string;
    name: string;
    exchange: string;
    sector?: string;
    quantity: number;
    avg_purchase_price: number;
    current_price: number;
    total_invested: number;
    current_value: number;
    unrealized_gain: number;
    unrealized_gain_percent: number;
  }>;
  total_quantity: number;
  total_invested: number;
  current_value: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
}

export interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  unrealized_gain: number;
  unrealized_gain_percent: number;
  total_holdings: number;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + ' Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(2) + ' L';
  }
  return num.toLocaleString('en-IN');
}

function calculateWeightedAveragePrice(buyTransactions: Transaction[]): number {
  if (buyTransactions.length === 0) return 0;
  
  let totalQuantity = 0;
  let totalValue = 0;
  
  buyTransactions.forEach(t => {
    totalQuantity += t.quantity;
    totalValue += t.quantity * t.price;
  });
  
  return totalQuantity > 0 ? totalValue / totalQuantity : 0;
}

function calculateTotalInvested(buyTransactions: Transaction[]): number {
  return buyTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
}

function calculateCurrentQuantity(transactions: Transaction[]): number {
  return transactions.reduce((quantity, t) => {
    return t.transaction_type === 'buy' 
      ? quantity + t.quantity 
      : quantity - t.quantity;
  }, 0);
}

export function aggregatePortfolio(
  transactions: Transaction[],
  stocks: Stock[],
  accounts: Account[],
  currentPrices: Record<number, number>
): PortfolioHolding[] {
  if (!transactions || transactions.length === 0) return [];

  const stockGroups: Record<number, Transaction[]> = {};

  transactions.forEach(transaction => {
    const stockId = transaction.stock_id;
    if (!stockGroups[stockId]) {
      stockGroups[stockId] = [];
    }
    stockGroups[stockId].push(transaction);
  });

  const holdings: PortfolioHolding[] = Object.keys(stockGroups).map(stockId => {
    const stockTransactions = stockGroups[parseInt(stockId)];
    const stock = stocks.find(s => s.id === parseInt(stockId));
    if (!stock) return null;

    const currentQuantity = calculateCurrentQuantity(stockTransactions);
    if (currentQuantity <= 0) return null;

    const buyTransactions = stockTransactions.filter(t => t.transaction_type === 'buy');
    const avgPrice = calculateWeightedAveragePrice(buyTransactions);
    const totalInvested = calculateTotalInvested(buyTransactions);
    const currentPrice = currentPrices[parseInt(stockId)] || avgPrice;
    const currentValue = currentQuantity * currentPrice;
    const unrealizedGain = currentValue - totalInvested;
    const unrealizedGainPercent = totalInvested > 0
      ? (unrealizedGain / totalInvested) * 100
      : 0;

    const accountBreakdown: Record<string, { account_id: number; account_name: string; account_type: string; quantity: number }> = {};
    
    stockTransactions.forEach(transaction => {
      const account = accounts.find(a => a.id === transaction.account_id);
      if (!account) return;

      const accountKey = account.account_name;
      if (!accountBreakdown[accountKey]) {
        accountBreakdown[accountKey] = {
          account_id: account.id,
          account_name: accountKey,
          account_type: account.account_type,
          quantity: 0
        };
      }

      if (transaction.transaction_type === 'buy') {
        accountBreakdown[accountKey].quantity += transaction.quantity;
      } else {
        accountBreakdown[accountKey].quantity -= transaction.quantity;
      }
    });

    const validBreakdown = Object.values(accountBreakdown).filter(
      acc => acc.quantity > 0
    );

    return {
      stock_id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      sector: stock.sector,
      total_quantity: currentQuantity,
      account_breakdown: validBreakdown,
      avg_purchase_price: avgPrice,
      current_price: currentPrice,
      total_invested: totalInvested,
      current_value: currentValue,
      unrealized_gain: unrealizedGain,
      unrealized_gain_percent: unrealizedGainPercent,
      day_change_percent: '0.00' // Mock value - will be replaced with real data from API
    };
  }).filter((h): h is PortfolioHolding => h !== null);

  return holdings;
}

export function aggregateByAccount(
  transactions: Transaction[],
  stocks: Stock[],
  accounts: Account[],
  currentPrices: Record<number, number>
): AccountHolding[] {
  if (!transactions || transactions.length === 0) return [];

  const accountGroups: Record<number, Record<number, Transaction[]>> = {};

  transactions.forEach(transaction => {
    const accountId = transaction.account_id;
    const stockId = transaction.stock_id;
    
    if (!accountGroups[accountId]) {
      accountGroups[accountId] = {};
    }
    if (!accountGroups[accountId][stockId]) {
      accountGroups[accountId][stockId] = [];
    }
    accountGroups[accountId][stockId].push(transaction);
  });

  const accountHoldings: AccountHolding[] = Object.keys(accountGroups).map(accountId => {
    const account = accounts.find(a => a.id === parseInt(accountId));
    if (!account) return null;

    const stockGroups = accountGroups[parseInt(accountId)];
    const stocks: Array<{
      stock_id: number;
      symbol: string;
      name: string;
      exchange: string;
      sector?: string;
      quantity: number;
      avg_purchase_price: number;
      current_price: number;
      total_invested: number;
      current_value: number;
      unrealized_gain: number;
      unrealized_gain_percent: number;
    }> = [];

    let totalQuantity = 0;
    let totalInvested = 0;
    let currentValue = 0;

    Object.keys(stockGroups).forEach(stockId => {
      const stockTransactions = stockGroups[parseInt(stockId)];
      const stock = mockData.stocks.find(s => s.id === parseInt(stockId));
      if (!stock) return;

      const currentQuantity = calculateCurrentQuantity(stockTransactions);
      if (currentQuantity <= 0) return;

      const buyTransactions = stockTransactions.filter(t => t.transaction_type === 'buy');
      const avgPrice = calculateWeightedAveragePrice(buyTransactions);
      const invested = calculateTotalInvested(buyTransactions);
      const currentPrice = currentPrices[parseInt(stockId)] || avgPrice;
      const value = currentQuantity * currentPrice;
      const unrealizedGain = value - invested;
      const unrealizedGainPercent = invested > 0 ? (unrealizedGain / invested) * 100 : 0;

      stocks.push({
        stock_id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        exchange: stock.exchange,
        sector: stock.sector,
        quantity: currentQuantity,
        avg_purchase_price: avgPrice,
        current_price: currentPrice,
        total_invested: invested,
        current_value: value,
        unrealized_gain: unrealizedGain,
        unrealized_gain_percent: unrealizedGainPercent
      });

      totalQuantity += currentQuantity;
      totalInvested += invested;
      currentValue += value;
    });

    if (stocks.length === 0) return null;

    const unrealizedGain = currentValue - totalInvested;
    const unrealizedGainPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;

    return {
      account_id: account.id,
      account_name: account.account_name,
      account_type: account.account_type,
      stocks,
      total_quantity: totalQuantity,
      total_invested: totalInvested,
      current_value: currentValue,
      unrealized_gain: unrealizedGain,
      unrealized_gain_percent: unrealizedGainPercent
    };
  }).filter((h): h is AccountHolding => h !== null);

  return accountHoldings;
}

export function calculatePortfolioSummary(holdings: PortfolioHolding[]): PortfolioSummary {
  const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.total_invested, 0);
  const unrealizedGain = totalValue - totalInvested;
  const unrealizedGainPercent = totalInvested > 0
    ? (unrealizedGain / totalInvested) * 100
    : 0;

  return {
    total_value: totalValue,
    total_invested: totalInvested,
    unrealized_gain: unrealizedGain,
    unrealized_gain_percent: unrealizedGainPercent,
    total_holdings: holdings.length
  };
}

export function getPortfolioData() {
  const holdings = aggregatePortfolio(
    mockData.transactions,
    mockData.stocks,
    mockData.accounts,
    mockCurrentPrices
  );
  const summary = calculatePortfolioSummary(holdings);
  return { holdings, summary };
}

export function getAccountPortfolioData() {
  const accountHoldings = aggregateByAccount(
    mockData.transactions,
    mockData.stocks,
    mockData.accounts,
    mockCurrentPrices
  );
  return { accountHoldings };
}
