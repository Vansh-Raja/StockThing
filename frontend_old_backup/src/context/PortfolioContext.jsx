import { createContext, useContext, useState, useMemo } from 'react';
import { mockData, mockCurrentPrices } from '../data/mockData';
import { aggregatePortfolio, calculatePortfolioSummary } from '../utils/portfolioUtils';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const [data, setData] = useState(mockData);
  const [currentPrices, setCurrentPrices] = useState(mockCurrentPrices);

  // Get all entities
  const users = data.users;
  const families = data.families;
  const familyMembers = data.family_members;
  const accounts = data.accounts;
  const stocks = data.stocks;
  const transactions = data.transactions;

  // Get current family (for now, use first family)
  const currentFamily = families[0];

  // Get accounts for current family
  const familyAccounts = useMemo(() => {
    return accounts.filter(acc => acc.family_id === currentFamily?.id);
  }, [accounts, currentFamily]);

  // Aggregate portfolio holdings
  const portfolioHoldings = useMemo(() => {
    return aggregatePortfolio(transactions, stocks, accounts, currentPrices);
  }, [transactions, stocks, accounts, currentPrices]);

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    return calculatePortfolioSummary(portfolioHoldings);
  }, [portfolioHoldings]);

  // Get transactions with enriched data
  const enrichedTransactions = useMemo(() => {
    return transactions.map(transaction => {
      const stock = stocks.find(s => s.id === transaction.stock_id);
      const account = accounts.find(a => a.id === transaction.account_id);
      return {
        ...transaction,
        stock,
        account
      };
    }).sort((a, b) => 
      new Date(b.transaction_date) - new Date(a.transaction_date)
    );
  }, [transactions, stocks, accounts]);

  // Add transaction
  const addTransaction = (transactionData) => {
    const newTransaction = {
      id: transactions.length + 1,
      ...transactionData,
      created_at: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction]
    }));
  };

  // Delete transaction
  const deleteTransaction = (transactionId) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== transactionId)
    }));
  };

  // Update transaction
  const updateTransaction = (transactionId, updates) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === transactionId ? { ...t, ...updates } : t
      )
    }));
  };

  // Get stock by symbol
  const getStockBySymbol = (symbol) => {
    return stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
  };

  // Get account by id
  const getAccountById = (accountId) => {
    return accounts.find(a => a.id === accountId);
  };

  const value = {
    // Data
    users,
    families,
    familyMembers,
    accounts: familyAccounts,
    stocks,
    transactions: enrichedTransactions,
    portfolioHoldings,
    portfolioSummary,
    currentPrices,
    
    // Actions
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getStockBySymbol,
    getAccountById,
    
    // Current selection
    currentFamily
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

