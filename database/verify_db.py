import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load connection settings
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL is not set in the environment or .env file.")
    sys.exit(1)

def main():
    print("Connecting to Neon PostgreSQL to verify tables...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("Connected successfully!")
    except Exception as e:
        print(f"Failed to connect to the database: {e}")
        sys.exit(1)

    try:
        with conn.cursor() as cur:
            # Query all user tables in public schema
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cur.fetchall()
            
            print("\nActive Tables in Database:")
            print("=========================")
            for idx, table in enumerate(tables, 1):
                # Count records in each table
                cur.execute(f"SELECT COUNT(*) FROM {table[0]};")
                count = cur.fetchone()[0]
                print(f"{idx}. {table[0]:<25} ({count} rows)")
            
    except Exception as e:
        print(f"\nVerification failed: {e}")
    finally:
        conn.close()
        print("\nConnection closed.")

if __name__ == '__main__':
    main()
