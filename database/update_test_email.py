import psycopg2, os
from dotenv import load_dotenv
load_dotenv()

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute("UPDATE users SET email='bhanuyedla0@gmail.com', is_registered=FALSE WHERE id=13")
conn.commit()
print("Updated student 22BCA002 (Priya Nair) email to bhanuyedla0@gmail.com")
conn.close()
