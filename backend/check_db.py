import psycopg2, os
from dotenv import load_dotenv
load_dotenv()

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

print("--- STUDENTS TABLE ---")
cur.execute("SELECT * FROM students WHERE roll_number = '22BCA004'")
res = cur.fetchall()
colnames = [desc[0] for desc in cur.description]
print(colnames)
print(res)

print("\n--- USERS TABLE ---")
cur.execute("SELECT * FROM users WHERE id = (SELECT user_id FROM students WHERE roll_number = '22BCA004')")
res2 = cur.fetchall()
colnames2 = [desc[0] for desc in cur.description]
print(colnames2)
print(res2)

conn.close()
