from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import AUTH_SECRET_KEY, TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(self, user_id: int) -> str:
        expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
        data = {"sub": str(user_id), "exp": expire}
        return jwt.encode(data, AUTH_SECRET_KEY, algorithm="HS256")

    def decode_token(self, token: str) -> Optional[int]:
        try:
            payload = jwt.decode(token, AUTH_SECRET_KEY, algorithms=["HS256"])
            return int(payload["sub"])
        except JWTError:
            return None 