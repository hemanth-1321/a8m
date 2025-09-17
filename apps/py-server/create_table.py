from db.database import engine, Base
from db import models  # Import to register all models

def create_tables():
    """Create all tables defined in models"""
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")

if __name__ == "__main__":
    create_tables()