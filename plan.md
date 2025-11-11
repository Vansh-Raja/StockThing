# Stock Portfolio MVP Frontend Plan

## Project Overview

Build an MVP frontend mock website for tracking Indian stock portfolios with family/group support. This is a Next.js application with SQLite-compatible mock data, focusing on UI/UX before backend integration.

## Project Structure

```
StockThing/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Transactions page (home)
│   │   ├── portfolio/         # Portfolio page
│   │   └── capital-gains/    # Capital Gains page
│   ├── components/            # React components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── TransactionsPage.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── PortfolioPage.tsx
│   │   ├── PortfolioTable.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── AccountPill.tsx
│   │   ├── CapitalGainsPage.tsx
│   │   └── StockSearch.tsx
│   ├── lib/                   # Utilities and data
│   │   ├── mockData.ts        # SQLite-compatible mock data
│   │   ├── portfolioUtils.ts  # Portfolio calculations
│   │   └── capitalGainsUtils.ts
│   ├── public/                # Static assets
│   ├── package.json
│   └── next.config.ts
├── backend/                   # Placeholder for future Flask backend
├── plan.md                    # Project plan document
├── AGENTS.md                  # Codebase rules and guidelines
├── DEPLOYMENT.md              # Deployment instructions
└── .github/
    └── workflows/
        └── deploy.yml        # GitHub Actions deployment
```

## MVP Frontend Features

### 1. Navigation & Layout

- Header with navigation menu (Transactions, Portfolio, Capital Gains)
- Family/Group selector in header
- Responsive design (mobile-first)
- Clean, minimalistic Tailwind CSS styling

### 2. Transactions Page (`/` - Landing Page)

**Primary entry point for the application**

- **Add Share Form:**
  - Stock search with autocomplete (mock, will use yfinance later)
  - Account selector dropdown (family member + account name)
  - Quantity input (number)
  - Price per share input (number)
  - Date/Time picker (defaults to current date/time, editable)
  - Notes field (optional)
  - Submit button
  - Form validation

- **Recent Transactions List:**
  - Table view of recent transactions
  - Columns: Date/Time, Type (Buy/Sell), Stock, Account, Quantity, Price, Total Value
  - Sorted by date (newest first)
  - Responsive table with horizontal scroll

### 3. Portfolio/Dashboard Page (`/portfolio`)

**Main portfolio view with two toggleable views**

- **Scrip View** (default):
  - Shows all stocks grouped by symbol
  - Expandable rows showing account breakdown
  - Columns: Stock, Quantity, Cost Rate, Cost Rs., CMP, Current Value, Profit
  - Each stock row can be expanded to show account-level details

- **Head View**:
  - Shows all accounts grouped by account holder
  - Expandable rows showing stock holdings per account
  - Columns: Account, Quantity, Cost Rate, Cost Rs., CMP, Current Value, Profit
  - Each account row can be expanded to show stock-level details

- **Portfolio Summary Cards:**
  - Total Portfolio Value
  - Total Invested Amount
  - Total Unrealized Gain/Loss (with percentage)
  - Number of Holdings

- **Filters:**
  - Search by stock symbol or name
  - Filter by account
  - Toggle between Scrip View and Head View

### 4. Capital Gains Statement Page (`/capital-gains`)

- **Summary Cards:**
  - Total Capital Gains
  - Short-term Gains
  - Long-term Gains

- **Filters:**
  - Account selector
  - Stock selector
  - Date range (From Date, To Date)
  - Export to CSV button

- **Statement Table:**
  - Stock symbol and name
  - Account
  - Buy date
  - Sell date
  - Quantity
  - Buy price
  - Sell price
  - Capital gain/loss (absolute and percentage)
  - Holding period (days)
  - Type (Short-term/Long-term)

- **FIFO Matching Logic:**
  - Matches sell transactions with buy transactions using FIFO (First In First Out)
  - Calculates holding period (365 days threshold for long-term)
  - Groups by stock and account

### 5. SQLite-Compatible Mock Data Structure

**Database Schema (for future backend):**

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Families/Groups table
CREATE TABLE families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family members (many-to-many relationship)
CREATE TABLE family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Accounts table
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    family_id INTEGER,
    account_name TEXT NOT NULL,
    account_type TEXT DEFAULT 'individual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (family_id) REFERENCES families(id)
);

-- Stocks table (master data)
CREATE TABLE stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    exchange TEXT DEFAULT 'NSE',
    sector TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('buy', 'sell')),
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK(price > 0),
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);
```

**Portfolio Aggregation Logic:**
- Group transactions by stock_id (Scrip View) or account_id (Head View)
- Calculate total quantity per stock/account
- Calculate weighted average purchase price
- Show account/stock breakdown with quantities and percentages
- Calculate unrealized gains/losses (uses mock current prices, will use yfinance later)

## Technology Stack

### Frontend

- **Next.js 16** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Bun** - Package manager and runtime
- **React 19** - UI library

### Future Backend (not in MVP)

- Flask (Python)
- SQLite (primary database)
- yfinance for stock prices (Indian market: NSE/BSE)
- REST API
- SQLAlchemy for ORM

## Implementation Status

✅ **Completed:**
- Next.js project setup with TypeScript
- Base layout with overflow handling
- Mock data structure (SQLite-compatible)
- Transactions page with stock search
- Portfolio page with Scrip View and Head View (toggleable)
- Capital Gains page with FIFO matching
- Responsive design
- No horizontal overflow issues

🔄 **In Progress:**
- Backend integration (future)

## Key Files

### Pages
- `frontend/app/page.tsx` - Transactions page (home)
- `frontend/app/portfolio/page.tsx` - Portfolio page
- `frontend/app/capital-gains/page.tsx` - Capital Gains page
- `frontend/app/layout.tsx` - Root layout

### Components
- `frontend/components/Header.tsx` - Navigation header
- `frontend/components/TransactionsPage.tsx` - Transactions page wrapper
- `frontend/components/TransactionForm.tsx` - Add share form
- `frontend/components/TransactionList.tsx` - Transactions table
- `frontend/components/StockSearch.tsx` - Stock search with autocomplete
- `frontend/components/PortfolioPage.tsx` - Portfolio page wrapper
- `frontend/components/PortfolioTable.tsx` - Portfolio table (Scrip/Head views)
- `frontend/components/SummaryCards.tsx` - Portfolio summary cards
- `frontend/components/AccountPill.tsx` - Account indicator pill
- `frontend/components/CapitalGainsPage.tsx` - Capital Gains page wrapper

### Utilities & Data
- `frontend/lib/mockData.ts` - SQLite-compatible mock data
- `frontend/lib/portfolioUtils.ts` - Portfolio aggregation and calculations
- `frontend/lib/capitalGainsUtils.ts` - Capital gains calculations (FIFO)

## Design Principles

- **Minimalistic**: Clean, simple UI without clutter
- **Indian Market Focus**: Support NSE/BSE stock symbols, Indian number formatting (lakhs/crores)
- **Family-Centric**: Easy switching between family members, clear account indicators
- **Mobile-First**: Responsive design for all screen sizes
- **Accessible**: Proper semantic HTML and ARIA labels
- **SQLite-Ready**: Mock data structure matches future database schema exactly

## Portfolio Display Information

### Scrip View (Stock Grouped)
Each stock row shows:
- Stock symbol, name, exchange
- Total quantity across all accounts
- Average purchase price (weighted)
- Current market price (mock)
- Current total value
- Unrealized gain/loss
- Expandable to show account breakdown

### Head View (Account Grouped)
Each account row shows:
- Account name and type
- Total quantity across all stocks
- Average cost rate
- Total invested
- Current value
- Unrealized gain/loss
- Expandable to show stock breakdown

## Future Enhancements (Post-MVP)

- Backend integration with Flask
- Real-time stock prices via yfinance (Indian market: NSE/BSE)
- User authentication and authorization
- SQLite database persistence
- Advanced filtering and analytics
- Export to PDF/Excel
- Dark mode
- Notifications for price alerts
- Dividend tracking
- Tax calculation (STCG/LTCG)
- Portfolio performance charts
- Historical portfolio value tracking
- Sell transaction functionality (currently only buy)

## Deployment

- GitHub Actions workflow for automatic deployment
- Deploys to Oracle Cloud Ubuntu server
- Uses PM2 for process management
- See `DEPLOYMENT.md` for detailed instructions
