import os
import random
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, flash, session
from flask_mail import Mail, Message
from dotenv import load_dotenv
from db import get_db_connection

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default-secret-key')

# Flask-Mail config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)

def generate_otp():
    return str(random.randint(100000, 999999))

@app.route('/')
def index():
    return redirect('/register')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        
        if not email:
            flash('Email is required.')
            return redirect('/register')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if email is already registered and verified
        cur.execute("SELECT is_verified FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user:
            # Insert new user
            cur.execute("INSERT INTO users (email) VALUES (%s)", (email,))
            conn.commit()
        elif user['is_verified']:
            flash('Email already registered and verified. Please proceed to login (if implemented) or contact support.')
            cur.close()
            conn.close()
            return redirect('/register')
            
        # Generate OTP
        otp_code = generate_otp()
        expires_at = datetime.now() + timedelta(minutes=10)
        
        # Store OTP
        cur.execute(
            "INSERT INTO otps (email, otp_code, expires_at) VALUES (%s, %s, %s)",
            (email, otp_code, expires_at)
        )
        conn.commit()
        cur.close()
        conn.close()
        
        # Send OTP email
        try:
            msg = Message(
                subject="Your OTP Code",
                sender=app.config['MAIL_USERNAME'],
                recipients=[email]
            )
            msg.body = f"Your OTP is: {otp_code}\nValid for 10 minutes."
            mail.send(msg)
            
            # Save email in session for verify step
            session['pending_email'] = email
            return redirect('/verify')
        except Exception as e:
            print(f"Error sending email: {e}")
            flash('Failed to send OTP email. Please try again or check your configuration.')
            return redirect('/register')

    return render_template('register.html')

@app.route('/verify', methods=['GET', 'POST'])
def verify():
    email = session.get('pending_email')
    
    if not email:
        flash('Session expired or no pending verification. Please register.')
        return redirect('/register')
        
    if request.method == 'POST':
        entered_otp = request.form.get('otp')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Fetch the latest OTP
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
        elif row['is_used']:
            flash('OTP already used.')
        elif datetime.now() > row['expires_at']:
            flash('OTP has expired. Please register again.')
        elif entered_otp != row['otp_code']:
            flash('Wrong OTP.')
        else:
            # OTP is valid
            cur.execute("UPDATE otps SET is_used = TRUE WHERE email = %s AND otp_code = %s", (email, row['otp_code']))
            cur.execute("UPDATE users SET is_verified = TRUE WHERE email = %s", (email,))
            conn.commit()
            
            # Move from pending_email to verified email in session
            session.pop('pending_email', None)
            session['email'] = email
            
            cur.close()
            conn.close()
            return redirect('/dashboard')
            
        cur.close()
        conn.close()
        
    return render_template('verify.html', email=email)

@app.route('/dashboard')
def dashboard():
    email = session.get('email')
    if not email:
        flash('You must be verified to view this page.')
        return redirect('/register')
        
    return render_template('dashboard.html', email=email)

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/register')

if __name__ == '__main__':
    app.run(debug=True)
