from flask import Blueprint, request, jsonify
from app.services.portfolio_service import get_scrip_view, get_head_view, get_portfolio_summary

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/scrip-view', methods=['GET'])
def scrip_view():
    """Get portfolio grouped by stock (Scrip View)"""
    family_id = request.args.get('family_id', type=int, default=1)
    
    try:
        holdings = get_scrip_view(family_id)
        return jsonify({'holdings': holdings}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/head-view', methods=['GET'])
def head_view():
    """Get portfolio grouped by account (Head View)"""
    family_id = request.args.get('family_id', type=int, default=1)
    
    try:
        account_holdings = get_head_view(family_id)
        return jsonify({'account_holdings': account_holdings}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/summary', methods=['GET'])
def summary():
    """Get portfolio summary"""
    family_id = request.args.get('family_id', type=int, default=1)
    
    try:
        summary_data = get_portfolio_summary(family_id)
        return jsonify(summary_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

