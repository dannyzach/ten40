from datetime import datetime
from decimal import Decimal
from models.database import get_db, Receipt, ExpenseCategory

def convert_amount(amount_str):
    """Convert amount string to Decimal"""
    if not amount_str or amount_str == 'Missing':
        return Decimal('0.00')
    # Remove currency symbols and convert to Decimal
    cleaned = amount_str.replace('$', '').replace(',', '').strip()
    try:
        return Decimal(cleaned)
    except:
        return Decimal('0.00')

def convert_date(date_str):
    """Convert date string to datetime"""
    if not date_str or date_str == 'Missing':
        return datetime.utcnow()
    try:
        # Add more date formats as needed
        for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y']:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return datetime.utcnow()
    except:
        return datetime.utcnow()

def convert_category(category_str):
    """Convert category string to ExpenseCategory enum"""
    if not category_str or category_str == 'Missing':
        return ExpenseCategory.OTHER
    
    # Try to match with enum values
    try:
        return next(
            (cat for cat in ExpenseCategory 
             if cat.value.lower() == category_str.lower()),
            ExpenseCategory.OTHER
        )
    except:
        return ExpenseCategory.OTHER

def migrate_data():
    """Migrate existing receipt data to new schema"""
    with get_db() as db:
        receipts = db.query(Receipt).all()
        
        for receipt in receipts:
            # Convert amount to Decimal
            receipt.amount = convert_amount(receipt.amount)
            
            # Convert date to datetime
            receipt.date = convert_date(receipt.date)
            
            # Convert category to enum
            receipt.category = convert_category(receipt.category)
        
        db.commit()

if __name__ == '__main__':
    migrate_data()
    print("Migration completed successfully") 