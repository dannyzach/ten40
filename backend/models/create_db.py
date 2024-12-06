from database import Base, get_engine

def init_db():
    Base.metadata.drop_all(bind=get_engine())  # Warning: This drops existing tables
    Base.metadata.create_all(bind=get_engine())

if __name__ == '__main__':
    init_db()
    print("Database initialized") 