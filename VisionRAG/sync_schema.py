import sqlite3
import os
import sys
sys.path.insert(0, os.path.abspath("backend"))
from app.models.postgres_models import Base

db_path = "backend/storage/visionrag_main.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

for table in Base.metadata.sorted_tables:
    table_name = table.name
    cur.execute(f"PRAGMA table_info({table_name})")
    existing_cols = {row[1]: row for row in cur.fetchall()}
    if not existing_cols:
        continue
    
    print(f"Table '{table_name}' existing columns: {list(existing_cols.keys())}")
    for col in table.columns:
        col_name = col.name
        if col_name not in existing_cols:
            col_type = "TEXT"
            if "int" in str(col.type).lower():
                col_type = "INTEGER"
            elif "bool" in str(col.type).lower():
                col_type = "BOOLEAN DEFAULT 0"
            elif "json" in str(col.type).lower():
                col_type = "JSON DEFAULT '{}'"
            elif "datetime" in str(col.type).lower():
                col_type = "DATETIME"
            else:
                col_type = "TEXT DEFAULT ''"
            
            alter_query = f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}"
            print(f"  Adding missing column: {alter_query}")
            try:
                cur.execute(alter_query)
                conn.commit()
                print(f"  Successfully added column '{col_name}' to '{table_name}'")
            except Exception as e:
                print(f"  Error adding column {col_name}: {e}")

conn.close()
print("Schema synchronization completed.")
