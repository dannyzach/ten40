from functools import wraps
from flask import request, g
from werkzeug.exceptions import Unauthorized
from database import get_db
from models.user import User
from .jwt import decode_token
import logging

logger = logging.getLogger(__name__)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        logger.debug(f"Auth header: {auth_header}")  # Debug log
        
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.error("No valid auth header")  # Debug log
            raise Unauthorized('No valid authentication token')
            
        token = auth_header.split(' ')[1]
        try:
            payload = decode_token(token)
            user_id = payload['user_id']
            db = get_db()
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                logger.error(f"User not found: {user_id}")  # Debug log
                raise Unauthorized('User not found')
                
            g.user = user
            
        except Exception as e:
            logger.error(f"Auth error: {str(e)}")  # Debug log
            raise Unauthorized('Invalid authentication token')
            
        return f(*args, **kwargs)
            
    return decorated 