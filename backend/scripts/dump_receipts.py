import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models.receipt import Receipt

def dump_receipts():
    db = get_db()
    try:
        receipts = db.query(Receipt).all()
        print("\nReceipts in database:")
        print("-" * 80)
        print(f"{'ID':<5} {'Vendor':<20} {'Amount':<10} {'Date':<20} {'User ID':<10}")
        print("-" * 80)
        for receipt in receipts:
            print(f"{receipt.id:<5} {receipt.vendor:<20} {receipt.amount:<10} {receipt.date} {receipt.user_id}")
    finally:
        db.close()

if __name__ == "__main__":
    dump_receipts() 