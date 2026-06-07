/* ============================================================
   AUTH.JS — Admission Number Login + OTP Registration
   4-view state machine: Login → Register → OTP → Set Password
   ============================================================ */

const BASE_URL = 'http://127.0.0.1:5000';

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM References ──────────────────────────────────────────
  const viewLogin       = document.getElementById('viewLogin');
  const viewRegister    = document.getElementById('viewRegister');
  const viewOtp         = document.getElementById('viewOtp');
  const viewSetPassword = document.getElementById('viewSetPassword');
  const demoSection     = document.getElementById('demoSection');

  const loginForm       = document.getElementById('loginForm');
  const registerForm    = document.getElementById('registerForm');
  const otpForm         = document.getElementById('otpForm');
  const setPasswordForm = document.getElementById('setPasswordForm');

  if (!loginForm) return; // Not on login page

  // State: tracks the email and identifier discovered during registration
  let regEmail = '';
  let regIdentifier = '';

  // ── View Switcher ───────────────────────────────────────────
  function showView(view) {
    [viewLogin, viewRegister, viewOtp, viewSetPassword].forEach(v => v.style.display = 'none');
    view.style.display = 'block';
    // Show demo section only on login view
    demoSection.style.display = (view === viewLogin) ? 'block' : 'none';
    hideError();
  }

  // ── Toggle Links ────────────────────────────────────────────
  document.getElementById('showRegister').addEventListener('click', e => {
    e.preventDefault();
    showView(viewRegister);
  });
  document.getElementById('showLogin').addEventListener('click', e => {
    e.preventDefault();
    showView(viewLogin);
  });

  // ── Password Toggle ─────────────────────────────────────────
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.innerHTML = input.type === 'password'
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
    });
  });

  // ── Demo Fill Buttons ───────────────────────────────────────
  document.querySelectorAll('.demo-fill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('loginIdentifier').value = btn.getAttribute('data-identifier');
      document.getElementById('loginPassword').value = btn.getAttribute('data-pass');
      // Auto-submit the login form
      loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
    });
    btn.addEventListener('mouseenter', () => btn.style.borderColor = 'var(--accent-blue)');
    btn.addEventListener('mouseleave', () => btn.style.borderColor = 'var(--border)');
  });


  // ══════════════════════════════════════════════════════════════
  // VIEW 1: LOGIN
  // ══════════════════════════════════════════════════════════════
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password   = document.getElementById('loginPassword').value;
    const btn        = document.getElementById('btnLogin');

    if (!identifier || !password) { showError('Fill in all fields.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';

    try {
      const res = await fetch(BASE_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();

      if (res.ok) {
        Session.set(data.user.role);
        localStorage.setItem('sa_user', JSON.stringify(data.user));

        const redirectMap = {
          admin:   'admin/dashboard.html',
          hod:     'hod/dashboard.html',
          faculty: 'faculty/dashboard.html',
          student: 'student/dashboard.html',
        };
        setTimeout(() => { window.location.href = redirectMap[data.user.role]; }, 500);
      } else {
        // If not_registered error, nudge to register
        if (data.error === 'not_registered') {
          showError(data.message);
        } else {
          showError(data.error || 'Login failed.');
        }
        resetBtn(btn, '<i class="fa-solid fa-right-to-bracket" style="margin-right:6px"></i> Sign In');
      }
    } catch (err) {
      showError('Network error. Is the backend running?');
      resetBtn(btn, '<i class="fa-solid fa-right-to-bracket" style="margin-right:6px"></i> Sign In');
    }
  });


  // ══════════════════════════════════════════════════════════════
  // VIEW 2: REGISTER — Step 1 (Check Admission No)
  // ══════════════════════════════════════════════════════════════
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const identifier = document.getElementById('regIdentifier').value.trim();
    const email      = document.getElementById('regEmail').value.trim();
    const btn        = document.getElementById('btnRegCheck');

    if (!identifier || !email) { showError('Please enter your Admission Number and Email.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Checking...';

    try {
      const res = await fetch(BASE_URL + '/api/auth/register/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, email })
      });
      const data = await res.json();

      if (res.ok) {
        regEmail = data.email;
        regIdentifier = identifier;
        document.getElementById('otpSubtext').textContent = data.message;
        showView(viewOtp);
      } else {
        showError(data.error || 'Check failed.');
      }
      resetBtn(btn, '<i class="fa-solid fa-paper-plane" style="margin-right:6px"></i> Send OTP');
    } catch (err) {
      showError('Network error. Is the backend running?');
      resetBtn(btn, '<i class="fa-solid fa-paper-plane" style="margin-right:6px"></i> Send OTP');
    }
  });


  // ══════════════════════════════════════════════════════════════
  // VIEW 3: REGISTER — Step 2 (Verify OTP)
  // ══════════════════════════════════════════════════════════════
  otpForm.addEventListener('submit', async e => {
    e.preventDefault();
    const otp = document.getElementById('regOtp').value.trim();
    const btn = document.getElementById('btnVerifyOtp');

    if (!otp) { showError('Please enter the OTP.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...';

    try {
      const res = await fetch(BASE_URL + '/api/auth/register/verify_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, otp })
      });
      const data = await res.json();

      if (res.ok) {
        showView(viewSetPassword);
      } else {
        showError(data.error || 'OTP verification failed.');
      }
      resetBtn(btn, '<i class="fa-solid fa-check-circle" style="margin-right:6px"></i> Verify OTP');
    } catch (err) {
      showError('Network error. Is the backend running?');
      resetBtn(btn, '<i class="fa-solid fa-check-circle" style="margin-right:6px"></i> Verify OTP');
    }
  });


  // ══════════════════════════════════════════════════════════════
  // VIEW 4: REGISTER — Step 3 (Set Password)
  // ══════════════════════════════════════════════════════════════
  setPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const password = document.getElementById('newPassword').value;
    const confirm  = document.getElementById('confirmPassword').value;
    const btn      = document.getElementById('btnSetPassword');

    if (!password || !confirm) { showError('Fill in both password fields.'); return; }
    if (password.length < 6) { showError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { showError('Passwords do not match.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Completing...';

    try {
      const res = await fetch(BASE_URL + '/api/auth/register/set_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: regIdentifier, email: regEmail, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Auto-login after registration
        Session.set(data.user.role);
        localStorage.setItem('sa_user', JSON.stringify(data.user));

        const redirectMap = {
          admin:   'admin/dashboard.html',
          hod:     'hod/dashboard.html',
          faculty: 'faculty/dashboard.html',
          student: 'student/dashboard.html',
        };
        setTimeout(() => { window.location.href = redirectMap[data.user.role]; }, 500);
      } else {
        showError(data.error || 'Registration failed.');
        resetBtn(btn, '<i class="fa-solid fa-user-check" style="margin-right:6px"></i> Complete Registration');
      }
    } catch (err) {
      showError('Network error. Is the backend running?');
      resetBtn(btn, '<i class="fa-solid fa-user-check" style="margin-right:6px"></i> Complete Registration');
    }
  });


  // ── Helpers ─────────────────────────────────────────────────
  function showError(msg) {
    // Find the currently visible view's form
    const views = [viewLogin, viewRegister, viewOtp, viewSetPassword];
    let activeForm = null;
    for (const v of views) {
      if (v && v.style.display !== 'none') {
        activeForm = v.querySelector('form');
        break;
      }
    }
    if (!activeForm) return;

    let err = activeForm.querySelector('.form-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'form-error alert alert-danger';
      err.style.marginBottom = '16px';
      activeForm.prepend(err);
    }
    err.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${msg}`;
    err.style.display = 'block';
  }

  function hideError() {
    document.querySelectorAll('.form-error').forEach(e => e.style.display = 'none');
  }

  function resetBtn(btn, html) {
    btn.disabled = false;
    btn.innerHTML = html;
  }

});
