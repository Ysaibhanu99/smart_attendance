# 📋 Smart Attendance System

> **Don't just track attendance. Prevent failures.**

🔗 **Live Demo**: [https://smart-attendance-quyo.onrender.com](https://smart-attendance-quyo.onrender.com)

---

## 🚀 Overview

Smart Attendance is a full-stack web application for managing college attendance, marks, leave requests, and notifications. Built with a Flask backend, PostgreSQL (Neon) database, and a responsive static frontend.

## ✨ Features

- **Role-based Dashboards** — Admin, HOD, Faculty, and Student views
- **OTP-based Registration** — Students register using their Admission Number + Email verification via OTP
- **Secure Login** — Admission Number / Email + Password authentication
- **Attendance Tracking** — Faculty can mark and manage attendance per class/subject
- **Marks Management** — Enter, publish, and view exam marks with grade configurations
- **Leave Requests** — Students can apply for leave; HODs/Faculty can approve/reject
- **Notifications** — In-app alerts for low attendance warnings and system updates
- **Substitute Management** — Faculty can request substitutes for their classes

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Python, Flask, Flask-Mail |
| **Database** | PostgreSQL (Neon) |
| **Deployment** | Render |
| **Email** | Gmail SMTP (Flask-Mail) |

## 📁 Project Structure

```
smart_attendance/
├── backend/
│   ├── app.py              # Flask API server (serves frontend + API)
│   └── requirements.txt    # Python dependencies
├── static_frontend/
│   ├── index.html           # Landing page
│   ├── login.html           # Login + Registration (4-view flow)
│   ├── css/                 # Stylesheets
│   ├── js/
│   │   ├── auth.js          # Authentication state machine
│   │   └── data.js          # Session management
│   ├── admin/               # Admin dashboard pages
│   ├── hod/                 # HOD dashboard pages
│   ├── faculty/             # Faculty dashboard pages
│   └── student/             # Student dashboard pages
├── database/
│   ├── schema.sql           # Full database schema (18 tables)
│   ├── seed.sql             # Demo data
│   └── migrate.py           # Migration runner
├── render.yaml              # Render deployment blueprint
└── .gitignore
```

## 🔐 Authentication Flow

### Login (Returning Users)
1. Enter **Admission Number** (e.g., `22BCA001`) or **Email**
2. Enter **Password**
3. Redirected to role-based dashboard

### Registration (First-Time Users)
1. Click **"Not registered? Register"**
2. Enter **Admission Number** + **Email**
3. System verifies and sends **6-digit OTP** to email
4. Enter OTP to verify
5. Set a **new password**
6. Automatically logged in

## 🧪 Demo Accounts

| Role | Identifier | Password |
|------|-----------|----------|
| Super Admin | `principal@college.edu` | `admin123` |
| HOD | `hod.cse@college.edu` | `admin123` |
| Faculty | `john@cse.edu` | `admin123` |
| Student | `rahul@cse.edu` | `admin123` |

## ⚙️ Local Development

```bash
# 1. Clone the repo
git clone https://github.com/Ysaibhanu99/smart_attendance.git
cd smart_attendance

# 2. Create .env file in root with:
#    DATABASE_URL, SECRET_KEY, MAIL_USERNAME, MAIL_PASSWORD

# 3. Install dependencies
cd backend
pip install -r requirements.txt

# 4. Run the database migration
cd ../database
python migrate.py

# 5. Start the server
cd ../backend
python app.py

# 6. Open http://127.0.0.1:5000
```

## 📄 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login with Admission No/Email + Password |
| POST | `/api/auth/register/check` | Validate admission no + email, send OTP |
| POST | `/api/auth/register/verify_otp` | Verify OTP |
| POST | `/api/auth/register/set_password` | Set password, complete registration |
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/attendance/status` | Get attendance status for a class |
| POST | `/api/attendance/mark` | Mark attendance |
| GET | `/api/marks` | Get student marks |
| POST | `/api/marks` | Enter/update marks |

---

**Built with ❤️ for Smart Attendance Management**
