from datetime import datetime, timedelta
from app.models import Transaction, Stock, Account, Family

def calculate_capital_gains(family_id: int = 1, filters: dict = None):
    """Calculate capital gains using FIFO matching"""
    if filters is None:
        filters = {}
    
    family = Family.query.get_or_404(family_id)
    account_ids = [acc.id for acc in family.accounts]
    
    # Get all transactions
    query = Transaction.query.filter(Transaction.account_id.in_(account_ids))
    
    if filters.get('account_id'):
        query = query.filter(Transaction.account_id == filters['account_id'])
    if filters.get('stock_id'):
        query = query.filter(Transaction.stock_id == filters['stock_id'])
    
    all_transactions = query.all()
    
    # Get sell transactions
    sell_transactions = [t for t in all_transactions if t.transaction_type == 'sell']
    sell_transactions.sort(key=lambda x: x.transaction_date)
    
    if not sell_transactions:
        return []
    
    # Build buy queue for FIFO matching
    # Use dict to track remaining quantities
    buy_queue = {}
    buy_transactions = [t for t in all_transactions if t.transaction_type == 'buy']
    
    for buy in buy_transactions:
        key = f"{buy.stock_id}-{buy.account_id}"
        if key not in buy_queue:
            buy_queue[key] = []
        buy_queue[key].append({
            'transaction': buy,
            'remaining_quantity': buy.quantity
        })
    
    # Sort buy transactions by date (FIFO)
    for key in buy_queue:
        buy_queue[key].sort(key=lambda x: x['transaction'].transaction_date)
    
    capital_gains = []
    
    # Process each sell transaction
    for sell in sell_transactions:
        key = f"{sell.stock_id}-{sell.account_id}"
        buys = buy_queue.get(key, [])
        
        remaining_quantity = sell.quantity
        
        # Match with buy transactions (FIFO)
        for buy_entry in buys:
            if remaining_quantity <= 0:
                break
            
            buy = buy_entry['transaction']
            available_quantity = buy_entry['remaining_quantity']
            if available_quantity <= 0:
                continue
            
            quantity_to_match = min(remaining_quantity, available_quantity)
            
            buy_date = buy.transaction_date
            sell_date = sell.transaction_date
            holding_period = (sell_date - buy_date).days
            is_long_term = holding_period >= 365
            
            capital_gain = (float(sell.price) - float(buy.price)) * quantity_to_match
            capital_gain_percent = ((float(sell.price) - float(buy.price)) / float(buy.price) * 100) if buy.price > 0 else 0
            
            # Apply date filters
            if filters.get('from_date'):
                from_date = datetime.fromisoformat(filters['from_date'])
                if sell_date < from_date:
                    buy_entry['remaining_quantity'] -= quantity_to_match
                    remaining_quantity -= quantity_to_match
                    continue
            
            if filters.get('to_date'):
                to_date = datetime.fromisoformat(filters['to_date'] + 'T23:59:59')
                if sell_date > to_date:
                    buy_entry['remaining_quantity'] -= quantity_to_match
                    remaining_quantity -= quantity_to_match
                    continue
            
            stock = Stock.query.get(sell.stock_id)
            account = Account.query.get(sell.account_id)
            
            capital_gains.append({
                'id': len(capital_gains) + 1,
                'stock_id': sell.stock_id,
                'account_id': sell.account_id,
                'stock': {
                    'id': stock.id,
                    'symbol': stock.symbol,
                    'name': stock.name
                } if stock else None,
                'account': {
                    'id': account.id,
                    'account_name': account.account_name
                } if account else None,
                'buy_date': buy_date.isoformat(),
                'sell_date': sell_date.isoformat(),
                'quantity': quantity_to_match,
                'buy_price': float(buy.price),
                'sell_price': float(sell.price),
                'capital_gain': round(capital_gain, 2),
                'capital_gain_percent': round(capital_gain_percent, 2),
                'holding_period': holding_period,
                'is_long_term': is_long_term
            })
            
            buy_entry['remaining_quantity'] -= quantity_to_match
            remaining_quantity -= quantity_to_match
    
    return capital_gains

def get_capital_gains_summary(gains: list):
    """Get capital gains summary"""
    total_gain = sum(g['capital_gain'] for g in gains)
    short_term_gains = sum(g['capital_gain'] for g in gains if not g['is_long_term'])
    long_term_gains = sum(g['capital_gain'] for g in gains if g['is_long_term'])
    
    return {
        'totalGain': round(total_gain, 2),
        'shortTermGains': round(short_term_gains, 2),
        'longTermGains': round(long_term_gains, 2)
    }

