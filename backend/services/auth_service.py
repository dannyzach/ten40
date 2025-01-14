from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
from config import config  # Assuming you have JWT_SECRET_KEY in config

class AuthService:
    def get_password_hash(self, password):
        return generate_password_hash(password, method='scrypt')
        
    def verify_password(self, password, hashed_password):
        return check_password_hash(hashed_password, password)
        
    def create_access_token(self, user_id: int) -> str:
        expires_delta = timedelta(days=1)  # Token expires in 1 day
        expire = datetime.utcnow() + expires_delta
        
        to_encode = {
            "exp": expire,
            "user_id": user_id
        }
        
        encoded_jwt = jwt.encode(to_encode, config.jwt_secret_key, algorithm="HS256")
        return encoded_jwt 