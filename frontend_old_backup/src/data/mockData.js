// SQLite-compatible mock data structure
// This mirrors the database schema for easy backend integration

export const mockData = {
  users: [
    {
      id: 1,
      username: "rahul",
      email: "rahul@example.com",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      username: "amit",
      email: "amit@example.com",
      created_at: "2024-01-01T00:00:00Z"
    }
  ],
  families: [
    {
      id: 1,
      name: "Family Portfolio",
      created_at: "2024-01-01T00:00:00Z"
    }
  ],
  family_members: [
    {
      id: 1,
      family_id: 1,
      user_id: 1,
      role: "owner"
    },
    {
      id: 2,
      family_id: 1,
      user_id: 2,
      role: "member"
    }
  ],
  accounts: [
    {
      id: 1,
      user_id: 1,
      family_id: 1,
      account_name: "Rahul",
      account_type: "individual",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      user_id: 2,
      family_id: 1,
      account_name: "Amit",
      account_type: "individual",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 3,
      user_id: 2,
      family_id: 1,
      account_name: "Amit HUF",
      account_type: "HUF",
      created_at: "2024-01-01T00:00:00Z"
    }
  ],
  stocks: [
    {
      id: 1,
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
      exchange: "NSE",
      sector: "Energy",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      symbol: "TCS",
      name: "Tata Consultancy Services",
      exchange: "NSE",
      sector: "IT",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 3,
      symbol: "INFY",
      name: "Infosys Ltd",
      exchange: "NSE",
      sector: "IT",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 4,
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd",
      exchange: "NSE",
      sector: "Banking",
      created_at: "2024-01-01T00:00:00Z"
    }
  ],
  transactions: [
    {
      id: 1,
      account_id: 1,
      stock_id: 1,
      transaction_type: "buy",
      quantity: 500,
      price: 2500.00,
      transaction_date: "2024-01-15T10:30:00Z",
      notes: "",
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      account_id: 2,
      stock_id: 1,
      transaction_type: "buy",
      quantity: 250,
      price: 2480.00,
      transaction_date: "2024-01-20T14:20:00Z",
      notes: "",
      created_at: "2024-01-20T14:20:00Z"
    },
    {
      id: 3,
      account_id: 3,
      stock_id: 1,
      transaction_type: "buy",
      quantity: 1000,
      price: 2520.00,
      transaction_date: "2024-02-01T09:15:00Z",
      notes: "",
      created_at: "2024-02-01T09:15:00Z"
    },
    {
      id: 4,
      account_id: 1,
      stock_id: 2,
      transaction_type: "buy",
      quantity: 100,
      price: 3500.00,
      transaction_date: "2024-01-10T11:00:00Z",
      notes: "",
      created_at: "2024-01-10T11:00:00Z"
    },
    {
      id: 5,
      account_id: 2,
      stock_id: 2,
      transaction_type: "buy",
      quantity: 50,
      price: 3480.00,
      transaction_date: "2024-01-25T15:30:00Z",
      notes: "",
      created_at: "2024-01-25T15:30:00Z"
    },
    {
      id: 6,
      account_id: 1,
      stock_id: 3,
      transaction_type: "buy",
      quantity: 200,
      price: 1500.00,
      transaction_date: "2024-02-05T10:00:00Z",
      notes: "",
      created_at: "2024-02-05T10:00:00Z"
    },
    {
      id: 7,
      account_id: 1,
      stock_id: 2,
      transaction_type: "sell",
      quantity: 30,
      price: 3600.00,
      transaction_date: "2024-02-10T14:00:00Z",
      notes: "",
      created_at: "2024-02-10T14:00:00Z"
    }
  ]
};

// Mock current prices (will be replaced with yfinance later)
export const mockCurrentPrices = {
  1: 2580.00, // RELIANCE
  2: 3650.00, // TCS
  3: 1520.00, // INFY
  4: 1650.00  // HDFCBANK
};

