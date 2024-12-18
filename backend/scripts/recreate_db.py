from backend.database import Base, engine
from backend.models.receipt import Receipt

def recreate_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(engine)
    
    print("Creating all tables...")
    Base.metadata.create_all(engine)
    
    print("Database recreation completed successfully!")

if __name__ == "__main__":
    recreate_database() 