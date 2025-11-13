from app.models import db, Transaction, Stock, Account, Family
from app.services.stock_service import get_current_price

def calculate_weighted_average_price(buy_transactions):
    """Calculate weighted average purchase price"""
    if not buy_transactions:
        return 0.0
    
    total_quantity = sum(t.quantity for t in buy_transactions)
    total_value = sum(t.quantity * float(t.price) for t in buy_transactions)
    
    return total_value / total_quantity if total_quantity > 0 else 0.0

def calculate_current_quantity(transactions):
    """Calculate current quantity (buy - sell)"""
    quantity = 0
    for t in transactions:
        if t.transaction_type == 'buy':
            quantity += t.quantity
        else:
            quantity -= t.quantity
    return quantity

def get_scrip_view(family_id: int = 1):
    """Get portfolio grouped by stock (Scrip View)"""
    # Get all transactions for accounts in this family
    family = Family.query.get_or_404(family_id)
    account_ids = [acc.id for acc in family.accounts]
    
    transactions = Transaction.query.filter(
        Transaction.account_id.in_(account_ids)
    ).all()
    
    if not transactions:
        return []
    
    # Group transactions by stock
    stock_groups = {}
    for transaction in transactions:
        stock_id = transaction.stock_id
        if stock_id not in stock_groups:
            stock_groups[stock_id] = []
        stock_groups[stock_id].append(transaction)
    
    holdings = []
    
    for stock_id, stock_transactions in stock_groups.items():
        stock = Stock.query.get(stock_id)
        if not stock:
            continue
        
        current_quantity = calculate_current_quantity(stock_transactions)
        if current_quantity <= 0:
            continue
        
        buy_transactions = [t for t in stock_transactions if t.transaction_type == 'buy']
        avg_price = calculate_weighted_average_price(buy_transactions)
        total_invested = sum(t.quantity * float(t.price) for t in buy_transactions)
        
        # Get current price
        try:
            current_price = get_current_price(stock.symbol, stock.exchange)
        except Exception:
            current_price = avg_price  # Fallback to avg price if API fails
        
        current_value = current_quantity * current_price
        unrealized_gain = current_value - total_invested
        unrealized_gain_percent = (unrealized_gain / total_invested * 100) if total_invested > 0 else 0
        
        # Account breakdown
        account_breakdown = {}
        for transaction in stock_transactions:
            account = transaction.account
            if account.account_name not in account_breakdown:
                account_breakdown[account.account_name] = {
                    'account_id': account.id,
                    'account_name': account.account_name,
                    'account_type': account.account_type,
                    'quantity': 0
                }
            
            if transaction.transaction_type == 'buy':
                account_breakdown[account.account_name]['quantity'] += transaction.quantity
            else:
                account_breakdown[account.account_name]['quantity'] -= transaction.quantity
        
        # Filter out accounts with zero quantity
        valid_breakdown = [acc for acc in account_breakdown.values() if acc['quantity'] > 0]
        
        holdings.append({
            'stock_id': stock.id,
            'symbol': stock.symbol,
            'name': stock.name,
            'exchange': stock.exchange,
            'sector': stock.sector,
            'total_quantity': current_quantity,
            'account_breakdown': valid_breakdown,
            'avg_purchase_price': round(avg_price, 2),
            'current_price': round(current_price, 2),
            'total_invested': round(total_invested, 2),
            'current_value': round(current_value, 2),
            'unrealized_gain': round(unrealized_gain, 2),
            'unrealized_gain_percent': round(unrealized_gain_percent, 2),
            'day_change_percent': '0.00'  # TODO: Calculate from historical data
        })
    
    return holdings

def get_head_view(family_id: int = 1):
    """Get portfolio grouped by account (Head View)"""
    family = Family.query.get_or_404(family_id)
    accounts = family.accounts
    
    account_holdings = []
    
    for account in accounts:
        transactions = Transaction.query.filter_by(account_id=account.id).all()
        
        if not transactions:
            continue
        
        # Group by stock
        stock_groups = {}
        for transaction in transactions:
            stock_id = transaction.stock_id
            if stock_id not in stock_groups:
                stock_groups[stock_id] = []
            stock_groups[stock_id].append(transaction)
        
        stocks = []
        total_quantity = 0
        total_invested = 0
        current_value = 0
        
        for stock_id, stock_transactions in stock_groups.items():
            stock = Stock.query.get(stock_id)
            if not stock:
                continue
            
            current_qty = calculate_current_quantity(stock_transactions)
            if current_qty <= 0:
                continue
            
            buy_transactions = [t for t in stock_transactions if t.transaction_type == 'buy']
            avg_price = calculate_weighted_average_price(buy_transactions)
            invested = sum(t.quantity * float(t.price) for t in buy_transactions)
            
            try:
                current_price = get_current_price(stock.symbol, stock.exchange)
            except Exception:
                current_price = avg_price
            
            value = current_qty * current_price
            unrealized_gain = value - invested
            unrealized_gain_percent = (unrealized_gain / invested * 100) if invested > 0 else 0
            
            stocks.append({
                'stock_id': stock.id,
                'symbol': stock.symbol,
                'name': stock.name,
                'exchange': stock.exchange,
                'sector': stock.sector,
                'quantity': current_qty,
                'avg_purchase_price': round(avg_price, 2),
                'current_price': round(current_price, 2),
                'total_invested': round(invested, 2),
                'current_value': round(value, 2),
                'unrealized_gain': round(unrealized_gain, 2),
                'unrealized_gain_percent': round(unrealized_gain_percent, 2)
            })
            
            total_quantity += current_qty
            total_invested += invested
            current_value += value
        
        if not stocks:
            continue
        
        unrealized_gain = current_value - total_invested
        unrealized_gain_percent = (unrealized_gain / total_invested * 100) if total_invested > 0 else 0
        
        account_holdings.append({
            'account_id': account.id,
            'account_name': account.account_name,
            'account_type': account.account_type,
            'stocks': stocks,
            'total_quantity': total_quantity,
            'total_invested': round(total_invested, 2),
            'current_value': round(current_value, 2),
            'unrealized_gain': round(unrealized_gain, 2),
            'unrealized_gain_percent': round(unrealized_gain_percent, 2)
        })
    
    return account_holdings

def get_portfolio_summary(family_id: int = 1):
    """Get portfolio summary"""
    holdings = get_scrip_view(family_id)
    
    total_value = sum(h['current_value'] for h in holdings)
    total_invested = sum(h['total_invested'] for h in holdings)
    unrealized_gain = total_value - total_invested
    unrealized_gain_percent = (unrealized_gain / total_invested * 100) if total_invested > 0 else 0
    
    return {
        'total_value': round(total_value, 2),
        'total_invested': round(total_invested, 2),
        'unrealized_gain': round(unrealized_gain, 2),
        'unrealized_gain_percent': round(unrealized_gain_percent, 2),
        'total_holdings': len(holdings)
    }


