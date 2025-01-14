from flask import Blueprint, request, jsonify
from models.user import User
from database import get_db
from auth.jwt import create_access_token
import logging
from services.auth_service import AuthService
from werkzeug.exceptions import BadRequest, Unauthorized
from datetime import datetime
import os

logger = logging.getLogger(__name__)

# Create a Blueprint for auth routes
auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    db = get_db()
    try:
        data = request.get_json()
#        logger.info(f"[auth.py] Current working directory: {os.getcwd()}")
#        logger.info(f"[auth.py] Database URL: {db.get_bind().url}")
        logger.info(f"[auth.py] Signup attempt for email: {data.get('email')}, fullName: {data.get('fullName')}, password: {data.get('password')}")
        
        # Map frontend field names to backend field names
        fullName = data.get('fullName')  # Frontend sends 'fullName'
        email = data.get('email')
        password = data.get('password')
        
        # Validate required fields
        if not all([email, password, fullName]):
            logger.warning("Missing required fields in signup data")
            raise BadRequest('Missing required fields')

        # Check if user exists
        if db.query(User).filter(User.email == email).first():
            logger.warning(f"Email already exists: {data['email']}")
            raise BadRequest('Email already registered')
        
        # Create new user
        hashed_password = auth_service.get_password_hash(password)
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=fullName
        )
        db.add(user)
        logger.info("[auth.py] About to commit user to database")
        logger.info(f"[auth.py] User data before commit: {user.email}, {user.full_name}")
        db.commit()
        logger.info(f"[auth.py] User committed successfully with ID: {user.id}")
        db.refresh(user)
        
        logger.info(f"User created successfully: {user.email}")
        return jsonify({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name
        })
    except Exception as e:
        logger.error(f"Error in signup: {str(e)}", exc_info=True)
        raise
    finally:
        db.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    db = get_db()
    try:
        data = request.get_json()
        
        logger.info(f"[auth.py] Login attempt for email: {data.get('email')}, password: {data.get('password')}")
        # Validate required fields
        if not all(k in data for k in ('email', 'password')):
            raise BadRequest('Missing required fields')

        user = db.query(User).filter(User.email == data['email']).first()
        if not user or not user.verify_password(data['password']):
            raise Unauthorized('Invalid email or password')
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        access_token = auth_service.create_access_token(user.id)
        return jsonify({
            'access_token': access_token,
            'token_type': 'bearer'
        })
    except Exception as e:
        logger.error(f"Error in login: {str(e)}", exc_info=True)
        raise
    finally:
        db.close() 