from flask import Blueprint, jsonify
from app.models import Account

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('', methods=['GET'])
def get_accounts():
    """Get all accounts"""
    accounts = Account.query.all()
    return jsonify([account.to_dict() for account in accounts]), 200

@accounts_bp.route('/<int:account_id>', methods=['GET'])
def get_account(account_id):
    """Get account by ID"""
    account = Account.query.get_or_404(account_id)
    return jsonify(account.to_dict()), 200


