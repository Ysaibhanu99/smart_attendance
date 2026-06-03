# Smart Attendance — Static Frontend

Pure HTML + CSS + JS. No server rendering. No Jinja2. Works locally via `file://` or any static server.

---

## File Tree

```
static_frontend/
├── index.html               ← Redirects to login
├── login.html               ← Auth page
├── 404.html
├── 403.html
│
├── admin/
│   ├── dashboard.html
│   ├── users.html
│   ├── holidays.html
│   └── audit-logs.html
│
├── hod/
│   └── dashboard.html
│
├── faculty/
│   ├── dashboard.html
│   └── mark-attendance.html
│
├── student/
│   ├── dashboard.html
│   └── apply-leave.html
│
├── css/
│   ├── main.css             ← Full design system
│   └── auth.css             ← Login page only
│
└── js/
    ├── data.js              ← Mock data (replaces Jinja2 context vars)
    ├── components.js        ← Sidebar + topbar injection (replaces {% extends %})
    ├── main.js              ← Toasts, modals, tabs, sidebar toggle
    ├── charts.js            ← All Chart.js configs
    └── auth.js              ← Login + localStorage session
```

---

## How to Run (Static Server)

### Option 1 — Python (simplest, built-in)
```bash
cd static_frontend
python -m http.server 8080
# Open: http://localhost:8080/login.html
```

### Option 2 — Node (npx, no install)
```bash
cd static_frontend
npx serve .
# Open: http://localhost:3000/login.html
```

### Option 3 — VS Code Live Server
Install "Live Server" extension → right-click `login.html` → Open with Live Server

### Option 4 — Direct file open
Double-click `login.html` in file explorer. Works directly.
> Note: Chrome blocks localStorage on `file://` — use Python server if login redirect fails.

---

## Jinja2 → Static JS Migration Map

| Jinja2 | Static equivalent |
|---|---|
| `{% extends "base.html" %}` | `loadComponents(role, title)` in `components.js` |
| `{% block content %}` | `document.getElementById('pageContent').innerHTML = ...` |
| `{% block sidebar_nav %}` | `SIDEBARS[role]` config object in `components.js` |
| `{{ current_user.name }}` | `Session.get().name` from localStorage |
| `{% for item in list %}` | `.map(item => \`<tr>...</tr>\`).join('')` |
| `{% if condition %}` | Ternary `condition ? 'x' : 'y'` in template string |
| `url_for('route')` | Relative path string `'../admin/users.html'` |
| `get_flashed_messages()` | `showToast(msg, type)` or `flashMessage(msg, type)` |
| `form.hidden_tag()` (CSRF) | Not needed — no server POST |
| Flask-Login session | `Session` object in `data.js` using `localStorage` |

---

## Adding a New Page (Step-by-Step)

1. Create HTML file in correct folder (e.g. `hod/at-risk.html`)
2. Add `<div id="app"></div>` as body content
3. Load scripts in this order:
   ```html
   <script src="../js/data.js"></script>
   <script src="../js/components.js"></script>
   <script src="../js/main.js"></script>
   <!-- Optional: Chart.js + charts.js if page has charts -->
   ```
4. Call `loadComponents('hod', 'Page Title', 'at-risk.html')` on DOMContentLoaded
5. Write a `renderPage()` that sets `document.getElementById('pageContent').innerHTML`
6. Add nav entry in `SIDEBARS.hod` array inside `components.js`

---

## Connecting to Real Flask API (When Ready)

Replace mock data calls in `renderPage()` with `fetch()`:

```javascript
// Before (mock)
const rows = APP_DATA.atRiskStudents.map(s => `<tr>...</tr>`).join('');

// After (real API)
const res  = await fetch('/api/hod/at-risk');
const data = await res.json();
const rows = data.students.map(s => `<tr>...</tr>`).join('');
```

Session management: replace `localStorage` with Flask-Login cookies (automatic — just remove the `Session.guard()` calls and let Flask handle redirects).

---

## Accessibility Notes

- All interactive elements use `<button>` or `<a>` (keyboard accessible)
- Color is never the only indicator — badges have text labels too
- Progress bars have text percentage alongside the visual bar
- `aria-label` should be added to icon-only buttons before production
- Font size minimum 11px (12px+ preferred for body text)
- Focus styles: browser default preserved (do not `outline:none` without replacement)

## Responsive Notes

- Sidebar collapses to off-canvas on mobile (<768px) — toggle button in topbar
- Stats grid uses `auto-fit` with `minmax` — collapses naturally
- Tables wrap with `overflow-x:auto` — swipe on mobile
- Form rows collapse to 1 column below 480px
- Tested at 320px, 768px, 1024px, 1440px

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | principal@college.edu | admin123 |
| HOD | hod.cse@college.edu | admin123 |
| Faculty | john@cse.edu | admin123 |
| Student | rahul@cse.edu | admin123 |

Credentials checked in `auth.js` → session stored in `localStorage` → sidebar/data loads accordingly.
