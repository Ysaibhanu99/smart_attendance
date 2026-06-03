# PRD — OTP Login (Day 6 Foundation Project)

---

## 1. Purpose

Build a Flask + Neon (PostgreSQL) app where users register with their email,
receive a 6-digit OTP in their inbox, verify the OTP, and access a protected
dashboard. No password required — email + OTP is the entire auth mechanism.
**Core goal:** Send a real email from Flask, store and verify a time-limited
OTP, and understand how notification systems work in web applications.

---

## 2. Success Criteria

By end of Day 6, you should be able to say:

> "I generated an OTP, sent it to a real email address using Flask-Mail,
> stored it in the DB with an expiry, verified it on submission, and granted
> access only when it was valid and not expired — and I understand every line."

---

## 3. Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Backend       | Python + Flask                          |
| Database      | PostgreSQL (Neon)                       |
| DB Driver     | psycopg2-binary                         |
| Email         | Flask-Mail (Gmail SMTP)                 |
| OTP           | Python `random` module (built-in)       |
| Frontend      | Plain HTML + minimal CSS                |

---

## 4. Database Schema

**New Neon project:** `otp_login`

```sql
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(100) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otps (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(100) NOT NULL,
    otp_code   VARCHAR(6)   NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    is_used    BOOLEAN      DEFAULT FALSE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
```

Two tables — `users` stores registered emails, `otps` stores generated codes
with expiry times.

---

## 5. Routes

| Method | Route        | What it does                                      |
|--------|--------------|---------------------------------------------------|
| GET    | `/`          | Redirect to /register                             |
| GET    | `/register`  | Show registration form                            |
| POST   | `/register`  | Save email, generate OTP, send email, redirect    |
| GET    | `/verify`    | Show OTP entry form                               |
| POST   | `/verify`    | Check OTP validity + expiry, set session          |
| GET    | `/dashboard` | Protected page — session check                    |
| GET    | `/logout`    | Clear session, redirect to /register              |

---

## 6. Pages / UI

### `register.html`
- One field: Email
- Submit button: "Send OTP"
- Flash message if email already registered

### `verify.html`
- One field: OTP (6-digit number input)
- Submit button: "Verify OTP"
- Small text: "OTP valid for 10 minutes"
- Flash message if OTP is wrong or expired

### `dashboard.html`
- "Welcome, {email}"
- "You are verified."
- Logout button

---

## 7. Core Logic

### Generating OTP
```python
import random

def generate_otp():
    return str(random.randint(100000, 999999))
```

### Storing OTP with expiry
```python
from datetime import datetime, timedelta

otp_code   = generate_otp()
expires_at = datetime.now() + timedelta(minutes=10)

cur.execute(
    "INSERT INTO otps (email, otp_code, expires_at) VALUES (%s, %s, %s)",
    (email, otp_code, expires_at)
)
```

### Sending OTP via Flask-Mail
```python
from flask_mail import Mail, Message

mail = Mail(app)

msg = Message(
    subject = "Your OTP Code",
    sender  = app.config['MAIL_USERNAME'],
    recipients = [email]
)
msg.body = f"Your OTP is: {otp_code}\nValid for 10 minutes."
mail.send(msg)
```

### Verifying OTP
```python
from datetime import datetime

cur.execute(
    """SELECT otp_code, expires_at, is_used 
       FROM otps 
       WHERE email = %s 
       ORDER BY created_at DESC 
       LIMIT 1""",
    (email,)
)
row = cur.fetchone()

if not row:
    flash('No OTP found. Please register again.')
elif row[2]:  # is_used
    flash('OTP already used.')
elif datetime.now() > row[1]:  # expires_at
    flash('OTP has expired. Please register again.')
elif entered_otp != row[0]:
    flash('Wrong OTP.')
else:
    # Mark OTP as used
    cur.execute("UPDATE otps SET is_used = TRUE WHERE email = %s", (email,))
    # Mark user as verified
    cur.execute("UPDATE users SET is_verified = TRUE WHERE email = %s", (email,))
    conn.commit()
    session['email'] = email
    return redirect('/dashboard')
```

---

## 8. Flask-Mail Configuration

### Install
```bash
pip install flask-mail
```

### .env variables needed
```
DATABASE_URL=postgresql://...your neon string...
SECRET_KEY=your-secret-key
MAIL_USERNAME=yourgmail@gmail.com
MAIL_PASSWORD=your-16-char-app-password
```

### app.py configuration
```python
app.config['MAIL_SERVER']   = 'smtp.gmail.com'
app.config['MAIL_PORT']     = 587
app.config['MAIL_USE_TLS']  = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)
```

---

## 9. Folder Structure

```
otp-login/
│
├── app.py
├── db.py
│
├── templates/
│   ├── register.html
│   ├── verify.html
│   └── dashboard.html
│
├── static/
│   └── style.css       ← optional
│
├── .env                ← 4 variables this time
├── requirements.txt
└── .gitignore
```

---

## 10. Build Order (follow exactly)

```
Step 1 → Create Neon project, create both tables, verify they exist.
Step 2 → Set up folder, copy db.py from previous project.
Step 3 → Add Flask-Mail config to app.py + .env variables.
Step 4 → Write generate_otp() function. Print it to terminal to confirm.
Step 5 → Write GET + POST /register:
         - Save email to users table
         - Generate OTP, store in otps table with expiry
         - Send OTP email via Flask-Mail
         Test: register → check inbox → OTP arrives.
Step 6 → Write GET + POST /verify:
         - Read session email
         - Fetch latest OTP from DB
         - Check: exists? used? expired? correct?
         - If all pass → mark used, set session, redirect to dashboard
         Test: enter correct OTP → dashboard. Enter wrong OTP → error.
Step 7 → Write GET /dashboard — session check, show email.
Step 8 → Write GET /logout — clear session.
Step 9 → Full end-to-end test:
         Register → check email → enter OTP → dashboard → logout →
         try dashboard again → blocked.
Step 10 → Test edge cases:
          Enter expired OTP → error message.
          Enter OTP twice → "already used" message.
          Try /dashboard without session → redirect to register.
```

---

## 11. Strictly Out of Scope

- ❌ Password-based login
- ❌ Resend OTP button (optional stretch goal only)
- ❌ OTP via SMS
- ❌ HTML email templates (plain text only)
- ❌ Rate limiting (too many OTP requests)
- ❌ Profile page
- ❌ Deployment (optional only if you finish early)

---

## 12. What This Teaches You

| Concept                        | Where you use it in future                     |
|-------------------------------|------------------------------------------------|
| Flask-Mail + Gmail SMTP        | Every app that sends emails                    |
| App Password (not real password)| Secure credential handling                    |
| OTP generation with random     | 2FA, password reset, phone verification        |
| Expiry time with timedelta     | Token expiry, session timeout, trial periods   |
| `is_used` flag on OTP          | Prevents OTP reuse attacks                     |
| `ORDER BY created_at DESC LIMIT 1` | Always fetch the latest record pattern    |
| Smart Attendance use case      | Email parents when attendance drops below 75%  |

---

*PRD version: 1.0 | Project: Foundation Block 6 — Email + Notifications*
