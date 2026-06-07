import psycopg2, os
from dotenv import load_dotenv
load_dotenv()

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute("SELECT s.roll_number, u.email FROM users u LEFT JOIN students s ON u.id = s.user_id WHERE u.email='bhanuyedla0@gmail.com'")
res = cur.fetchall()
print('Match:', res)

# Free up the email
cur.execute("UPDATE users SET email='temp_' || id || '@college.edu' WHERE email='bhanuyedla0@gmail.com'")

# Assign it to 22BCA003
cur.execute("UPDATE users SET email='bhanuyedla0@gmail.com', is_registered=FALSE WHERE id = (SELECT user_id FROM students WHERE roll_number='22BCA003')")

conn.commit()
print("Updated student 22BCA003 email to bhanuyedla0@gmail.com")
conn.close()
