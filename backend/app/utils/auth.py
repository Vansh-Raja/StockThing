from functools import wraps
from flask import session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, Family, FamilyMember

def hash_password(password: str) -> str:
    """Hash a password using werkzeug's security functions."""
    return generate_password_hash(password)

def verify_password(password_hash: str, password: str) -> bool:
    """Verify a password against a hash."""
    return check_password_hash(password_hash, password)

def get_current_user():
    """Get the current logged-in user from session."""
    if 'user_id' not in session:
        return None
    
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    return user

def get_current_family_id():
    """Get the current user's family_id from session."""
    if 'family_id' not in session:
        return None
    return session.get('family_id')

def require_auth(f):
    """Decorator to require authentication for a route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if user is None:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

