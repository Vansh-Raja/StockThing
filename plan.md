# Stock Portfolio Tracker - Project Plan

## Project Overview

A full-stack application for tracking Indian stock portfolios with family/group support. Built with Next.js frontend and Flask backend, deployed to production with real-time stock prices from yfinance. The application supports multiple accounts, portfolio tracking, and capital gains calculation with FIFO matching.

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
│   │   ├── api.ts            # API client for backend communication
│   │   ├── mockData.ts        # SQLite-compatible mock data (legacy)
│   │   ├── portfolioUtils.ts  # Portfolio calculations (legacy utilities)
│   │   └── capitalGainsUtils.ts  # Capital gains utilities (legacy)
│   ├── public/                # Static assets
│   ├── package.json
│   └── next.config.ts        # Next.js config with API rewrites
├── backend/                   # Flask backend API
│   ├── app/                  # Flask application
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic (stock_service.py, etc.)
│   │   ├── models.py        # SQLAlchemy models
│   │   └── utils/           # Database utilities
│   ├── config.py            # Configuration
│   ├── run.py               # Application entry point
│   └── requirements.txt     # Python dependencies
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
  - Stock search with autocomplete (real-time from yfinance, exact symbol match)
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

### Backend (Implemented)

- Flask (Python) ✅
- SQLite (primary database) ✅
- yfinance for stock prices (Indian market: NSE/BSE) ✅
- REST API ✅
- SQLAlchemy for ORM ✅
- Conda virtual environment management ✅
- Gunicorn for production deployment ✅
- CORS configured for frontend access ✅
- Flask-Session for session management ✅
- Flask-Limiter for rate limiting ✅
- Werkzeug for password hashing ✅

## Implementation Status

✅ **Completed:**
- Next.js project setup with TypeScript
- Base layout with overflow handling
- Backend Flask API with SQLite database
- Stock search with yfinance integration (exact symbol match)
- Transactions page with full CRUD operations (Buy and Sell)
- Portfolio page with Scrip View and Head View (toggleable)
- Capital Gains page with FIFO matching
- Real-time stock prices from yfinance
- All pages connected to backend API
- Refresh functionality on all pages
- Responsive design
- No horizontal overflow issues
- Error handling and loading states
- Current price display in stock selection
- **Sell shares functionality** - Modal-based sell transaction from portfolio page
- **Summary cards redesign** - Clean, balanced design with subtle left border accents and consistent spacing
- **Backend deployment** - Flask API deployed with Gunicorn (3 workers)
- **Frontend deployment** - Next.js app deployed with PM2/systemd
- **HTTPS/API connectivity** - Next.js rewrites proxy `/api/*` to backend, eliminating mixed content issues
- **Full-stack integration** - Frontend and backend fully connected and tested
- **Production deployment** - Live at https://stockthing.vanshraja.me
- **Authentication system** - Session-based auth with Flask-Session, password security, rate limiting
- **Account management** - Family-scoped accounts, share account CRUD operations
- **UI improvements** - Password visibility toggle, password confirmation, subtle visual feedback on all buttons

🔄 **Future Enhancements:**
- Fuzzy name search for stocks (requires dedicated stock search API)
- Stock price caching with cron jobs
- Advanced analytics and charts

💡 **Optional Features (Backend Ready, UI Pending Client Feedback):**
- **Day change percentage** - Backend implementation complete (`get_day_change_percent()` in `stock_service.py`), can be added to UI if client requests. Calculates intraday price movement from previous day's close.

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
- `frontend/components/SummaryCards.tsx` - Portfolio summary cards with balanced design and subtle color accents
- `frontend/components/AccountPill.tsx` - Account indicator pill
- `frontend/components/CapitalGainsPage.tsx` - Capital Gains page wrapper
- `frontend/components/SellShareModal.tsx` - Modal for selling shares from portfolio

### Utilities & Data
- `frontend/lib/api.ts` - API client for backend communication
- `frontend/lib/mockData.ts` - SQLite-compatible mock data (legacy, kept for reference)
- `frontend/lib/portfolioUtils.ts` - Portfolio aggregation and calculations (legacy utilities)
- `frontend/lib/capitalGainsUtils.ts` - Capital gains calculations (FIFO, legacy utilities)
- `frontend/next.config.ts` - Next.js configuration with API rewrites

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
- Current market price (real-time from yfinance)
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

## Authentication & Account Management (Implemented)

### Authentication System
- **Session-based authentication** using Flask-Session with filesystem backend
- **Password security**: Werkzeug password hashing (PBKDF2), password strength validation (8+ chars, letters + numbers)
- **Session security**: Secure cookies (HTTPS in production), HttpOnly, SameSite=Lax for CSRF protection
- **Rate limiting**: Flask-Limiter configured (5 attempts/minute for auth endpoints)
- **Input validation**: Username (3-20 chars, alphanumeric + underscore/hyphen), email format validation
- **User enumeration prevention**: Generic error messages

### Account Structure
- **Main Account (Family Owner)**: Single authenticated account per family
  - User registration creates a family automatically
  - User becomes the "owner" of the family
  - Default individual account created for the user
- **Share Accounts**: Labels for organizing shares (not separate authentication)
  - Created by logged-in user
  - Types: individual, HUF, joint, trust, other
  - Scoped to user's family (all data filtered by family_id)
  - Can be created, updated, deleted (if no transactions exist)

### Implementation Details
- **Backend**:
  - `/api/auth/register` - Create main account + family
  - `/api/auth/login` - Session-based login
  - `/api/auth/logout` - Clear session
  - `/api/auth/me` - Get current user info
  - All data routes protected with `@require_auth` decorator
  - All data filtered by `family_id` from session
- **Frontend**:
  - `AuthContext` for global auth state management
  - `AuthGuard` component protects routes
  - Login/Register page at `/login`
  - Password visibility toggle
  - Password confirmation with matching validation
  - Visual feedback on all UI elements

## Future Enhancements

- Fuzzy name search for stocks (requires dedicated stock search API like Alpha Vantage or Financial Modeling Prep)
- Stock price caching with cron jobs (update prices every 15 minutes)
- Advanced filtering and analytics
- Export to PDF/Excel
- Dark mode
- Notifications for price alerts
- Dividend tracking
- Tax calculation (STCG/LTCG) - basic calculation already implemented
- Portfolio performance charts
- Historical portfolio value tracking
- Redis session storage for scalability (currently using filesystem)

## Deployment

- **GitHub Actions workflow** for automatic deployment on push to main
- **Deploys to Oracle Cloud Ubuntu server**
- **Frontend**: Next.js app on port 3001 (configurable via PORT secret)
- **Backend**: Flask API with Gunicorn on port 5000 (configurable via BACKEND_PORT secret)
- **Process Management**: PM2 for frontend (with nohup/systemd fallback), nohup for backend
- **HTTPS Access**: Cloudflare Tunnel configured manually for external HTTPS access
- **API Proxying**: Next.js rewrites proxy `/api/*` requests to backend (eliminates mixed content issues)
- **Environment Variables**: 
  - `BACKEND_URL` - Backend URL for Next.js rewrites (set during deployment)
  - `NEXT_PUBLIC_API_URL` - Not used in production (uses relative URLs `/api`)
  - `CORS_ORIGINS` - Comma-separated list of allowed origins
- See `DEPLOYMENT.md` for detailed deployment instructions
