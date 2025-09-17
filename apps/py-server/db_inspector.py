# db_inspector.py
from sqlalchemy import inspect
from db.database import engine
from db import models  # just import to register tables; relative to db package

def list_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Tables in database:")
    for t in tables:
        print(f"- {t}")
    return tables

def describe_table(table_name):
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    print(f"\nColumns in '{table_name}':")
    for col in columns:
        print(f"  {col['name']} ({col['type']}) Nullable: {col['nullable']}")

def main():
    tables = list_tables()
    while True:
        table = input("\nEnter table name to see columns (or 'exit' to quit): ").strip()
        if table.lower() == 'exit':
            break
        if table not in tables:
            print("Table not found! Try again.")
            continue
        describe_table(table)

if __name__ == "__main__":
    main()
