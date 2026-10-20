import psycopg
import sys
import os

def main():
    try:
        conn = psycopg.connect("host=127.0.0.1 port=5433 user=postgres dbname=visionrag", autocommit=True)
        print("Connected to PostgreSQL 'visionrag' database!")
        sql_file = os.path.join(os.path.dirname(__file__), "init.sql")
        with open(sql_file, "r", encoding="utf-8") as f:
            sql_statements = f.read()

        with conn.cursor() as cur:
            cur.execute(sql_statements)
            print("Successfully executed database/init.sql!")
            
            # Verify tables
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = [row[0] for row in cur.fetchall()]
            print("PostgreSQL Tables created:", tables)

        conn.close()
        return 0
    except Exception as e:
        print("Error executing init.sql:", e)
        return 1

if __name__ == "__main__":
    sys.exit(main())
