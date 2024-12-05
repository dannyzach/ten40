from models.database import SessionLocal, Receipt
import os

def clean_receipt_paths():
    db = SessionLocal()
    try:
        # Get all receipts
        receipts = db.query(Receipt).all()
        
        for receipt in receipts:
            if receipt.image_path and '/' in receipt.image_path:
                # Extract just the filename from the full path
                old_path = receipt.image_path
                filename = os.path.basename(old_path)
                
                print(f"Updating receipt {receipt.id}:")
                print(f"  Old path: {old_path}")
                print(f"  New path: {filename}")
                
                # Update the path in the database
                receipt.image_path = filename
        
        # Commit the changes
        db.commit()
        print("\nDatabase updated successfully!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    clean_receipt_paths() 