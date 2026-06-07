import psycopg2, os
from dotenv import load_dotenv
load_dotenv()

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

def dump_schema(table_name):
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name=%s", (table_name,))
    print(f"--- {table_name.upper()} ---")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]}")

tables = ['departments', 'classes', 'subjects', 'users', 'students', 'attendance', 'marks']
for t in tables:
    dump_schema(t)
    
conn.close()
