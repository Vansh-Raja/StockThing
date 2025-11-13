import yfinance as yf
from app.models import db, Stock

def format_yfinance_symbol(symbol: str, exchange: str) -> str:
    """Format symbol for yfinance (NSE: SYMBOL.NS, BSE: SYMBOL.BO)"""
    if exchange.upper() == 'NSE':
        return f"{symbol}.NS"
    elif exchange.upper() == 'BSE':
        return f"{symbol}.BO"
    else:
        return symbol

def normalize_symbol(query: str) -> str:
    """
    Normalize stock symbol: uppercase, remove spaces, handle common variations.
    Examples: "reliance" -> "RELIANCE", "tcs " -> "TCS", "Hdfc Bank" -> "HDFCBANK"
    """
    # Remove spaces and convert to uppercase
    normalized = query.upper().strip().replace(' ', '')
    return normalized

def search_stocks(query: str, exchange: str = 'NSE') -> list:
    """
    Search stocks using yfinance - exact symbol match only.
    Normalizes the query (uppercase, remove spaces) and tries exact match.
    Always fetches fresh prices from yfinance.
    
    TODO: Future enhancement - Implement fuzzy name search using a proper stock search API
    (e.g., Alpha Vantage, Financial Modeling Prep, or a dedicated Indian stock API).
    yfinance only supports symbol lookup, not name-based search.
    """
    if not query or len(query.strip()) < 1:
        return []
    
    # Normalize symbol (uppercase, remove spaces)
    normalized_symbol = normalize_symbol(query)
    
    if not normalized_symbol:
        return []
    
    try:
        yf_symbol = format_yfinance_symbol(normalized_symbol, exchange)
        ticker = yf.Ticker(yf_symbol)
        info = ticker.info
        
        # Check if stock exists (yfinance returns empty dict or error for invalid symbols)
        if not info or 'symbol' not in info or not info.get('symbol'):
            return []
        
        # Get or create stock in database (for reference, not for search)
        stock = Stock.query.filter_by(symbol=normalized_symbol, exchange=exchange).first()
        if not stock:
            stock = Stock(
                symbol=normalized_symbol,
                name=info.get('longName', normalized_symbol),
                exchange=exchange,
                sector=info.get('sector', None)
            )
            db.session.add(stock)
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
                stock = Stock.query.filter_by(symbol=normalized_symbol, exchange=exchange).first()
        else:
            # Update name and sector in case they changed
            stock.name = info.get('longName', stock.name)
            stock.sector = info.get('sector', stock.sector)
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
        
        # Always fetch fresh price from yfinance
        price = None
        try:
            # Try multiple price fields from info first (faster)
            if 'currentPrice' in info and info['currentPrice']:
                price = float(info['currentPrice'])
            elif 'regularMarketPrice' in info and info['regularMarketPrice']:
                price = float(info['regularMarketPrice'])
            elif 'previousClose' in info and info['previousClose']:
                price = float(info['previousClose'])
            else:
                # Fallback to get_current_price which uses history
                price = get_current_price(normalized_symbol, exchange)
        except Exception:
            # If all methods fail, price remains None
            pass
        
        if stock:
            return [{
                'id': stock.id,
                'symbol': stock.symbol,
                'name': stock.name,
                'exchange': stock.exchange,
                'sector': stock.sector,
                'current_price': price
            }]
        
        return []
    except Exception:
        # Stock not found or error occurred
        return []

def get_stock_info(symbol: str, exchange: str) -> dict:
    """Get detailed stock information from yfinance"""
    yf_symbol = format_yfinance_symbol(symbol, exchange)
    ticker = yf.Ticker(yf_symbol)
    info = ticker.info
    
    if not info or 'symbol' not in info:
        raise ValueError(f"Stock {symbol} not found on {exchange}")
    
    # Update or create stock in database
    stock = Stock.query.filter_by(symbol=symbol, exchange=exchange).first()
    if stock:
        stock.name = info.get('longName', stock.name)
        stock.sector = info.get('sector', stock.sector)
    else:
        stock = Stock(
            symbol=symbol,
            name=info.get('longName', symbol),
            exchange=exchange,
            sector=info.get('sector', None)
        )
        db.session.add(stock)
    
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        stock = Stock.query.filter_by(symbol=symbol, exchange=exchange).first()
    
    return {
        'id': stock.id,
        'symbol': stock.symbol,
        'name': stock.name,
        'exchange': stock.exchange,
        'sector': stock.sector,
        'current_price': info.get('currentPrice', 0),
        'market_cap': info.get('marketCap', 0),
        'volume': info.get('volume', 0)
    }

def get_current_price(symbol: str, exchange: str) -> float:
    """Get current market price for a stock"""
    yf_symbol = format_yfinance_symbol(symbol, exchange)
    ticker = yf.Ticker(yf_symbol)
    
    # Try to get current price from info
    info = ticker.info
    if info and 'currentPrice' in info:
        return float(info['currentPrice'])
    
    # Fallback: get latest price from history
    hist = ticker.history(period='1d')
    if not hist.empty:
        return float(hist['Close'].iloc[-1])
    
    raise ValueError(f"Could not fetch price for {symbol} on {exchange}")

