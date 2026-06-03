import os
import sys
import psycopg2
# pyrefly: ignore [missing-import]
from dotenv import  load_dotenv

# Try loading from the root directory first, then the current directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL is not set in the environment or .env file.")
    sys.exit(1)

def execute_sql_file(conn, file_path):
    print(f"Executing: {os.path.basename(file_path)}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    with conn.cursor() as cur:
        try:
            cur.execute(sql_content)
            conn.commit()
            print(f"Successfully applied {os.path.basename(file_path)}!")
        except Exception as e:
            conn.rollback()
            print(f"Error applying {os.path.basename(file_path)}: {e}")
            raise e

def main():
    print("Connecting to Neon PostgreSQL...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("Connected successfully!")
    except Exception as e:
        print(f"Failed to connect to the database: {e}")
        sys.exit(1)

    try:
        # Run schema
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        execute_sql_file(conn, schema_path)
        
        # Run seed
        seed_path = os.path.join(os.path.dirname(__file__), 'seed.sql')
        execute_sql_file(conn, seed_path)
        
        print("\nDatabase migration and seeding completed successfully!")
    except Exception as e:
        print(f"\nMigration failed: {e}")
    finally:
        conn.close()
        print("Connection closed.")

if __name__ == '__main__':
    main()
