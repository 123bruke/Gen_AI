import sqlite3
import glob
import os

storage_dbs = glob.glob("../storage/**/*.db", recursive=True) + glob.glob("**/*.db", recursive=True)
print("Found DBs:", set(storage_dbs))

for db in set(storage_dbs):
    try:
        conn = sqlite3.connect(db)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cur.fetchall()]
        if "user_sessions" in tables:
            cur.execute("PRAGMA table_info(user_sessions)")
            cols = [r[1] for r in cur.fetchall()]
            print(f"{db} user_sessions cols: {cols}")
            if "metadata" not in cols:
                print(f"Adding metadata column to {db}...")
                cur.execute("ALTER TABLE user_sessions ADD COLUMN metadata JSON DEFAULT '{}'")
                conn.commit()
                print("Column added successfully!")
            else:
                print("metadata column already exists.")
        conn.close()
    except Exception as e:
        print(f"Error checking {db}: {e}")
