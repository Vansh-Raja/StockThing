from flask import Flask
from flask_cors import CORS
from config import DATABASE_URI, SECRET_KEY, DEBUG, CORS_ORIGINS
from app.models import db

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['DEBUG'] = DEBUG
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    # Enable CORS with proper configuration
    CORS(app, 
         origins=CORS_ORIGINS,
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # Register blueprints
    from app.routes.stocks import stocks_bp
    from app.routes.transactions import transactions_bp
    from app.routes.accounts import accounts_bp
    from app.routes.portfolio import portfolio_bp
    from app.routes.capital_gains import capital_gains_bp
    
    app.register_blueprint(stocks_bp, url_prefix='/api/stocks')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
    app.register_blueprint(capital_gains_bp, url_prefix='/api/capital-gains')
    
    return app

