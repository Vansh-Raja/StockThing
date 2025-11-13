from flask import Flask
from flask_cors import CORS
from flask_session import Session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import DATABASE_URI, SECRET_KEY, DEBUG, CORS_ORIGINS
from app.models import db
from pathlib import Path

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['DEBUG'] = DEBUG
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    # Configure Flask-Session with SQLite backend
    instance_dir = Path(__file__).parent.parent.parent / 'instance'
    instance_dir.mkdir(exist_ok=True)
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_FILE_DIR'] = str(instance_dir / 'flask_session')
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_KEY_PREFIX'] = 'stockthing:'
    app.config['SESSION_COOKIE_SECURE'] = not DEBUG  # HTTPS only in production
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
    Session(app)
    
    # Enable CORS with proper configuration
    CORS(app, 
         origins=CORS_ORIGINS,
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # Configure rate limiting
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.stocks import stocks_bp
    from app.routes.transactions import transactions_bp
    from app.routes.accounts import accounts_bp
    from app.routes.portfolio import portfolio_bp
    from app.routes.capital_gains import capital_gains_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(stocks_bp, url_prefix='/api/stocks')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
    app.register_blueprint(capital_gains_bp, url_prefix='/api/capital-gains')
    
    return app

