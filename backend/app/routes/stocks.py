from flask import Blueprint, request, jsonify
from app.models import db, Stock
from app.services.stock_service import search_stocks, get_stock_info, get_current_price

stocks_bp = Blueprint('stocks', __name__)

@stocks_bp.route('/search', methods=['GET'])
def search():
    """Search stocks by query"""
    query = request.args.get('q', '').strip()
    exchange = request.args.get('exchange', 'NSE').upper()
    
    if not query or len(query) < 2:
        return jsonify({'stocks': []}), 200
    
    try:
        results = search_stocks(query, exchange)
        return jsonify({'stocks': results}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stocks_bp.route('/<int:stock_id>', methods=['GET'])
def get_stock(stock_id):
    """Get stock by ID"""
    stock = Stock.query.get_or_404(stock_id)
    return jsonify(stock.to_dict()), 200

@stocks_bp.route('/<int:stock_id>/price', methods=['GET'])
def get_price(stock_id):
    """Get current price for a stock"""
    stock = Stock.query.get_or_404(stock_id)
    
    try:
        price = get_current_price(stock.symbol, stock.exchange)
        return jsonify({
            'stock_id': stock.id,
            'symbol': stock.symbol,
            'current_price': price,
            'updated_at': None  # Could add timestamp tracking
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@stocks_bp.route('/<int:stock_id>/info', methods=['GET'])
def get_info(stock_id):
    """Get detailed stock information"""
    stock = Stock.query.get_or_404(stock_id)
    
    try:
        info = get_stock_info(stock.symbol, stock.exchange)
        return jsonify(info), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


