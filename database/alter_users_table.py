import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            # 1. Add is_registered column if it doesn't exist
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS is_registered BOOLEAN DEFAULT FALSE;
            """)

            # 2. Make password_hash nullable (drop NOT NULL constraint)
            cur.execute("""
                ALTER TABLE users 
                ALTER COLUMN password_hash DROP NOT NULL;
            """)

            # 3. Mark demo/staff accounts as registered so they can log in immediately
            cur.execute("""
                UPDATE users SET is_registered = TRUE
                WHERE role IN ('admin', 'hod', 'faculty');
            """)

            conn.commit()
            print("Migration complete:")
            print("  - Added is_registered column")
            print("  - Made password_hash nullable")
            print("  - Marked admin/hod/faculty as pre-registered")
    except Exception as e:
        conn.rollback()
        print(f"Migration error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
