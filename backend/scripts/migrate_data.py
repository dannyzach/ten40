import sqlite3
import sys
import os
from passlib.context import CryptContext
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def migrate_data():
    # Connect to old database
    old_conn = sqlite3.connect('data/receipts.db.backup')
    old_cursor = old_conn.cursor()
    
    # Connect to new database
    new_conn = sqlite3.connect('data/receipts.db')
    new_cursor = new_conn.cursor()
    
    try:
        # Get table structure
        old_cursor.execute('PRAGMA table_info(receipts)')
        columns = [column[1] for column in old_cursor.fetchall()]
        columns_str = ', '.join(columns)
        
        # Get all receipts from old database
        old_cursor.execute(f'SELECT {columns_str} FROM receipts')
        receipts = old_cursor.fetchall()
        
        # Create a default user with hashed password
        hashed_password = pwd_context.hash("change_this_password")
        new_cursor.execute('''
            INSERT INTO users (email, hashed_password, full_name, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', ('admin@example.com', hashed_password, 'Admin User'))
        user_id = new_cursor.lastrowid
        
        # Insert receipts with the new user_id
        placeholders = ', '.join(['?' for _ in columns])
        for receipt in receipts:
            # Add user_id to the beginning of values
            values = (user_id,) + receipt
            new_cursor.execute(f'''
                INSERT INTO receipts (user_id, {columns_str})
                VALUES (?, {placeholders})
            ''', values)
        
        new_conn.commit()
        print(f"Data migration completed successfully!")
        print(f"Migrated {len(receipts)} receipts to user_id: {user_id}")
        print(f"Default user created: admin@example.com (password: change_this_password)")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        new_conn.rollback()
    finally:
        old_conn.close()
        new_conn.close()

if __name__ == "__main__":
    migrate_data() 