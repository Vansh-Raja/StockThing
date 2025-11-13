from flask import Blueprint, request, jsonify
from app.models import db, Transaction, Stock, Account
from app.utils.auth import require_auth, get_current_family_id
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('', methods=['GET'])
@require_auth
def get_transactions():
    """Get all transactions for current user's family with optional filters"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    account_id = request.args.get('account_id', type=int)
    stock_id = request.args.get('stock_id', type=int)
    
    # Start with transactions from accounts in this family
    query = Transaction.query.join(Account).filter(Account.family_id == family_id)
    
    if account_id:
        # Verify account belongs to user's family
        account = Account.query.filter_by(id=account_id, family_id=family_id).first()
        if not account:
            return jsonify({'error': 'Account not found or does not belong to your family'}), 404
        query = query.filter(Transaction.account_id == account_id)
    if stock_id:
        query = query.filter(Transaction.stock_id == stock_id)
    
    transactions = query.order_by(Transaction.transaction_date.desc()).all()
    return jsonify([t.to_dict() for t in transactions]), 200

@transactions_bp.route('', methods=['POST'])
@require_auth
def create_transaction():
    """Create a new transaction"""
    data = request.get_json()
    
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    # Validate required fields
    required_fields = ['account_id', 'stock_id', 'quantity', 'price', 'transaction_type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate transaction type
    if data['transaction_type'] not in ['buy', 'sell']:
        return jsonify({'error': 'transaction_type must be "buy" or "sell"'}), 400
    
    # Validate account exists and belongs to user's family
    account = Account.query.filter_by(id=data['account_id'], family_id=family_id).first()
    if not account:
        return jsonify({'error': 'Account not found or does not belong to your family'}), 404
    
    # Validate stock exists
    stock = Stock.query.get(data['stock_id'])
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404
    
    # Validate quantity and price
    if data['quantity'] <= 0:
        return jsonify({'error': 'Quantity must be greater than 0'}), 400
    if data['price'] <= 0:
        return jsonify({'error': 'Price must be greater than 0'}), 400
    
    # Parse transaction date
    transaction_date = datetime.utcnow()
    if 'transaction_date' in data and data['transaction_date']:
        try:
            transaction_date = datetime.fromisoformat(data['transaction_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid transaction_date format'}), 400
    
    # Create transaction
    transaction = Transaction(
        account_id=data['account_id'],
        stock_id=data['stock_id'],
        transaction_type=data['transaction_type'],
        quantity=data['quantity'],
        price=data['price'],
        transaction_date=transaction_date,
        notes=data.get('notes', '')
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify(transaction.to_dict()), 201

@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
@require_auth
def get_transaction(transaction_id):
    """Get transaction by ID (must belong to user's family)"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    transaction = Transaction.query.join(Account).filter(
        Transaction.id == transaction_id,
        Account.family_id == family_id
    ).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    return jsonify(transaction.to_dict()), 200

@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
@require_auth
def update_transaction(transaction_id):
    """Update a transaction (must belong to user's family)"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    transaction = Transaction.query.join(Account).filter(
        Transaction.id == transaction_id,
        Account.family_id == family_id
    ).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    data = request.get_json()
    
    # Update fields if provided
    if 'quantity' in data:
        if data['quantity'] <= 0:
            return jsonify({'error': 'Quantity must be greater than 0'}), 400
        transaction.quantity = data['quantity']
    
    if 'price' in data:
        if data['price'] <= 0:
            return jsonify({'error': 'Price must be greater than 0'}), 400
        transaction.price = data['price']
    
    if 'transaction_date' in data:
        try:
            transaction.transaction_date = datetime.fromisoformat(data['transaction_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid transaction_date format'}), 400
    
    if 'notes' in data:
        transaction.notes = data['notes']
    
    db.session.commit()
    return jsonify(transaction.to_dict()), 200

@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
@require_auth
def delete_transaction(transaction_id):
    """Delete a transaction (must belong to user's family)"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    transaction = Transaction.query.join(Account).filter(
        Transaction.id == transaction_id,
        Account.family_id == family_id
    ).first()
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    db.session.delete(transaction)
    db.session.commit()
    return jsonify({'message': 'Transaction deleted'}), 200


