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
    print("Connecting to Neon PostgreSQL to drop all tables...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("Connected successfully!")
    except Exception as e:
        print(f"Failed to connect to the database: {e}")
        sys.exit(1)

    # Tables to drop in dependency order (child tables first)
    tables_to_drop = [
        "grade_config",
        "student_marks",
        "class_subject_exams",
        "exams",
        "substitute_requests",
        "leave_requests",
        "audit_logs",
        "student_attendance",
        "attendance_records",
        "holidays",
        "class_subjects",
        "subjects",
        "students",
        "classes",
        "users",
        "departments"
    ]

    try:
        with conn.cursor() as cur:
            for table in tables_to_drop:
                print(f"Dropping table: {table} (if exists)...")
                cur.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
            
            conn.commit()
            print("\nAll database tables dropped successfully!")
    except Exception as e:
        conn.rollback()
        print(f"\nError dropping tables: {e}")
    finally:
        conn.close()
        print("Connection closed.")

if __name__ == '__main__':
    main()
