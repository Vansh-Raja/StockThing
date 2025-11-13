from app.models import db, User, Family, FamilyMember, Account, Stock, Transaction
from datetime import datetime

def init_db():
    """Initialize database and create tables"""
    import os
    from pathlib import Path
    
    # Create instance directory if it doesn't exist
    instance_dir = Path(__file__).parent.parent.parent / 'instance'
    instance_dir.mkdir(exist_ok=True)
    
    # Create all tables
    db.create_all()
    
    # Check if database is empty and seed initial data
    if User.query.count() == 0:
        seed_initial_data()

def seed_initial_data():
    """Seed database with initial test data"""
    # Create users
    user1 = User(
        username='rahul',
        email='rahul@example.com',
        password_hash='dummy_hash'  # In production, use proper password hashing
    )
    user2 = User(
        username='amit',
        email='amit@example.com',
        password_hash='dummy_hash'
    )
    db.session.add(user1)
    db.session.add(user2)
    
    # Create family
    family = Family(name='Family Portfolio')
    db.session.add(family)
    db.session.flush()  # Get family.id
    
    # Create family members
    member1 = FamilyMember(family_id=family.id, user_id=user1.id, role='owner')
    member2 = FamilyMember(family_id=family.id, user_id=user2.id, role='member')
    db.session.add(member1)
    db.session.add(member2)
    
    # Create accounts
    account1 = Account(
        user_id=user1.id,
        family_id=family.id,
        account_name='Rahul',
        account_type='individual'
    )
    account2 = Account(
        user_id=user2.id,
        family_id=family.id,
        account_name='Amit',
        account_type='individual'
    )
    account3 = Account(
        user_id=user2.id,
        family_id=family.id,
        account_name='Amit HUF',
        account_type='HUF'
    )
    db.session.add(account1)
    db.session.add(account2)
    db.session.add(account3)
    
    # Create stocks
    stocks_data = [
        {'symbol': 'RELIANCE', 'name': 'Reliance Industries Ltd', 'exchange': 'NSE', 'sector': 'Energy'},
        {'symbol': 'TCS', 'name': 'Tata Consultancy Services', 'exchange': 'NSE', 'sector': 'IT'},
        {'symbol': 'INFY', 'name': 'Infosys Ltd', 'exchange': 'NSE', 'sector': 'IT'},
        {'symbol': 'HDFCBANK', 'name': 'HDFC Bank Ltd', 'exchange': 'NSE', 'sector': 'Banking'},
    ]
    
    stocks = []
    for stock_data in stocks_data:
        stock = Stock(**stock_data)
        db.session.add(stock)
        stocks.append(stock)
    
    db.session.flush()  # Get stock IDs
    
    # Create transactions
    transactions_data = [
        {'account_id': account1.id, 'stock_id': stocks[0].id, 'transaction_type': 'buy', 'quantity': 500, 'price': 2500.00, 'transaction_date': datetime(2024, 1, 15, 10, 30, 0), 'notes': ''},
        {'account_id': account2.id, 'stock_id': stocks[0].id, 'transaction_type': 'buy', 'quantity': 250, 'price': 2480.00, 'transaction_date': datetime(2024, 1, 20, 14, 20, 0), 'notes': ''},
        {'account_id': account3.id, 'stock_id': stocks[0].id, 'transaction_type': 'buy', 'quantity': 1000, 'price': 2520.00, 'transaction_date': datetime(2024, 2, 1, 9, 15, 0), 'notes': ''},
        {'account_id': account1.id, 'stock_id': stocks[1].id, 'transaction_type': 'buy', 'quantity': 100, 'price': 3500.00, 'transaction_date': datetime(2024, 1, 10, 11, 0, 0), 'notes': ''},
        {'account_id': account2.id, 'stock_id': stocks[1].id, 'transaction_type': 'buy', 'quantity': 50, 'price': 3480.00, 'transaction_date': datetime(2024, 1, 25, 15, 30, 0), 'notes': ''},
        {'account_id': account1.id, 'stock_id': stocks[2].id, 'transaction_type': 'buy', 'quantity': 200, 'price': 1500.00, 'transaction_date': datetime(2024, 2, 5, 10, 0, 0), 'notes': ''},
        {'account_id': account1.id, 'stock_id': stocks[1].id, 'transaction_type': 'sell', 'quantity': 30, 'price': 3600.00, 'transaction_date': datetime(2024, 2, 10, 14, 0, 0), 'notes': ''},
    ]
    
    for trans_data in transactions_data:
        transaction = Transaction(**trans_data)
        db.session.add(transaction)
    
    db.session.commit()
    print("Database seeded with initial data")


