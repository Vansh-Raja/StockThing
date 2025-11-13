# Stock Portfolio Backend API

Flask REST API backend for Stock Portfolio Tracker.

## Setup

1. **Create Conda Environment**:
   ```bash
   conda create -n StockThing python=3.12.0 -y
   conda activate StockThing
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run the Application**:
   ```bash
   python run.py
   ```

   The API will be available at `http://localhost:5000`

## API Endpoints

### Stocks
- `GET /api/stocks/search?q=<query>&exchange=<NSE|BSE>` - Search stocks
- `GET /api/stocks/<id>` - Get stock by ID
- `GET /api/stocks/<id>/price` - Get current price
- `GET /api/stocks/<id>/info` - Get detailed stock info

### Accounts
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/<id>` - Get account by ID

### Transactions
- `GET /api/transactions` - Get all transactions (optional filters: account_id, stock_id)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/<id>` - Get transaction by ID
- `PUT /api/transactions/<id>` - Update transaction
- `DELETE /api/transactions/<id>` - Delete transaction

### Portfolio
- `GET /api/portfolio/scrip-view?family_id=<id>` - Scrip view (grouped by stock)
- `GET /api/portfolio/head-view?family_id=<id>` - Head view (grouped by account)
- `GET /api/portfolio/summary?family_id=<id>` - Portfolio summary

### Capital Gains
- `GET /api/capital-gains?family_id=<id>&account_id=<id>&stock_id=<id>&from_date=<date>&to_date=<date>` - Get capital gains
- `GET /api/capital-gains/summary?family_id=<id>&filters...` - Get capital gains summary

## Database

SQLite database is automatically created in `instance/portfolio.db` on first run.
Initial seed data is loaded automatically.

## Environment Variables

- `FLASK_DEBUG` - Set to `true` for debug mode (default: `false`)
- `SECRET_KEY` - Flask secret key (default: dev key)
- `CORS_ORIGINS` - Comma-separated list of allowed origins (default: `http://localhost:3000,http://localhost:3001`)

## Stock Search

The stock search uses `yfinance` for real-time data. Currently supports:
- **Exact symbol matching** with capitalization normalization
- **NSE and BSE** exchanges
- **Real-time price fetching** from yfinance

**Note**: yfinance only supports symbol lookup, not name-based search. For fuzzy name search, a dedicated stock search API (e.g., Alpha Vantage, Financial Modeling Prep) would be required in the future.

## API Response Format

All API responses follow REST conventions:
- Success: `200` or `201` status codes with JSON data
- Error: `400`, `404`, or `500` status codes with `{"error": "message"}` format
- Dates: ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
- Prices: Decimal numbers (e.g., `2500.00`)

