import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models.user import User

def dump_users():
    db = get_db()
    print(f"[dump_users.py] Current working directory: {os.getcwd()}")
    try:
        users = db.query(User).all()
        print("\nUsers in database:")
        print("-" * 80)
        print(f"{'ID':<5} {'Email':<30} {'Full Name':<30} {'Created At':<20} {'Last Login'}")
        print("-" * 80)
        for user in users:
            print(f"{user.id:<5} {user.email:<30} {user.full_name:<30} {user.created_at} {user.last_login or 'Never'}")
    finally:
        db.close()

if __name__ == "__main__":
    dump_users() 