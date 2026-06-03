-- Smart Attendance System Database Schema
-- Compatible with PostgreSQL / standard relational databases

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS grade_config CASCADE;
DROP TABLE IF EXISTS student_marks CASCADE;
DROP TABLE IF EXISTS class_subject_exams CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS substitute_requests CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS student_attendance CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS class_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 1. Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    hod_id INT -- Foreign key to users(id) to be added after users table is created
);

-- 2. Users Table
-- Holds accounts for Admin, HODs, Faculty, and Students
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL until user registers and sets password
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'hod', 'faculty', 'student')),
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_registered BOOLEAN DEFAULT FALSE, -- TRUE after OTP verification + password set
    joined_date DATE DEFAULT CURRENT_DATE,
    avatar VARCHAR(5)
);

-- Add circular Foreign Key reference from departments to users (HOD)
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_hod 
FOREIGN KEY (hod_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Classes Table
-- Represents distinct classrooms / student cohorts (e.g. CSE 2nd Year, Section A)
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'cse-2a'
    label VARCHAR(100) NOT NULL,     -- e.g. 'CSE – 2nd Year, Section A'
    year VARCHAR(20) NOT NULL,       -- e.g. '1st Year', '2nd Year', '3rd Year'
    section VARCHAR(5) NOT NULL,     -- e.g. 'A', 'B'
    dept_id INT REFERENCES departments(id) ON DELETE CASCADE,
    class_teacher_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Students Table
-- Extension of Users table with student-specific details
CREATE TABLE students (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    class_id INT REFERENCES classes(id) ON DELETE SET NULL
);

-- 5. Subjects Table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Theory', 'Lab', 'Minor')),
    threshold_percent INT DEFAULT 75,
    max_marks INT DEFAULT 100
);

-- 6. Class-Subject Assignment (Course Offerings)
-- Links classes to the subjects taught in them and the faculty taking them
CREATE TABLE class_subjects (
    class_id INT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id INT REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (class_id, subject_id)
);

-- 7. Holidays Table
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    holiday_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('National', 'Festival', 'Regional', 'College')),
    recurring BOOLEAN DEFAULT TRUE
);

-- 8. Attendance Records Table
-- Represents a single attendance session marked by a faculty member
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id INT REFERENCES users(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL,
    period INT NOT NULL,
    time_slot VARCHAR(50), -- e.g. '9:00-9:50'
    marked BOOLEAN DEFAULT FALSE,
    UNIQUE (class_id, subject_id, attendance_date, period)
);

-- 9. Student Attendance Details Table
-- Individual presence/absence record for each student in a session
CREATE TABLE student_attendance (
    attendance_record_id INT REFERENCES attendance_records(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'excused')),
    remarks VARCHAR(255),
    PRIMARY KEY (attendance_record_id, student_id)
);

-- 10. Audit Logs Table (Attendance Corrections)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    old_status VARCHAR(20) CHECK (old_status IN ('present', 'absent', 'excused')),
    new_status VARCHAR(20) CHECK (new_status IN ('present', 'absent', 'excused')),
    changed_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Leave Requests Table
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Medical', 'Official')),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    processed_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Substitute Requests Table (Faculty Coverages)
CREATE TABLE substitute_requests (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    period INT NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    original_faculty_id INT REFERENCES users(id) ON DELETE CASCADE,
    requested_faculty_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'accepted', 'declined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Exams Table
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- 'Internal 1', 'Internal 2', 'Mid-Term', 'Pre-Final'
);

-- 14. Class Subject Exams Publishing Status
CREATE TABLE class_subject_exams (
    class_id INT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (class_id, subject_id, exam_id)
);

-- 15. Student Marks Table
CREATE TABLE student_marks (
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
    marks INT, -- Nullable if not yet entered or published
    PRIMARY KEY (student_id, subject_id, exam_id)
);

-- 16. Grade Configuration Table
CREATE TABLE grade_config (
    id SERIAL PRIMARY KEY,
    min_score INT NOT NULL,
    grade VARCHAR(5) NOT NULL,
    label VARCHAR(50) NOT NULL,
    color VARCHAR(10) NOT NULL
);

-- 17. Notifications Table (In-app Alerts Center)
-- Used for real-time low attendance warnings and administrative reports
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('warning', 'info', 'leave', 'system')),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
