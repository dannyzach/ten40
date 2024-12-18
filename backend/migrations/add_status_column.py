from sqlalchemy import create_engine, text
from backend.config import DATABASE_URL

def upgrade():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # Add status column with 'pending' as default
        connection.execute(text("""
            ALTER TABLE receipts 
            ADD COLUMN status VARCHAR(20) DEFAULT 'pending' NOT NULL;
        """))
        connection.commit()

def downgrade():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        connection.execute(text("""
            ALTER TABLE receipts 
            DROP COLUMN status;
        """))
        connection.commit()

if __name__ == "__main__":
    upgrade() 