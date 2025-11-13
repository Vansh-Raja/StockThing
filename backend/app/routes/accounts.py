from flask import Blueprint, jsonify, request
from app.models import db, Account, Transaction
from app.utils.auth import require_auth, get_current_user, get_current_family_id

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('', methods=['GET'])
@require_auth
def get_accounts():
    """Get all share accounts for current user's family"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    accounts = Account.query.filter_by(family_id=family_id).all()
    return jsonify([account.to_dict() for account in accounts]), 200

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@require_auth
def get_account(account_id):
    """Get share account by ID (must belong to user's family)"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    account = Account.query.filter_by(id=account_id, family_id=family_id).first()
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    return jsonify(account.to_dict()), 200

@accounts_bp.route('', methods=['POST'])
@require_auth
def create_account():
    """Create a new share account"""
    data = request.get_json()
    
    if not data or not data.get('account_name'):
        return jsonify({'error': 'Account name is required'}), 400
    
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    account_name = data['account_name'].strip()
    account_type = data.get('account_type', 'individual')
    
    # Validate account type
    valid_types = ['individual', 'HUF', 'joint', 'trust', 'other']
    if account_type not in valid_types:
        return jsonify({'error': f'Invalid account type. Must be one of: {", ".join(valid_types)}'}), 400
    
    # Check if account name already exists in this family
    existing = Account.query.filter_by(family_id=family_id, account_name=account_name).first()
    if existing:
        return jsonify({'error': 'Account name already exists in your family'}), 400
    
    try:
        user = get_current_user()
        account = Account(
            user_id=user.id,
            family_id=family_id,
            account_name=account_name,
            account_type=account_type
        )
        db.session.add(account)
        db.session.commit()
        
        return jsonify(account.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create account: {str(e)}'}), 500

@accounts_bp.route('/<int:account_id>', methods=['PUT'])
@require_auth
def update_account(account_id):
    """Update a share account"""
    data = request.get_json()
    
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    account = Account.query.filter_by(id=account_id, family_id=family_id).first()
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Update account name if provided
    if 'account_name' in data:
        new_name = data['account_name'].strip()
        if new_name != account.account_name:
            # Check if new name already exists in this family
            existing = Account.query.filter_by(family_id=family_id, account_name=new_name).first()
            if existing:
                return jsonify({'error': 'Account name already exists in your family'}), 400
            account.account_name = new_name
    
    # Update account type if provided
    if 'account_type' in data:
        account_type = data['account_type']
        valid_types = ['individual', 'HUF', 'joint', 'trust', 'other']
        if account_type not in valid_types:
            return jsonify({'error': f'Invalid account type. Must be one of: {", ".join(valid_types)}'}), 400
        account.account_type = account_type
    
    try:
        db.session.commit()
        return jsonify(account.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update account: {str(e)}'}), 500

@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
@require_auth
def delete_account(account_id):
    """Delete a share account (only if no transactions exist)"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    account = Account.query.filter_by(id=account_id, family_id=family_id).first()
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Check if account has any transactions
    transaction_count = Transaction.query.filter_by(account_id=account_id).count()
    if transaction_count > 0:
        return jsonify({'error': f'Cannot delete account with {transaction_count} transaction(s). Delete transactions first.'}), 400
    
    try:
        db.session.delete(account)
        db.session.commit()
        return jsonify({'message': 'Account deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete account: {str(e)}'}), 500


