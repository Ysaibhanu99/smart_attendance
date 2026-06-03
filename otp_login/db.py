import os
import psycopg2
from psycopg2.extras import DictCursor
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    conn = psycopg2.connect(
        os.getenv('DATABASE_URL'),
        cursor_factory=DictCursor
    )
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')

    # Create otps table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS otps (
            id SERIAL PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            otp_code VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            is_used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

if __name__ == '__main__':
    # Initialize the database when this script is run directly
    if os.getenv('DATABASE_URL'):
        print("Initializing database tables...")
        init_db()
        print("Tables created successfully.")
    else:
        print("Error: DATABASE_URL not found in .env file.")
