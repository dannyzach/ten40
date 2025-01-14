import jwt
from datetime import datetime, timedelta
from config import config

def create_access_token(user_id: int) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(minutes=60),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, config.jwt_secret_key, algorithm='HS256')

def decode_token(token: str) -> dict:
    return jwt.decode(token, config.jwt_secret_key, algorithms=['HS256']) 