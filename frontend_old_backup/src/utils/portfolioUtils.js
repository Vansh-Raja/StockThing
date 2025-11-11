/**
 * Format Indian currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with Indian number system (lakhs/crores)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatIndianNumber = (num) => {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  }
  return num.toLocaleString('en-IN');
};

/**
 * Calculate weighted average purchase price for a stock
 * @param {Array} transactions - Array of buy transactions
 * @returns {number} Weighted average price
 */
export const calculateWeightedAveragePrice = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  const buyTransactions = transactions.filter(t => t.transaction_type === 'buy');
  if (buyTransactions.length === 0) return 0;

  let totalCost = 0;
  let totalQuantity = 0;

  buyTransactions.forEach(transaction => {
    totalCost += transaction.price * transaction.quantity;
    totalQuantity += transaction.quantity;
  });

  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
};

/**
 * Calculate total invested value for a stock
 * @param {Array} transactions - Array of buy transactions
 * @returns {number} Total invested value
 */
export const calculateTotalInvested = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  const buyTransactions = transactions.filter(t => t.transaction_type === 'buy');
  return buyTransactions.reduce((sum, t) => sum + (t.price * t.quantity), 0);
};

/**
 * Calculate current holdings quantity for a stock
 * @param {Array} transactions - Array of transactions
 * @returns {number} Current quantity held
 */
export const calculateCurrentQuantity = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  return transactions.reduce((quantity, transaction) => {
    if (transaction.transaction_type === 'buy') {
      return quantity + transaction.quantity;
    } else {
      return quantity - transaction.quantity;
    }
  }, 0);
};

/**
 * Aggregate portfolio holdings by stock
 * @param {Array} transactions - All transactions
 * @param {Array} stocks - All stocks
 * @param {Array} accounts - All accounts
 * @param {Object} currentPrices - Object mapping stock_id to current price
 * @returns {Array} Aggregated portfolio holdings
 */
export const aggregatePortfolio = (transactions, stocks, accounts, currentPrices = {}) => {
  if (!transactions || transactions.length === 0) return [];

  // Group transactions by stock_id
  const stockGroups = {};
  
  transactions.forEach(transaction => {
    const stockId = transaction.stock_id;
    if (!stockGroups[stockId]) {
      stockGroups[stockId] = [];
    }
    stockGroups[stockId].push(transaction);
  });

  // Calculate holdings for each stock
  const holdings = Object.keys(stockGroups).map(stockId => {
    const stockTransactions = stockGroups[stockId];
    const stock = stocks.find(s => s.id === parseInt(stockId));
    if (!stock) return null;

    const currentQuantity = calculateCurrentQuantity(stockTransactions);
    if (currentQuantity <= 0) return null; // Skip stocks with no holdings

    const buyTransactions = stockTransactions.filter(t => t.transaction_type === 'buy');
    const avgPrice = calculateWeightedAveragePrice(buyTransactions);
    const totalInvested = calculateTotalInvested(buyTransactions);
    const currentPrice = currentPrices[stockId] || avgPrice;
    const currentValue = currentQuantity * currentPrice;
    const unrealizedGain = currentValue - totalInvested;
    const unrealizedGainPercent = totalInvested > 0 
      ? (unrealizedGain / totalInvested) * 100 
      : 0;

    // Calculate account breakdown
    const accountBreakdown = {};
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

    // Filter out accounts with zero or negative quantities
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
      day_change_percent: (Math.random() * 4 - 2).toFixed(2) // Mock day change
    };
  }).filter(Boolean);

  return holdings;
};

/**
 * Calculate portfolio summary statistics
 * @param {Array} holdings - Aggregated portfolio holdings
 * @returns {Object} Summary statistics
 */
export const calculatePortfolioSummary = (holdings) => {
  if (!holdings || holdings.length === 0) {
    return {
      total_value: 0,
      total_invested: 0,
      total_unrealized_gain: 0,
      total_unrealized_gain_percent: 0,
      num_holdings: 0,
      top_gainers: [],
      top_losers: []
    };
  }

  const total_value = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const total_invested = holdings.reduce((sum, h) => sum + h.total_invested, 0);
  const total_unrealized_gain = total_value - total_invested;
  const total_unrealized_gain_percent = total_invested > 0 
    ? (total_unrealized_gain / total_invested) * 100 
    : 0;

  const sortedByGain = [...holdings].sort(
    (a, b) => b.unrealized_gain_percent - a.unrealized_gain_percent
  );

  return {
    total_value,
    total_invested,
    total_unrealized_gain,
    total_unrealized_gain_percent,
    num_holdings: holdings.length,
    top_gainers: sortedByGain.slice(0, 3),
    top_losers: sortedByGain.slice(-3).reverse()
  };
};

