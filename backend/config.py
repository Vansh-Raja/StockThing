import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent
INSTANCE_DIR = BASE_DIR / 'instance'

# Database configuration
DATABASE_URI = f'sqlite:///{INSTANCE_DIR / "portfolio.db"}'

# Flask configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

# CORS configuration
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(',')

