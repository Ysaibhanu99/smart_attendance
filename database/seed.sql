-- Seed Data for Smart Attendance System
-- Populates the database with default configurations, users, classes, subjects, marks, and attendance history

-- 1. Insert Departments
-- Initially HOD IDs are set to NULL to avoid circular dependency issues
INSERT INTO departments (id, name, hod_id) VALUES
(1, 'CSE', NULL),
(2, 'ECE', NULL),
(3, 'MECH', NULL),
(4, 'CIVIL', NULL),
(5, 'IT', NULL);

-- 2. Insert Users (Admin, HODs, Faculty)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(1, 'Dr. Ramesh Kumar', 'principal@college.edu', 'admin123', 'admin', NULL, 'active', '2024-06-01', 'R'),
(2, 'Dr. Anand Kumar', 'hod.cse@college.edu', 'admin123', 'hod', 1, 'active', '2024-06-05', 'A'),
(3, 'Dr. Priya Rao', 'hod.ece@college.edu', 'admin123', 'hod', 2, 'active', '2024-06-05', 'P'),
(4, 'Dr. A. Sharma', 'hod.mech@college.edu', 'admin123', 'hod', 3, 'active', '2024-06-05', 'S'),
(5, 'Dr. K. Reddy', 'hod.civil@college.edu', 'admin123', 'hod', 4, 'active', '2024-06-05', 'K'),
(6, 'Dr. M. Patel', 'hod.it@college.edu', 'admin123', 'hod', 5, 'active', '2024-06-05', 'M'),
(7, 'Prof. John Doe', 'john@cse.edu', 'admin123', 'faculty', 1, 'active', '2024-06-10', 'J'),
(8, 'Prof. Sarah Jenkins', 'sarah@cse.edu', 'admin123', 'faculty', 1, 'active', '2024-06-10', 'S'),
(9, 'Prof. Rajan Verma', 'rajan@ece.edu', 'admin123', 'faculty', 2, 'active', '2024-06-10', 'R'),
(10, 'Prof. R. Krishnan', 'krishnan@mech.edu', 'admin123', 'faculty', 3, 'active', '2024-06-10', 'K'),
(11, 'Prof. S. Kumar', 'kumar@it.edu', 'admin123', 'faculty', 5, 'active', '2024-06-10', 'S');

-- Update Departments to link HODs
UPDATE departments SET hod_id = 2 WHERE id = 1;
UPDATE departments SET hod_id = 3 WHERE id = 2;
UPDATE departments SET hod_id = 4 WHERE id = 3;
UPDATE departments SET hod_id = 5 WHERE id = 4;
UPDATE departments SET hod_id = 6 WHERE id = 5;

-- 3. Insert Classes
INSERT INTO classes (id, code, label, year, section, dept_id, class_teacher_id) VALUES
(1, 'cse-2a', 'CSE – 2nd Year, Section A', '2nd Year', 'A', 1, 7),   -- Prof. John Doe
(2, 'cse-3a', 'CSE – 3rd Year, Section A', '3rd Year', 'A', 1, 2),   -- Dr. Anand Kumar
(3, 'cse-1a', 'CSE – 1st Year, Section A', '1st Year', 'A', 1, 8),   -- Prof. Sarah Jenkins
(4, 'ece-2a', 'ECE – 2nd Year, Section A', '2nd Year', 'A', 2, 9),   -- Prof. Rajan Verma
(5, 'ece-1a', 'ECE – 1st Year, Section A', '1st Year', 'A', 2, 3),   -- Dr. Priya Rao
(6, 'mech-2a', 'MECH – 2nd Year, Section A', '2nd Year', 'A', 3, 4),  -- Dr. A. Sharma
(7, 'civil-2a', 'CIVIL – 2nd Year, Section A', '2nd Year', 'A', 4, 5),-- Dr. K. Reddy
(8, 'it-2a', 'IT – 2nd Year, Section A', '2nd Year', 'A', 5, 6);     -- Dr. M. Patel

-- 4. Insert Subjects
INSERT INTO subjects (id, name, type, threshold_percent, max_marks) VALUES
(1, 'Data Structures', 'Theory', 75, 100),
(2, 'DWDM', 'Theory', 75, 100),
(3, 'Python Lab', 'Lab', 80, 50),
(4, 'Operating Systems', 'Theory', 75, 100),
(5, 'DBMS', 'Theory', 75, 100),
(6, 'Computer Networks', 'Theory', 75, 100),
(7, 'Python Programming', 'Theory', 75, 100),
(8, 'Mathematics I', 'Theory', 75, 100),
(9, 'Signals & Systems', 'Theory', 75, 100),
(10, 'Analog Circuits', 'Theory', 75, 100),
(11, 'Basic Electronics', 'Theory', 75, 100),
(12, 'Engineering Physics', 'Theory', 75, 100),
(13, 'Thermodynamics', 'Theory', 75, 100),
(14, 'Fluid Mechanics', 'Theory', 75, 100),
(15, 'Structural Analysis', 'Theory', 75, 100),
(16, 'Web Technologies', 'Theory', 75, 100),
(17, 'Database Management', 'Theory', 75, 100);

-- Link Subjects to Classes and Faculty
INSERT INTO class_subjects (class_id, subject_id, faculty_id) VALUES
-- cse-2a
(1, 1, 7), (1, 2, 7), (1, 3, 7),
-- cse-3a
(2, 4, 2), (2, 5, 8), (2, 6, 2),
-- cse-1a
(3, 7, 8), (3, 8, 8),
-- ece-2a
(4, 9, 9), (4, 10, 3),
-- ece-1a
(5, 11, 3), (5, 12, 9),
-- mech-2a
(6, 13, 4), (6, 14, 10),
-- civil-2a
(7, 15, 5),
-- it-2a
(8, 16, 6), (8, 17, 11);

-- 5. Insert Students
-- CSE 2nd Year (class 1)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(12, 'Aarav Sharma', 'aarav.sharma@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'A'),
(13, 'Priya Nair', 'priya.nair.cse@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'P'),
(14, 'Rahul Verma', 'rahul.verma@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'R'),
(15, 'Sneha Iyer', 'sneha.iyer@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'S'),
(16, 'Kiran Babu', 'kiran.babu@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'K'),
(17, 'Divya Reddy', 'divya.reddy@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'D'),
(18, 'Arun Pillai', 'arun.pillai@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'A'),
(19, 'Pooja Mehta', 'pooja.mehta@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'P'),
(20, 'Vikram Singh', 'vikram.singh@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'V'),
(21, 'Ananya Kumar', 'ananya.kumar@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'A'),
(22, 'Rohan Das', 'rohan.das@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'R'),
(23, 'Kavya Rao', 'kavya.rao@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'K'),
(24, 'Rahul Sharma', 'rahul@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'R');

INSERT INTO students (user_id, roll_number, class_id) VALUES
(12, '22BCA001', 1),
(13, '22BCA002', 1),
(14, '22BCA003', 1),
(15, '22BCA004', 1),
(16, '22BCA005', 1),
(17, '22BCA006', 1),
(18, '22BCA007', 1),
(19, '22BCA008', 1),
(20, '22BCA009', 1),
(21, '22BCA010', 1),
(22, '22BCA011', 1),
(23, '22BCA012', 1),
(24, '22BCA018', 1);

-- CSE 3rd Year (class 2)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(25, 'Amrita Rao', 'amrita.rao@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'A'),
(26, 'Ravi Teja', 'ravi.teja@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'R'),
(27, 'Sunita Gupta', 'sunita.gupta@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'S'),
(28, 'Manjunath K', 'manjunath.k@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'M'),
(29, 'Lakshmi Priya', 'lakshmi.priya@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'L'),
(30, 'Deepak Nair', 'deepak.nair@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'D'),
(31, 'Pallavi Shah', 'pallavi.shah@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'P'),
(32, 'Sreekanth M', 'sreekanth.m@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'S'),
(33, 'Varsha Reddy', 'varsha.reddy@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'V'),
(34, 'Akash Mehta', 'akash.mehta@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'A');

INSERT INTO students (user_id, roll_number, class_id) VALUES
(25, '23BCA001', 2),
(26, '23BCA002', 2),
(27, '23BCA003', 2),
(28, '23BCA004', 2),
(29, '23BCA005', 2),
(30, '23BCA006', 2),
(31, '23BCA007', 2),
(32, '23BCA008', 2),
(33, '23BCA009', 2),
(34, '23BCA010', 2);

-- CSE 1st Year (class 3)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(35, 'Aryan Mehta', 'aryan.mehta@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'A'),
(36, 'Neha Sharma', 'neha.sharma@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'N'),
(37, 'Rohit Patil', 'rohit.patil@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'R'),
(38, 'Shreya Iyer', 'shreya.iyer@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'S'),
(39, 'Vikram Reddy', 'vikram.reddy@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'V'),
(40, 'Anitha Nair', 'anitha.nair@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'A'),
(41, 'Suresh Kumar', 'suresh.kumar@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'S'),
(42, 'Pooja Singh', 'pooja.singh@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'P'),
(43, 'Karthik Rao', 'karthik.rao@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'K'),
(44, 'Divya Menon', 'divya.menon@cse.edu', 'admin123', 'student', 1, 'active', '2024-07-01', 'D');

INSERT INTO students (user_id, roll_number, class_id) VALUES
(35, '24BCA001', 3),
(36, '24BCA002', 3),
(37, '24BCA003', 3),
(38, '24BCA004', 3),
(39, '24BCA005', 3),
(40, '24BCA006', 3),
(41, '24BCA007', 3),
(42, '24BCA008', 3),
(43, '24BCA009', 3),
(44, '24BCA010', 3);

-- ECE 2nd Year (class 4)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(45, 'Anjali Menon', 'anjali.menon@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'A'),
(46, 'Arjun Pillai', 'arjun.pillai.ece@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'A'),
(47, 'Chitra Sharma', 'chitra.sharma@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'C'),
(48, 'Deepak Patel', 'deepak.patel@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'D'),
(49, 'Esha Rao', 'esha.rao@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'E'),
(50, 'Farhan Sheikh', 'farhan.sheikh@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'F'),
(51, 'Geetha Nair', 'geetha.nair@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'G'),
(52, 'Hari Krishna', 'hari.krishna@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'H'),
(53, 'Ishita Gupta', 'ishita.gupta@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'I'),
(54, 'Jatin Mehta', 'jatin.mehta@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'J');

INSERT INTO students (user_id, roll_number, class_id) VALUES
(45, '22ECE001', 4),
(46, '22ECE002', 4),
(47, '22ECE003', 4),
(48, '22ECE004', 4),
(49, '22ECE005', 4),
(50, '22ECE006', 4),
(51, '22ECE007', 4),
(52, '22ECE008', 4),
(53, '22ECE009', 4),
(54, '22ECE010', 4);

-- ECE 1st Year (class 5)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(55, 'Kavya Menon', 'kavya.menon@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'K'),
(56, 'Lakshman Rao', 'lakshman.rao@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'L'),
(57, 'Meena Iyer', 'meena.iyer@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'M'),
(58, 'Nikhil Sharma', 'nikhil.sharma@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'N'),
(59, 'Omprakash Nair', 'omprakash.nair@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'O'),
(60, 'Pooja Krishnan', 'pooja.krishnan@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'P'),
(61, 'Qasim Ali', 'qasim.ali@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'Q'),
(62, 'Radha Pillai', 'radha.pillai@ece.edu', 'admin123', 'student', 2, 'active', '2024-07-01', 'R'),
(63, 'Priya Nair', 'priya@ece.edu', 'admin123', 'student', 2, 'inactive', '2024-07-01', 'P');

INSERT INTO students (user_id, roll_number, class_id) VALUES
(55, '24ECE001', 5),
(56, '24ECE002', 5),
(57, '24ECE003', 5),
(58, '24ECE004', 5),
(59, '24ECE005', 5),
(60, '24ECE006', 5),
(61, '24ECE007', 5),
(62, '24ECE008', 5),
(63, '22ECE011', 5);

-- MECH 2nd Year (class 6)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(64, 'Abhishek Singh', 'abhishek.singh@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'A'),
(65, 'Bhavesh Patel', 'bhavesh.patel@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'B'),
(66, 'Chandan Kumar', 'chandan.kumar@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'C'),
(67, 'Dhruv Mehta', 'dhruv.mehta@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'D'),
(68, 'Ekta Yadav', 'ekta.yadav@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'E'),
(69, 'Farida Khan', 'farida.khan@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'F'),
(70, 'Ganesh Reddy', 'ganesh.reddy@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'G'),
(71, 'Harshit Verma', 'harshit.verma@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'H'),
(72, 'Indira Nath', 'indira.nath@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'I'),
(73, 'Jayesh Shah', 'jayesh.shah@mech.edu', 'admin123', 'student', 3, 'active', '2024-07-01', 'J');

INSERT INTO students (user_id, roll_number, class_id) VALUES
(64, '22ME001', 6),
(65, '22ME002', 6),
(66, '22ME003', 6),
(67, '22ME004', 6),
(68, '22ME005', 6),
(69, '22ME006', 6),
(70, '22ME007', 6),
(71, '22ME008', 6),
(72, '22ME009', 6),
(73, '22ME010', 6);

-- CIVIL 2nd Year (class 7)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(74, 'Aditya Kumar', 'aditya.kumar@civil.edu', 'admin123', 'student', 4, 'active', '2024-07-01', 'A'),
(75, 'Bhagyashri Rao', 'bhagyashri.rao@civil.edu', 'admin123', 'student', 4, 'active', '2024-07-01', 'B'),
(76, 'Chandrashekhar V', 'chandrashekhar.v@civil.edu', 'admin123', 'student', 4, 'active', '2024-07-01', 'C'),
(77, 'Disha Nair', 'disha.nair@civil.edu', 'admin123', 'student', 4, 'active', '2024-07-01', 'D'),
(78, 'Eshan Desai', 'eshan.desai@civil.edu', 'admin123', 'student', 4, 'active', '2024-07-01', 'E'),
(79, 'Farhana Begum', 'farhana.begum@civil.edu', 'admin123', 'student', 4, 'active', '2024-07-01', 'F'),
(80, 'Gopal Srinivas', 'gopal.srinivas@civil.edu', 'admin123', 'student', 4, 'active', '2024-07-01', 'G'),
(81, 'Harini Menon', 'harini.menon@civil.edu', 'admin123', 'student', 4, 'active', '2024-07-01', 'H');

INSERT INTO students (user_id, roll_number, class_id) VALUES
(74, '22CE001', 7),
(75, '22CE002', 7),
(76, '22CE003', 7),
(77, '22CE004', 7),
(78, '22CE005', 7),
(79, '22CE006', 7),
(80, '22CE007', 7),
(81, '22CE008', 7);

-- IT 2nd Year (class 8)
INSERT INTO users (id, name, email, password_hash, role, dept_id, status, joined_date, avatar) VALUES
(82, 'Arjun Batra', 'arjun.batra@it.edu', 'admin123', 'student', 5, 'active', '2024-07-01', 'A'),
(83, 'Bindu Sharma', 'bindu.sharma@it.edu', 'admin123', 'student', 5, 'active', '2024-07-01', 'B'),
(84, 'Chitresh Gupta', 'chitresh.gupta@it.edu', 'admin123', 'student', 5, 'active', '2024-07-01', 'C'),
(85, 'Deepa Nair', 'deepa.nair@it.edu', 'admin123', 'student', 5, 'active', '2024-07-01', 'D'),
(86, 'Elan Raj', 'elan.raj@it.edu', 'admin123', 'student', 5, 'active', '2024-07-01', 'E'),
(87, 'Fatima Shaikh', 'fatima.shaikh@it.edu', 'admin123', 'student', 5, 'active', '2024-07-01', 'F'),
(88, 'Gaurav Mishra', 'gaurav.mishra@it.edu', 'admin123', 'student', 5, 'active', '2024-07-01', 'G'),
(89, 'Hema Latha', 'hema.latha@it.edu', 'admin123', 'student', 5, 'active', '2024-07-01', 'H');

INSERT INTO students (user_id, roll_number, class_id) VALUES
(82, '22IT001', 8),
(83, '22IT002', 8),
(84, '22IT003', 8),
(85, '22IT004', 8),
(86, '22IT005', 8),
(87, '22IT006', 8),
(88, '22IT007', 8),
(89, '22IT008', 8);

-- 6. Insert Exams
INSERT INTO exams (id, name) VALUES
(1, 'Internal 1'),
(2, 'Internal 2'),
(3, 'Mid-Term'),
(4, 'Pre-Final');

-- 7. Insert Class-Subject-Exams Status
INSERT INTO class_subject_exams (class_id, subject_id, exam_id, published) VALUES
-- cse-2a
(1, 1, 1, true), (1, 1, 2, true), (1, 1, 3, false), (1, 1, 4, false),
(1, 2, 1, true), (1, 2, 2, false), (1, 2, 3, false), (1, 2, 4, false),
(1, 3, 1, true), (1, 3, 2, false), (1, 3, 3, false), (1, 3, 4, false),
-- cse-3a
(2, 4, 1, true), (2, 4, 2, true), (2, 4, 3, false), (2, 4, 4, false),
(2, 5, 1, true), (2, 5, 2, false), (2, 5, 3, false), (2, 5, 4, false),
(2, 6, 1, false), (2, 6, 2, false), (2, 6, 3, false), (2, 6, 4, false),
-- cse-1a
(3, 7, 1, true), (3, 7, 2, false), (3, 7, 3, false), (3, 7, 4, false),
(3, 8, 1, true), (3, 8, 2, false), (3, 8, 3, false), (3, 8, 4, false),
-- ece-2a
(4, 9, 1, true), (4, 9, 2, true), (4, 9, 3, false), (4, 9, 4, false),
(4, 10, 1, true), (4, 10, 2, false), (4, 10, 3, false), (4, 10, 4, false),
-- ece-1a
(5, 11, 1, true), (5, 11, 2, false), (5, 11, 3, false), (5, 11, 4, false),
(5, 12, 1, true), (5, 12, 2, false), (5, 12, 3, false), (5, 12, 4, false),
-- mech-2a
(6, 13, 1, true), (6, 13, 2, true), (6, 13, 3, false), (6, 13, 4, false),
(6, 14, 1, true), (6, 14, 2, false), (6, 14, 3, false), (6, 14, 4, false),
-- civil-2a
(7, 15, 1, true), (7, 15, 2, true), (7, 15, 3, false), (7, 15, 4, false),
-- it-2a
(8, 16, 1, true), (8, 16, 2, true), (8, 16, 3, false), (8, 16, 4, false),
(8, 17, 1, true), (8, 17, 2, false), (8, 17, 3, false), (8, 17, 4, false);

-- 8. Insert Student Marks
-- Class cse-2a, Data Structures (subject 1)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(12, 1, 1, 78), (12, 1, 2, 82),
(13, 1, 1, 88), (13, 1, 2, 91),
(14, 1, 1, 45), (14, 1, 2, 52),
(15, 1, 1, 72), (15, 1, 2, 68),
(16, 1, 1, 55), (16, 1, 2, 60),
(17, 1, 1, 92), (17, 1, 2, 95),
(18, 1, 1, 40), (18, 1, 2, 38),
(19, 1, 1, 83), (19, 1, 2, 79),
(20, 1, 1, 67), (20, 1, 2, 71),
(21, 1, 1, 90), (21, 1, 2, 88);

-- Class cse-2a, DWDM (subject 2)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(12, 2, 1, 80), (13, 2, 1, 92), (14, 2, 1, 50), (15, 2, 1, 74), (16, 2, 1, 61),
(17, 2, 1, 88), (18, 2, 1, 43), (19, 2, 1, 76), (20, 2, 1, 69), (21, 2, 1, 85);

-- Class cse-2a, Python Lab (subject 3)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(12, 3, 1, 44), (13, 3, 1, 48), (14, 3, 1, 30), (15, 3, 1, 40), (16, 3, 1, 35),
(17, 3, 1, 49), (18, 3, 1, 28), (19, 3, 1, 45), (20, 3, 1, 38), (21, 3, 1, 47);

-- Class cse-3a, Operating Systems (subject 4)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(25, 4, 1, 82), (25, 4, 2, 85),
(26, 4, 1, 74), (26, 4, 2, 70),
(27, 4, 1, 90), (27, 4, 2, 93),
(28, 4, 1, 55), (28, 4, 2, 60),
(29, 4, 1, 78), (29, 4, 2, 80),
(30, 4, 1, 65), (30, 4, 2, 68),
(31, 4, 1, 88), (31, 4, 2, 91),
(32, 4, 1, 42), (32, 4, 2, 48),
(33, 4, 1, 79), (33, 4, 2, 83),
(34, 4, 1, 95), (34, 4, 2, 97);

-- Class cse-3a, DBMS (subject 5)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(25, 5, 1, 77), (26, 5, 1, 60), (27, 5, 1, 88), (28, 5, 1, 50), (29, 5, 1, 72),
(30, 5, 1, 63), (31, 5, 1, 84), (32, 5, 1, 38), (33, 5, 1, 76), (34, 5, 1, 91);

-- Class cse-1a, Python Programming (subject 7)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(35, 7, 1, 85), (36, 7, 1, 91), (37, 7, 1, 62), (38, 7, 1, 78), (39, 7, 1, 55),
(40, 7, 1, 88), (41, 7, 1, 70), (42, 7, 1, 94), (43, 7, 1, 48), (44, 7, 1, 82);

-- Class cse-1a, Mathematics I (subject 8)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(35, 8, 1, 72), (36, 8, 1, 88), (37, 8, 1, 45), (38, 8, 1, 79), (39, 8, 1, 50),
(40, 8, 1, 83), (41, 8, 1, 60), (42, 8, 1, 90), (43, 8, 1, 38), (44, 8, 1, 75);

-- Class ece-2a, Signals & Systems (subject 9)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(45, 9, 1, 74), (45, 9, 2, 79),
(46, 9, 1, 65), (46, 9, 2, 70),
(47, 9, 1, 88), (47, 9, 2, 91),
(48, 9, 1, 52), (48, 9, 2, 58),
(49, 9, 1, 93), (49, 9, 2, 95),
(50, 9, 1, 41), (50, 9, 2, 45),
(51, 9, 1, 79), (51, 9, 2, 82),
(52, 9, 1, 60), (52, 9, 2, 63),
(53, 9, 1, 85), (53, 9, 2, 88),
(54, 9, 1, 70), (54, 9, 2, 74);

-- Class ece-2a, Analog Circuits (subject 10)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(45, 10, 1, 68), (46, 10, 1, 55), (47, 10, 1, 84), (48, 10, 1, 44), (49, 10, 1, 90),
(50, 10, 1, 38), (51, 10, 1, 76), (52, 10, 1, 58), (53, 10, 1, 80), (54, 10, 1, 64);

-- Class ece-1a, Basic Electronics (subject 11)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(55, 11, 1, 80), (56, 11, 1, 72), (57, 11, 1, 91), (58, 11, 1, 55),
(59, 11, 1, 67), (60, 11, 1, 88), (61, 11, 1, 43), (62, 11, 1, 78);

-- Class ece-1a, Engineering Physics (subject 12)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(55, 12, 1, 75), (56, 12, 1, 68), (57, 12, 1, 88), (58, 12, 1, 49),
(59, 12, 1, 62), (60, 12, 1, 83), (61, 12, 1, 37), (62, 12, 1, 74);

-- Class mech-2a, Thermodynamics (subject 13)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(64, 13, 1, 62), (64, 13, 2, 65),
(65, 13, 1, 78), (65, 13, 2, 80),
(66, 13, 1, 55), (66, 13, 2, 52),
(67, 13, 1, 88), (67, 13, 2, 92),
(68, 13, 1, 70), (68, 13, 2, 73),
(69, 13, 1, 45), (69, 13, 2, 40),
(70, 13, 1, 83), (70, 13, 2, 87),
(71, 13, 1, 67), (71, 13, 2, 69),
(72, 13, 1, 91), (72, 13, 2, 94),
(73, 13, 1, 58), (73, 13, 2, 62);

-- Class mech-2a, Fluid Mechanics (subject 14)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(64, 14, 1, 58), (65, 14, 1, 72), (66, 14, 1, 48), (67, 14, 1, 85), (68, 14, 1, 66),
(69, 14, 1, 38), (70, 14, 1, 79), (71, 14, 1, 63), (72, 14, 1, 88), (73, 14, 1, 54);

-- Class civil-2a, Structural Analysis (subject 15)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(74, 15, 1, 82), (74, 15, 2, 85),
(75, 15, 1, 74), (75, 15, 2, 77),
(76, 15, 1, 55), (76, 15, 2, 60),
(77, 15, 1, 91), (77, 15, 2, 93),
(78, 15, 1, 68), (78, 15, 2, 70),
(79, 15, 1, 42), (79, 15, 2, 48),
(80, 15, 1, 79), (80, 15, 2, 81),
(81, 15, 1, 88), (81, 15, 2, 90);

-- Class it-2a, Web Technologies (subject 16)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(82, 16, 1, 87), (82, 16, 2, 90),
(83, 16, 1, 73), (83, 16, 2, 76),
(84, 16, 1, 60), (84, 16, 2, 65),
(85, 16, 1, 94), (85, 16, 2, 97),
(86, 16, 1, 50), (86, 16, 2, 55),
(87, 16, 1, 79), (87, 16, 2, 82),
(88, 16, 1, 66), (88, 16, 2, 70),
(89, 16, 1, 83), (89, 16, 2, 86);

-- Class it-2a, Database Management (subject 17)
INSERT INTO student_marks (student_id, subject_id, exam_id, marks) VALUES
(82, 17, 1, 80), (83, 17, 1, 68), (84, 17, 1, 55), (85, 17, 1, 90),
(86, 17, 1, 44), (87, 17, 1, 75), (88, 17, 1, 61), (89, 17, 1, 78);


-- 9. Insert Attendance Sessions
INSERT INTO attendance_records (id, class_id, subject_id, faculty_id, attendance_date, period, time_slot, marked) VALUES
(1, 1, 1, 7, '2025-05-01', 1, '9:00–9:50', true),
(2, 1, 2, 7, '2025-05-01', 2, '10:00–10:50', true),
(3, 1, 1, 7, '2025-04-30', 1, '9:00–9:50', true),
(4, 1, 3, 7, '2025-04-30', 4, '12:00–12:50', true);

-- 10. Insert Attendance Entries
-- Record 1: Data Structures 2025-05-01
INSERT INTO student_attendance (attendance_record_id, student_id, status) VALUES
(1, 12, 'present'), (1, 13, 'present'), (1, 14, 'absent'), (1, 15, 'present'),
(1, 16, 'present'), (1, 17, 'present'), (1, 18, 'absent'), (1, 19, 'present'),
(1, 20, 'present'), (1, 21, 'present'), (1, 22, 'present'), (1, 23, 'present'),
(1, 24, 'present');

-- Record 2: DWDM 2025-05-01
INSERT INTO student_attendance (attendance_record_id, student_id, status) VALUES
(2, 12, 'present'), (2, 13, 'present'), (2, 14, 'present'), (2, 15, 'present'),
(2, 16, 'present'), (2, 17, 'present'), (2, 18, 'absent'), (2, 19, 'present'),
(2, 20, 'present'), (2, 21, 'present'), (2, 22, 'present'), (2, 23, 'present'),
(2, 24, 'present');

-- Record 3: Data Structures 2025-04-30
INSERT INTO student_attendance (attendance_record_id, student_id, status) VALUES
(3, 12, 'present'), (3, 13, 'present'), (3, 14, 'present'), (3, 15, 'present'),
(3, 16, 'present'), (3, 17, 'present'), (3, 18, 'present'), (3, 19, 'present'),
(3, 20, 'present'), (3, 21, 'present'), (3, 22, 'present'), (3, 23, 'present'),
(3, 24, 'present');

-- Record 4: Python Lab 2025-04-30
INSERT INTO student_attendance (attendance_record_id, student_id, status) VALUES
(4, 12, 'present'), (4, 13, 'present'), (4, 14, 'present'), (4, 15, 'present'),
(4, 16, 'present'), (4, 17, 'present'), (4, 18, 'present'), (4, 19, 'present'),
(4, 20, 'present'), (4, 21, 'present'), (4, 22, 'present'), (4, 23, 'present'),
(4, 24, 'present');

-- 11. Insert Holidays
INSERT INTO holidays (id, name, holiday_date, type, recurring) VALUES
(1, 'Republic Day', '2025-01-26', 'National', true),
(2, 'Holi', '2025-03-14', 'Festival', false),
(3, 'Good Friday', '2025-04-18', 'National', true),
(4, 'College Foundation Day', '2025-02-15', 'College', true),
(5, 'Ugadi', '2025-03-30', 'Regional', false),
(6, 'Ambedkar Jayanti', '2025-04-14', 'National', true);

-- 12. Insert Audit Logs (Corrections)
INSERT INTO audit_logs (id, student_id, subject_id, attendance_date, old_status, new_status, changed_by_id, reason, created_at) VALUES
(1, 14, 1, '2025-03-10', 'absent', 'present', 7, 'Correction — was present', '2025-03-11 09:14:22'),
(2, 15, 5, '2025-03-09', 'present', 'excused', 2, 'Medical leave approved', '2025-03-10 11:30:05'),
(3, 18, 4, '2025-03-08', 'absent', 'excused', 2, 'Official duty', '2025-03-08 14:22:41'),
(4, 17, 3, '2025-03-07', 'present', 'absent', 7, 'Attendance error correction', '2025-03-08 08:55:10'),
(5, 16, 2, '2025-03-06', 'absent', 'present', 8, 'System entry error', '2025-03-07 16:00:33');

-- 13. Insert Leave Requests
INSERT INTO leave_requests (id, student_id, type, from_date, to_date, reason, status, processed_by_id) VALUES
(1, 14, 'Medical', '2025-03-10', '2025-03-12', 'Fever', 'pending', NULL),
(2, 15, 'Official', '2025-03-14', '2025-03-14', 'College event', 'pending', NULL),
(3, 18, 'Medical', '2025-03-15', '2025-03-17', 'Surgery follow-up', 'pending', NULL),
(4, 24, 'Medical', '2025-03-10', '2025-03-12', 'Fever', 'approved', 2),
(5, 24, 'Official', '2025-02-20', '2025-02-20', 'College event', 'rejected', 2),
(6, 24, 'Medical', '2025-01-05', '2025-01-07', 'Flu', 'approved', 2);

-- 14. Insert Substitute Requests
INSERT INTO substitute_requests (id, date, period, time_slot, subject_id, original_faculty_id, requested_faculty_id, status) VALUES
(1, '2025-05-10', 2, '10:00–10:50', 2, 7, 8, 'pending'),
(2, '2025-05-12', 4, '12:00–12:50', 3, 8, 7, 'pending');

-- 15. Insert Grade Configurations
INSERT INTO grade_config (id, min_score, grade, label, color) VALUES
(1, 90, 'O', 'Outstanding', '#22c55e'),
(2, 75, 'A+', 'Excellent', '#3b82f6'),
(3, 60, 'A', 'Very Good', '#06b6d4'),
(4, 50, 'B+', 'Good', '#f59e0b'),
(5, 40, 'B', 'Average', '#f97316'),
(6, 0, 'F', 'Fail', '#ef4444');

-- 16. Seed Notifications (In-app Alerts Center)
INSERT INTO notifications (recipient_id, sender_id, type, title, message) VALUES
-- Warning to student (Rahul Sharma)
(24, 7, 'warning', 'Attendance Alert: Data Structures', 'Your current attendance in Data Structures is 68%, which is below the required 75% threshold. Please meet Prof. John Doe.'),
-- Warning to student (Rahul Verma)
(14, 7, 'warning', 'Attendance Alert: Data Structures', 'Your attendance in Data Structures has fallen to 68%.'),
-- In-app alert to Faculty (Prof. John Doe)
(7, NULL, 'warning', 'Defaulter Warning: CSE 2nd Year', 'Rahul Verma and Arun Pillai have fallen below the 75% threshold in your class Data Structures.'),
-- In-app alert to HOD (Dr. Anand Kumar)
(2, NULL, 'warning', 'Department Defaulter Update', '5 students in CSE 2nd Year are currently marked at-risk with attendance below 75%.'),
-- In-app alert to Principal (Dr. Ramesh Kumar)
(1, NULL, 'warning', 'College Defaulter Update', '87 students across all departments are currently flagged at-risk due to low attendance.');

