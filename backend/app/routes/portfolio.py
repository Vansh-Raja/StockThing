from flask import Blueprint, request, jsonify
from app.services.portfolio_service import get_scrip_view, get_head_view, get_portfolio_summary
from app.utils.auth import require_auth, get_current_family_id

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/scrip-view', methods=['GET'])
@require_auth
def scrip_view():
    """Get portfolio grouped by stock (Scrip View)"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    try:
        holdings = get_scrip_view(family_id)
        return jsonify({'holdings': holdings}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/head-view', methods=['GET'])
@require_auth
def head_view():
    """Get portfolio grouped by account (Head View)"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    try:
        account_holdings = get_head_view(family_id)
        return jsonify({'account_holdings': account_holdings}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/summary', methods=['GET'])
@require_auth
def summary():
    """Get portfolio summary"""
    family_id = get_current_family_id()
    if not family_id:
        return jsonify({'error': 'No family associated with user'}), 400
    
    try:
        summary_data = get_portfolio_summary(family_id)
        return jsonify(summary_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

