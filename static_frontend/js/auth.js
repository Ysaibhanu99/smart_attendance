/* ============================================================
   AUTH.JS — Static login logic
   Replaces Flask-Login session with localStorage
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── PASSWORD TOGGLE ──────────────────────────────────────── */
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

  /* ── DEMO FILL BUTTONS ────────────────────────────────────── */
  document.querySelectorAll('.demo-fill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('email').value = btn.getAttribute('data-email');
      document.getElementById('password').value = btn.getAttribute('data-pass');
    });
    btn.addEventListener('mouseenter', () => btn.style.borderColor = 'var(--accent-blue)');
    btn.addEventListener('mouseleave', () => btn.style.borderColor = 'var(--border)');
  });

  /* ── LOGIN FORM SUBMIT ────────────────────────────────────── */
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = loginForm.querySelector('.btn-auth');

    if (!email || !password) { showError('Fill in all fields.'); return; }

    // Simulate auth check against mock credentials
    const creds = {
      'principal@college.edu': { pass: 'admin123', role: 'admin'   },
      'hod.cse@college.edu':   { pass: 'admin123', role: 'hod'     },
      'hod.ece@college.edu':   { pass: 'admin123', role: 'hod'     },
      'john@cse.edu':          { pass: 'admin123', role: 'faculty'  },
      'rahul@cse.edu':         { pass: 'admin123', role: 'student'  },
    };

    const match = creds[email];
    if (!match || match.pass !== password) {
      showError('Invalid email or password.');
      return;
    }

    // Set session
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';
    Session.set(match.role);

    // Redirect based on role
    const redirectMap = {
      admin:   'admin/dashboard.html',
      hod:     'hod/dashboard.html',
      faculty: 'faculty/dashboard.html',
      student: 'student/dashboard.html',
    };

    setTimeout(() => {
      window.location.href = redirectMap[match.role];
    }, 600);
  });

  function showError(msg) {
    let err = document.getElementById('formError');
    if (!err) {
      err = document.createElement('div');
      err.id = 'formError';
      err.className = 'alert alert-danger';
      err.style.marginBottom = '16px';
      loginForm.prepend(err);
    }
    err.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${msg}`;
  }

});
