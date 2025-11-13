from flask import Blueprint, request, jsonify
from app.services.capital_gains_service import calculate_capital_gains, get_capital_gains_summary

capital_gains_bp = Blueprint('capital_gains', __name__)

@capital_gains_bp.route('', methods=['GET'])
def get_capital_gains():
    """Get capital gains statement with optional filters"""
    family_id = request.args.get('family_id', type=int, default=1)
    account_id = request.args.get('account_id', type=int)
    stock_id = request.args.get('stock_id', type=int)
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    filters = {
        'account_id': account_id,
        'stock_id': stock_id,
        'from_date': from_date,
        'to_date': to_date
    }
    
    try:
        gains = calculate_capital_gains(family_id, filters)
        return jsonify({'gains': gains}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@capital_gains_bp.route('/summary', methods=['GET'])
def get_summary():
    """Get capital gains summary"""
    family_id = request.args.get('family_id', type=int, default=1)
    account_id = request.args.get('account_id', type=int)
    stock_id = request.args.get('stock_id', type=int)
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    filters = {
        'account_id': account_id,
        'stock_id': stock_id,
        'from_date': from_date,
        'to_date': to_date
    }
    
    try:
        gains = calculate_capital_gains(family_id, filters)
        summary = get_capital_gains_summary(gains)
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


