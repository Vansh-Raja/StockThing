from flask import Blueprint, request, jsonify, session, current_app
from app.models import db, User, Family, FamilyMember
from app.utils.auth import hash_password, verify_password, get_current_user
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_username(username: str) -> bool:
    """Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)"""
    pattern = r'^[a-zA-Z0-9_-]{3,20}$'
    return re.match(pattern, username) is not None

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, 'Password must be at least 8 characters'
    if len(password) > 128:
        return False, 'Password must be less than 128 characters'
    if not re.search(r'[A-Za-z]', password):
        return False, 'Password must contain at least one letter'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one number'
    return True, ''

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new main account (creates user + family)"""
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Username, email, and password are required'}), 400
    
    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    
    # Validate username format
    if not validate_username(username):
        return jsonify({'error': 'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens'}), 400
    
    # Validate email format
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password strength
    is_valid, error_msg = validate_password_strength(password)
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    # Check if user already exists (generic error to prevent user enumeration)
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'Username or email already exists'}), 400
    
    try:
        # Create user
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password)
        )
        db.session.add(user)
        db.session.flush()  # Get user.id
        
        # Create family
        family_name = data.get('family_name', f"{username}'s Family Portfolio")
        family = Family(name=family_name)
        db.session.add(family)
        db.session.flush()  # Get family.id
        
        # Create family member (user is owner)
        family_member = FamilyMember(
            family_id=family.id,
            user_id=user.id,
            role='owner'
        )
        db.session.add(family_member)
        
        db.session.commit()
        
        # Set session
        session['user_id'] = user.id
        session['family_id'] = family.id
        
        return jsonify({
            'message': 'Registration successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'family_id': family.id
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with main account"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    # Find user by username or email
    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    
    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Verify password
    if not verify_password(user.password_hash, password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Get user's family (should have one as owner)
    family_member = FamilyMember.query.filter_by(user_id=user.id, role='owner').first()
    if not family_member:
        return jsonify({'error': 'User has no associated family'}), 500
    
    # Set session
    session['user_id'] = user.id
    session['family_id'] = family_member.family_id
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'family_id': family_member.family_id
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout current user"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user_info():
    """Get current logged-in user info"""
    user = get_current_user()
    
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get family_id from session
    family_id = session.get('family_id')
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'family_id': family_id
    }), 200

