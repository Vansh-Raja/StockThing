# Stock Portfolio Tracker

A full-stack web application for tracking Indian stock market investments with family/group portfolio support. Built with Next.js frontend and Flask backend, featuring real-time stock prices, portfolio analytics, and capital gains tracking.

## Features

### 📊 Transaction Management
- **Buy Transactions**: Add stock purchases with date/time, quantity, price, and optional notes
- **Sell Transactions**: Sell shares directly from portfolio with modal-based interface
- **Transaction History**: View all transactions in chronological order with filtering
- **Stock Search**: Real-time stock search using yfinance with exact symbol matching
- **Current Price Display**: See current market price while selecting stocks
- **Account Management**: Support for multiple accounts (individual, HUF, etc.) within a family portfolio

### 💼 Portfolio Dashboard
- **Scrip View**: View portfolio grouped by stock with account breakdown
- **Head View**: View portfolio grouped by account with stock breakdown
- **Expandable Rows**: Click to expand and see detailed breakdowns
- **Portfolio Summary Cards**:
  - Total Portfolio Value
  - Total Invested Amount
  - Unrealized Gain/Loss (with percentage)
  - Number of Holdings
- **Real-time Prices**: Current market prices fetched from yfinance
- **Unrealized Gains/Losses**: Calculated per stock and account with percentages
- **Search & Filter**: Filter by stock symbol/name or account
- **Refresh Button**: Manual refresh to update portfolio data

### 📈 Capital Gains Statement
- **FIFO Matching**: Automatic matching of sell transactions with buy transactions using First-In-First-Out logic
- **Holding Period Calculation**: Tracks days held for each transaction
- **Short-term vs Long-term**: Automatically categorizes gains (365-day threshold)
- **Summary Cards**:
  - Total Capital Gains
  - Short-term Gains
  - Long-term Gains
- **Filtering Options**:
  - Filter by account
  - Filter by stock
  - Date range filtering (From Date, To Date)
- **CSV Export**: Export capital gains statement to CSV file
- **Detailed Table**: Shows buy date, sell date, quantity, prices, gain/loss, and holding period

### 🏦 Family/Group Support
- **Multiple Accounts**: Manage multiple accounts within a single family portfolio
- **Account Types**: Support for individual, HUF (Hindu Undivided Family), and other account types
- **Account Breakdown**: See holdings distribution across accounts
- **Account Indicators**: Visual pills showing account names and quantities

### 🎨 User Interface
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Modern UI**: Clean, minimalistic interface using Tailwind CSS
- **Loading States**: Visual feedback during data fetching
- **Error Handling**: User-friendly error messages
- **Accessibility**: Proper semantic HTML and ARIA labels
- **Indian Number Formatting**: Displays amounts in lakhs/crores format (₹1,00,000.00)

### 🔄 Real-time Data
- **Live Stock Prices**: Real-time market prices from yfinance
- **Automatic Updates**: Refresh functionality to get latest data
- **Price Validation**: Current price pre-filled in sell modal

### 🚀 Additional Features
- **Sell from Portfolio**: Quick sell action directly from portfolio table
- **Transaction Notes**: Add optional notes to transactions
- **Date/Time Tracking**: Precise transaction timestamps
- **Stock Information**: Stock name, symbol, exchange, and sector display
- **Weighted Average Price**: Automatic calculation of average purchase price
- **Portfolio Analytics**: Comprehensive gain/loss calculations

## Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React 19** - UI library
- **Bun** - Package manager and runtime

### Backend
- **Flask** (Python) - REST API
- **SQLite** - Primary database
- **SQLAlchemy** - ORM
- **yfinance** - Real-time stock prices (NSE/BSE)
- **Gunicorn** - Production WSGI server
- **Conda** - Python environment management

## Getting Started

### Prerequisites

- **Node.js 18+** and **Bun** (or npm)
- **Python 3.12+** and **Conda** (for backend)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

4. Open your browser and navigate to `http://localhost:3000` (or the port shown)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate Conda environment:
```bash
conda create -n StockThing python=3.12.0 -y
conda activate StockThing
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
python -c "from app import create_app; from app.utils.database import init_db; app = create_app(); app.app_context().push(); init_db()"
```

5. Start the Flask server:
```bash
python run.py
```

The backend will run on `http://localhost:5000`

## Project Structure

```
StockThing/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   └── lib/          # Utilities and API client
├── backend/          # Flask backend API
│   ├── app/          # Flask application
│   │   ├── routes/   # API route handlers
│   │   ├── services/ # Business logic
│   │   └── models.py # SQLAlchemy models
│   └── requirements.txt
├── plan.md           # Project plan
├── AGENTS.md         # Codebase guidelines
└── DEPLOYMENT.md     # Deployment instructions
```

## Deployment

The application is deployed to production using GitHub Actions:

- **Frontend**: Next.js app on port 3001
- **Backend**: Flask API with Gunicorn on port 5000
- **Live Site**: https://stockthing.vanshraja.me

See `DEPLOYMENT.md` for detailed deployment instructions.

## Development

This is a full-stack application with:
- ✅ Backend integration with Flask
- ✅ Real-time stock prices via yfinance
- ✅ Database persistence with SQLite
- ✅ Production deployment

## Future Improvements

### Optional Features (Backend Ready, UI Pending Client Feedback)
- **Day Change Percentage**: Backend implementation complete (`get_day_change_percent()` in `backend/app/services/stock_service.py`). Can be added to UI if client requests. Calculates intraday price movement from previous day's close.

### Planned Enhancements
- Fuzzy name search for stocks (requires dedicated stock search API)
- Stock price caching with cron jobs (update prices every 15 minutes)
- User authentication and authorization
- Advanced analytics and charts
- Export to PDF/Excel
- Dark mode
- Notifications for price alerts
- Dividend tracking
- Portfolio performance charts
- Historical portfolio value tracking

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
