import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")

def add_otps_table():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS otps (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(100) NOT NULL,
                    otp_code VARCHAR(6) NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    is_used BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            print("Table 'otps' created successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error creating table: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    add_otps_table()
    
    # Append to schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path, 'a') as f:
        f.write("\n\n-- 18. OTPs Table\n")
        f.write("CREATE TABLE IF NOT EXISTS otps (\n")
        f.write("    id SERIAL PRIMARY KEY,\n")
        f.write("    email VARCHAR(100) NOT NULL,\n")
        f.write("    otp_code VARCHAR(6) NOT NULL,\n")
        f.write("    expires_at TIMESTAMP NOT NULL,\n")
        f.write("    is_used BOOLEAN DEFAULT FALSE,\n")
        f.write("    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n")
        f.write(");\n")
    print("Schema updated.")
