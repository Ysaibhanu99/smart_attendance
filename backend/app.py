import os
import sys
import psycopg2
import psycopg2.extras
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load env variables from root or current directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL is not set in environment.")
    sys.exit(1)

frontend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static_frontend'))
app = Flask(__name__, static_folder=frontend_folder, static_url_path='')
CORS(app)  # Enable CORS for frontend compatibility

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, '404.html'), 404


def get_db_connection():
    # Returns a connection that retrieves records as dictionaries
    conn = psycopg2.connect(DATABASE_URL)
    return conn

# Helper: Execute SELECT queries and return results
def db_query(query, params=None, fetchone=False):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, params)
            if fetchone:
                return cur.fetchone()
            return cur.fetchall()
    finally:
        conn.close()

# Helper: Execute INSERT/UPDATE/DELETE queries
def db_execute(query, params=None):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# ── 1. AUTHENTICATION ENDPOINT ─────────────────────────────────
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Query user details
    user = db_query("""
        SELECT u.id, u.name, u.email, u.role, u.avatar, u.password_hash, d.name as dept
        FROM users u
        LEFT JOIN departments d ON u.dept_id = d.id
        WHERE u.email = %s
    """, (email,), fetchone=True)

    if not user or user['password_hash'] != password:
        return jsonify({"error": "Invalid email or password"}), 401

    # Simple session token simulation (just returns user model details)
    user_data = {
        "id": user['id'],
        "name": user['name'],
        "email": user['email'],
        "role": user['role'],
        "dept": user['dept'] or 'All',
        "avatar": user['avatar'] or user['name'][0].upper()
    }
    
    # If student, retrieve their roll number and class code
    if user['role'] == 'student':
        student_info = db_query("""
            SELECT s.roll_number, c.code as class_code
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.user_id = %s
        """, (user['id'],), fetchone=True)
        if student_info:
            user_data["roll"] = student_info['roll_number']
            user_data["class_code"] = student_info['class_code']

    return jsonify({"token": f"mock-jwt-token-{user['id']}", "user": user_data})


# ── 2. NOTIFICATIONS ENDPOINT ──────────────────────────────────
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400

    notifications = db_query("""
        SELECT id, type, title, message, read_status, 
               TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as date
        FROM notifications
        WHERE recipient_id = %s
        ORDER BY created_at DESC
    """, (user_id,))
    return jsonify(notifications)

@app.route('/api/notifications/<int:notif_id>/read', methods=['POST'])
def mark_notification_read(notif_id):
    db_execute("""
        UPDATE notifications
        SET read_status = TRUE
        WHERE id = %s
    """, (notif_id,))
    return jsonify({"success": True})


# ── 3. DASHBOARD STATS ENDPOINT ────────────────────────────────
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    role = request.args.get('role')
    user_id = request.args.get('user_id')

    if not role:
        return jsonify({"error": "role parameter is required"}), 400

    stats = {}

    if role == 'admin':
        # Admin Stats
        depts_count = db_query("SELECT COUNT(*) FROM departments", fetchone=True)['count']
        students_count = db_query("SELECT COUNT(*) FROM students", fetchone=True)['count']
        faculty_count = db_query("SELECT COUNT(*) FROM users WHERE role = 'faculty'", fetchone=True)['count']
        holidays_count = db_query("SELECT COUNT(*) FROM holidays", fetchone=True)['count']
        
        # Calculate Average Attendance
        avg_att = db_query("""
            SELECT ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 1) as avg
            FROM student_attendance
        """, fetchone=True)['avg'] or 85.0

        # Calculate At Risk (attendance < 75% overall)
        at_risk = db_query("""
            SELECT COUNT(distinct student_id) as count FROM (
                SELECT student_id, 
                       (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as pct
                FROM student_attendance
                GROUP BY student_id
            ) s WHERE s.pct < 75
        """, fetchone=True)['count']

        stats = {
            "departments": depts_count,
            "students": students_count,
            "faculty": faculty_count,
            "holidays": holidays_count,
            "avg_attendance": float(avg_att),
            "at_risk": at_risk
        }

    elif role == 'hod':
        # HOD Stats (CSE as example if user_id dept matches)
        dept_id = db_query("SELECT dept_id FROM users WHERE id = %s", (user_id,), fetchone=True)['dept_id']
        
        students_count = db_query("SELECT COUNT(*) FROM students s JOIN users u ON s.user_id = u.id WHERE u.dept_id = %s", (dept_id,), fetchone=True)['count']
        pending_leaves = db_query("SELECT COUNT(*) FROM leave_requests l JOIN users u ON l.student_id = u.id WHERE u.dept_id = %s AND l.status = 'pending'", (dept_id,), fetchone=True)['count']
        
        # Department average attendance
        avg_att = db_query("""
            SELECT ROUND(AVG(CASE WHEN sa.status = 'present' THEN 100 ELSE 0 END), 1) as avg
            FROM student_attendance sa
            JOIN users u ON sa.student_id = u.id
            WHERE u.dept_id = %s
        """, (dept_id,), fetchone=True)['avg'] or 85.0

        # Department At Risk
        at_risk = db_query("""
            SELECT COUNT(distinct student_id) as count FROM (
                SELECT sa.student_id, 
                       (COUNT(CASE WHEN sa.status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as pct
                FROM student_attendance sa
                JOIN users u ON sa.student_id = u.id
                WHERE u.dept_id = %s
                GROUP BY sa.student_id
            ) s WHERE s.pct < 75
        """, (dept_id,), fetchone=True)['count']

        stats = {
            "students": students_count,
            "avg_att": float(avg_att),
            "at_risk": at_risk,
            "pending_leaves": pending_leaves
        }

    elif role == 'faculty':
        # Faculty stats
        subjects_count = db_query("SELECT COUNT(*) FROM class_subjects WHERE faculty_id = %s", (user_id,), fetchone=True)['count']
        students_count = db_query("""
            SELECT COUNT(distinct s.user_id) as count
            FROM students s
            JOIN class_subjects cs ON s.class_id = cs.class_id
            WHERE cs.faculty_id = %s
        """, (user_id,), fetchone=True)['count']

        stats = {
            "subjects": subjects_count,
            "students": students_count,
            "defaulters": 3,
            "classes_today": 3
        }

    elif role == 'student':
        # Student stats
        overall_pct = db_query("""
            SELECT ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 1) as avg
            FROM student_attendance
            WHERE student_id = %s
        """, (user_id,), fetchone=True)['avg'] or 78.0

        total_present = db_query("SELECT COUNT(*) FROM student_attendance WHERE student_id = %s AND status = 'present'", (user_id,), fetchone=True)['count']
        total_absent = db_query("SELECT COUNT(*) FROM student_attendance WHERE student_id = %s AND status = 'absent'", (user_id,), fetchone=True)['count']

        stats = {
            "overall_pct": float(overall_pct),
            "total_present": total_present,
            "total_absent": total_absent,
            "at_risk_count": 1 if overall_pct < 75 else 0
        }

    return jsonify(stats)


# ── 4. DEPARTMENTS & USERS ENDPOINTS ───────────────────────────
@app.route('/api/departments', methods=['GET'])
def get_departments():
    departments = db_query("""
        SELECT d.id, d.name, u.name as hod, 
               (SELECT COUNT(*) FROM students s WHERE s.class_id IN (SELECT id FROM classes WHERE dept_id = d.id)) as students,
               (SELECT COUNT(*) FROM users WHERE dept_id = d.id AND role = 'faculty') as faculty
        FROM departments d
        LEFT JOIN users u ON d.hod_id = u.id
    """)
    return jsonify(departments)

@app.route('/api/users', methods=['GET'])
def get_users():
    users = db_query("""
        SELECT name, email, role, status, TO_CHAR(joined_date, 'YYYY-MM-DD') as joined
        FROM users
        ORDER BY role, name
    """)
    return jsonify(users)

@app.route('/api/holidays', methods=['GET'])
def get_holidays():
    holidays = db_query("""
        SELECT id, name, TO_CHAR(holiday_date, 'YYYY-MM-DD') as date, type, recurring
        FROM holidays
        ORDER BY holiday_date
    """)
    return jsonify(holidays)


# ── 5. ATTENDANCE ENDPOINTS ────────────────────────────────────
@app.route('/api/attendance/classes', methods=['GET'])
def get_faculty_classes():
    faculty_id = request.args.get('faculty_id')
    classes = db_query("""
        SELECT c.id, c.code, c.label, s.name as subject, s.id as subject_id
        FROM class_subjects cs
        JOIN classes c ON cs.class_id = c.id
        JOIN subjects s ON cs.subject_id = s.id
        WHERE cs.faculty_id = %s
    """, (faculty_id,))
    return jsonify(classes)

@app.route('/api/attendance/students', methods=['GET'])
def get_attendance_students():
    class_id = request.args.get('class_id')
    students = db_query("""
        SELECT u.id, s.roll_number as roll, u.name
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.class_id = %s
        ORDER BY s.roll_number
    """, (class_id,))
    return jsonify(students)

@app.route('/api/attendance/submit', methods=['POST'])
def submit_attendance():
    data = request.json or {}
    class_id = data.get('class_id')
    subject_id = data.get('subject_id')
    faculty_id = data.get('faculty_id')
    attendance_date = data.get('date')
    period = data.get('period')
    time_slot = data.get('time_slot', '9:00-9:50')
    records = data.get('records', [])  # list of { student_id, status }

    # Save attendance record session
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Check if record exists
            cur.execute("""
                SELECT id FROM attendance_records
                WHERE class_id = %s AND subject_id = %s AND attendance_date = %s AND period = %s
            """, (class_id, subject_id, attendance_date, period))
            row = cur.fetchone()
            
            if row:
                record_id = row[0]
            else:
                cur.execute("""
                    INSERT INTO attendance_records (class_id, subject_id, faculty_id, attendance_date, period, time_slot, marked)
                    VALUES (%s, %s, %s, %s, %s, %s, TRUE) RETURNING id
                """, (class_id, subject_id, faculty_id, attendance_date, period, time_slot))
                record_id = cur.fetchone()[0]

            # Upsert individual student attendance
            for rec in records:
                cur.execute("""
                    INSERT INTO student_attendance (attendance_record_id, student_id, status)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (attendance_record_id, student_id)
                    DO UPDATE SET status = EXCLUDED.status
                """, (record_id, rec['student_id'], rec['status']))
                
                # Dynamic Alert: If student attendance goes under 75% for this subject, create in-app alert
                cur.execute("""
                    SELECT 
                        (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as pct
                    FROM student_attendance sa
                    JOIN attendance_records ar ON sa.attendance_record_id = ar.id
                    WHERE sa.student_id = %s AND ar.subject_id = %s
                """, (rec['student_id'], subject_id))
                pct_row = cur.fetchone()
                
                if pct_row and pct_row[0] is not None and pct_row[0] < 75.0:
                    # Create Alert for Student
                    cur.execute("""
                        INSERT INTO notifications (recipient_id, sender_id, type, title, message)
                        VALUES (%s, %s, 'warning', 'Low Attendance Warning', 'Your attendance in this class is low. Please connect with your faculty.')
                    """, (rec['student_id'], faculty_id))

            conn.commit()
            return jsonify({"success": True, "record_id": record_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


# ── 6. MARKS ENDPOINTS ─────────────────────────────────────────
@app.route('/api/marks/classes', methods=['GET'])
def get_marks_classes():
    faculty_id = request.args.get('faculty_id')
    # Returns classes, subjects and published exams summary
    classes = db_query("""
        SELECT c.id as class_id, c.label, s.name as subject, s.id as subject_id, s.max_marks
        FROM class_subjects cs
        JOIN classes c ON cs.class_id = c.id
        JOIN subjects s ON cs.subject_id = s.id
        WHERE cs.faculty_id = %s
    """, (faculty_id,))
    return jsonify(classes)

@app.route('/api/marks/students', methods=['GET'])
def get_marks_students():
    class_id = request.args.get('class_id')
    subject_id = request.args.get('subject_id')
    exam_id = request.args.get('exam_id')

    students = db_query("""
        SELECT u.id, s.roll_number as roll, u.name, 
               (SELECT marks FROM student_marks WHERE student_id = u.id AND subject_id = %s AND exam_id = %s) as marks
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.class_id = %s
        ORDER BY s.roll_number
    """, (subject_id, exam_id, class_id))
    return jsonify(students)

@app.route('/api/marks/submit', methods=['POST'])
def submit_marks():
    data = request.json or {}
    subject_id = data.get('subject_id')
    exam_id = data.get('exam_id')
    marks_list = data.get('marks', []) # list of { student_id, marks }

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            for item in marks_list:
                cur.execute("""
                    INSERT INTO student_marks (student_id, subject_id, exam_id, marks)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (student_id, subject_id, exam_id)
                    DO UPDATE SET marks = EXCLUDED.marks
                """, (item['student_id'], subject_id, exam_id, item['marks']))
            conn.commit()
            return jsonify({"success": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


# ── 7. LEAVE REQUESTS ENDPOINTS ────────────────────────────────
@app.route('/api/leaves', methods=['GET'])
def get_leaves():
    role = request.args.get('role')
    user_id = request.args.get('user_id')

    if role == 'student':
        leaves = db_query("""
            SELECT id, type, TO_CHAR(from_date, 'YYYY-MM-DD') as "from", 
                   TO_CHAR(to_date, 'YYYY-MM-DD') as "to", status
            FROM leave_requests
            WHERE student_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
    elif role == 'hod':
        # HOD gets leave requests from their department
        dept_id = db_query("SELECT dept_id FROM users WHERE id = %s", (user_id,), fetchone=True)['dept_id']
        leaves = db_query("""
            SELECT l.id, u.name, l.type, TO_CHAR(l.from_date, 'YYYY-MM-DD') as "from", 
                   TO_CHAR(l.to_date, 'YYYY-MM-DD') as "to", l.reason, l.status
            FROM leave_requests l
            JOIN users u ON l.student_id = u.id
            WHERE u.dept_id = %s
            ORDER BY l.created_at DESC
        """, (dept_id,))
    else:
        leaves = db_query("""
            SELECT l.id, u.name, l.type, TO_CHAR(l.from_date, 'YYYY-MM-DD') as "from", 
                   TO_CHAR(l.to_date, 'YYYY-MM-DD') as "to", l.reason, l.status
            FROM leave_requests l
            JOIN users u ON l.student_id = u.id
            ORDER BY l.created_at DESC
        """)
        
    return jsonify(leaves)

@app.route('/api/leaves/apply', methods=['POST'])
def apply_leave():
    data = request.json or {}
    student_id = data.get('student_id')
    leave_type = data.get('type')
    from_date = data.get('from')
    to_date = data.get('to')
    reason = data.get('reason')

    db_execute("""
        INSERT INTO leave_requests (student_id, type, from_date, to_date, reason, status)
        VALUES (%s, %s, %s, %s, %s, 'pending')
    """, (student_id, leave_type, from_date, to_date, reason))
    
    return jsonify({"success": True})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
