import random
import datetime

# Configuration
majors = [
    (1, 'BCA', None),
    (2, 'Bsc.computers', None),
    (3, 'Bsc.physics', None),
    (4, 'Bsc.chemistry', None),
    (5, 'Bsc.zoology', None),
    (6, 'Bsc.mathematics', None),
    (7, 'Bsc.data Science', None),
    (8, 'BBA', None),
    (9, 'B.Com', None)
]

minors = [
    (1, 'computers', 2),
    (2, 'mathematics', 6),
    (3, 'physics', 3),
    (4, 'chemistry', 4),
    (5, 'electronics', 3),
    (6, 'statics', 6)
]

sql = "-- Seed Data for Degree College System\n\n"

sql += "INSERT INTO departments (id, name, hod_id) VALUES\n"
sql += ",\n".join([f"({m[0]}, '{m[1]}', NULL)" for m in majors]) + ";\n\n"

sql += "INSERT INTO minors (id, name, dept_id) VALUES\n"
sql += ",\n".join([f"({m[0]}, '{m[1]}', {m[2]})" for m in minors]) + ";\n\n"

# 1 Principal + 9 HODs + 9 Faculty
users = [
    "(1, 'Dr. Ramesh Kumar', 'principal@college.edu', 'admin123', 'admin', NULL, 'active', '2024-06-01', 'R', true)"
]

# Create 9 HODs
hods = [
    (2, 'Dr. BCA Hod', 'hod.bca@college.edu', 1),
    (3, 'Dr. CS Hod', 'hod.cs@college.edu', 2),
    (4, 'Dr. Physics Hod', 'hod.phy@college.edu', 3),
    (5, 'Dr. Chem Hod', 'hod.chem@college.edu', 4),
    (6, 'Dr. Zoo Hod', 'hod.zoo@college.edu', 5),
    (7, 'Dr. Math Hod', 'hod.math@college.edu', 6),
    (8, 'Dr. DS Hod', 'hod.ds@college.edu', 7),
    (9, 'Dr. BBA Hod', 'hod.bba@college.edu', 8),
    (10, 'Dr. Bcom Hod', 'hod.bcom@college.edu', 9)
]
for h in hods:
    users.append(f"({h[0]}, '{h[1]}', '{h[2]}', 'admin123', 'hod', {h[3]}, 'active', '2024-06-05', 'H', true)")

# Create 9 Faculty
faculties = [
    (11, 'Prof. BCA', 'prof.bca@college.edu', 1),
    (12, 'Prof. CS', 'prof.cs@college.edu', 2),
    (13, 'Prof. Physics', 'prof.phy@college.edu', 3),
    (14, 'Prof. Chem', 'prof.chem@college.edu', 4),
    (15, 'Prof. Zoo', 'prof.zoo@college.edu', 5),
    (16, 'Prof. Math', 'prof.math@college.edu', 6),
    (17, 'Prof. DS', 'prof.ds@college.edu', 7),
    (18, 'Prof. BBA', 'prof.bba@college.edu', 8),
    (19, 'Prof. Bcom', 'prof.bcom@college.edu', 9)
]
for f in faculties:
    users.append(f"({f[0]}, '{f[1]}', '{f[2]}', 'admin123', 'faculty', {f[3]}, 'active', '2024-06-10', 'P', true)")

# Create Students
student_user_idx = 20
students_list = []
classes_list = []

# Create 1 class per major
for i, m in enumerate(majors):
    dept_id = m[0]
    class_id = i + 1
    code = f"{m[1].replace('.', '').replace(' ', '').lower()}-1a"
    label = f"{m[1]} - 1st Year Section A"
    classes_list.append(f"({class_id}, '{code}', '{label}', '1st Year', 'A', {dept_id}, {10 + dept_id})")
    
    # 5 students per class
    for j in range(5):
        uid = student_user_idx
        student_user_idx += 1
        name = f"Student {uid}"
        email = f"student{uid}@college.edu"
        # generate a unique short code for roll number
        short_code = m[1].replace('Bsc.', 'BS').replace(' ', '').upper()[:4]
        roll = f"24{short_code}{str(j+1).zfill(3)}"
        
        # assign minor if applicable (BCA, BBA, B.Com don't have minors)
        minor_id = "NULL"
        if m[0] not in [1, 8, 9]:
            minor_id = random.choice([x[0] for x in minors])
            
        users.append(f"({uid}, '{name}', '{email}', 'admin123', 'student', {dept_id}, 'active', '2024-07-01', 'S', true)")
        students_list.append(f"({uid}, '{roll}', {class_id}, {minor_id})")

sql += "INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar, is_registered) VALUES\n"
sql += ",\n".join(users) + ";\n\n"

sql += "-- Update Departments to link HODs\n"
for h in hods:
    sql += f"UPDATE departments SET hod_id = {h[0]} WHERE id = {h[3]};\n"
sql += "\n"

sql += "INSERT INTO classes (id, code, label, year, section, dept_id, class_teacher_id) VALUES\n"
sql += ",\n".join(classes_list) + ";\n\n"

sql += "INSERT INTO students (user_id, roll_number, class_id, minor_id) VALUES\n"
sql += ",\n".join(students_list) + ";\n\n"

with open("D:/smart_attendance_project/database/seed.sql", "w") as f:
    f.write(sql)
    
print("seed.sql generated successfully")
