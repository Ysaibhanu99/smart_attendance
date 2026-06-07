# PRD — Wire Static Frontend to Flask API
## Smart Attendance System

---

## 1. Purpose

Connect all 33 HTML pages to the real Flask backend.
Right now every page uses `APP_DATA` from `data.js` which has empty arrays.
After this change every page fetches real data from the Flask API before rendering.

---

## 2. The Problem

Current flow in every page:
```
DOMContentLoaded → renderPage() → reads APP_DATA → shows zeros and empty tables
```

Target flow:
```
DOMContentLoaded → await API.init() → fills APP_DATA from real API → renderPage() → shows real data
```

---

## 3. New File to Create

### `static_frontend/js/api.js`

Create this file. Paste this exact content:

```javascript
const API = {

  async get(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed: ${url}`);
    }
    return res.json();
  },

  user() {
    return JSON.parse(localStorage.getItem('sa_user') || 'null');
  },

  async loadStats() {
    const u = this.user();
    if (!u) return;
    const data = await this.get(`/api/dashboard/stats?role=${u.role}&user_id=${u.id}`);
    if (u.role === 'admin')   Object.assign(APP_DATA.adminStats,   data);
    if (u.role === 'hod')     Object.assign(APP_DATA.hodStats,     data);
    if (u.role === 'faculty') Object.assign(APP_DATA.facultyStats, data);
    if (u.role === 'student') Object.assign(APP_DATA.studentStats, data);
  },

  async loadDepartments() {
    APP_DATA.departments = await this.get('/api/departments');
  },

  async loadUsers() {
    APP_DATA.users = await this.get('/api/users');
  },

  async loadHolidays() {
    APP_DATA.holidays = await this.get('/api/holidays');
  },

  async loadNotifications() {
    APP_DATA.notifications = await this.get('/api/notifications');
  },

  async loadLeaves() {
    const u = this.user();
    if (!u) return;
    APP_DATA.leaveRequests = await this.get(`/api/leaves?role=${u.role}&user_id=${u.id}`);
    if (u.role === 'student') APP_DATA.pastLeaves = APP_DATA.leaveRequests;
  },

  async loadAttendanceClasses() {
    const u = this.user();
    if (!u) return;
    APP_DATA.todaysClasses = await this.get(`/api/attendance/classes?user_id=${u.id}`);
  },

  async loadAttendanceStudents(classId, subjectId, date) {
    const params = new URLSearchParams({ class_id: classId, subject_id: subjectId, date });
    APP_DATA.attendanceStudents = await this.get(`/api/attendance/students?${params}`);
  },

  async loadMarksClasses() {
    const u = this.user();
    if (!u) return;
    APP_DATA.classList = await this.get(`/api/marks/classes?user_id=${u.id}`);
  },

  async loadMarksStudents(classId, subjectId, examId) {
    const params = new URLSearchParams({ class_id: classId, subject_id: subjectId, exam_id: examId });
    APP_DATA.marksEntry = await this.get(`/api/marks/students?${params}`);
  },

  async init(keys = []) {
    const loaderMap = {
      'stats':              () => this.loadStats(),
      'departments':        () => this.loadDepartments(),
      'users':              () => this.loadUsers(),
      'holidays':           () => this.loadHolidays(),
      'notifications':      () => this.loadNotifications(),
      'leaves':             () => this.loadLeaves(),
      'attendance_classes': () => this.loadAttendanceClasses(),
      'marks_classes':      () => this.loadMarksClasses(),
    };

    const promises = keys
      .filter(k => loaderMap[k])
      .map(k => loaderMap[k]().catch(err => {
        console.warn(`[API] Failed to load "${k}":`, err.message);
      }));

    await Promise.all(promises);
  },

  async markNotifRead(id) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async submitAttendance(payload) {
    const res = await fetch('/api/attendance/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async submitMarks(payload) {
    const res = await fetch('/api/marks/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async applyLeave(payload) {
    const res = await fetch('/api/leaves/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

};
```

---

## 4. Two Changes in Every HTML Page

### Change 1 — Add api.js script tag

Find this line (it's around line 15 in every page):
```html
<script src="../js/data.js"></script>
```

Add one line directly below it:
```html
<script src="../js/data.js"></script>
<script src="../js/api.js"></script>
```

---

### Change 2 — Make DOMContentLoaded async

Find this block at the top of the inline script in every page:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  loadComponents(...);
  renderPage();
});
```

Change it to:
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  loadComponents(...);
  await API.init([...keys...]);
  renderPage();
});
```

The `loadComponents(...)` line stays exactly as it is.
Only `() =>` becomes `async () =>` and one `await API.init(...)` line is added.

---

## 5. Keys Per Page

| File | Keys to pass into API.init([...]) |
|---|---|
| `admin/dashboard.html` | `'stats', 'departments', 'notifications'` |
| `admin/departments.html` | `'departments', 'notifications'` |
| `admin/users.html` | `'users', 'notifications'` |
| `admin/holidays.html` | `'holidays', 'notifications'` |
| `admin/students.html` | `'users', 'notifications'` |
| `admin/marks.html` | `'marks_classes', 'notifications'` |
| `admin/analytics.html` | `'stats', 'departments', 'notifications'` |
| `admin/at-risk.html` | `'stats', 'notifications'` |
| `admin/leave-requests.html` | `'leaves', 'notifications'` |
| `admin/audit-logs.html` | `'notifications'` |
| `admin/history.html` | `'notifications'` |
| `hod/dashboard.html` | `'stats', 'leaves', 'notifications'` |
| `hod/students.html` | `'users', 'notifications'` |
| `hod/marks.html` | `'marks_classes', 'notifications'` |
| `hod/leave-requests.html` | `'leaves', 'notifications'` |
| `hod/at-risk.html` | `'stats', 'notifications'` |
| `hod/analytics.html` | `'stats', 'departments', 'notifications'` |
| `hod/history.html` | `'notifications'` |
| `hod/timetable.html` | `'notifications'` |
| `hod/substitute.html` | `'notifications'` |
| `faculty/dashboard.html` | `'stats', 'attendance_classes', 'notifications'` |
| `faculty/mark-attendance.html` | `'attendance_classes', 'notifications'` |
| `faculty/marks.html` | `'marks_classes', 'notifications'` |
| `faculty/at-risk.html` | `'stats', 'notifications'` |
| `faculty/history.html` | `'notifications'` |
| `faculty/corrections.html` | `'notifications'` |
| `faculty/substitute.html` | `'notifications'` |
| `student/dashboard.html` | `'stats', 'notifications'` |
| `student/attendance.html` | `'stats', 'notifications'` |
| `student/marks.html` | `'notifications'` |
| `student/apply-leave.html` | `'notifications'` |
| `student/leave-status.html` | `'leaves', 'notifications'` |
| `student/history.html` | `'notifications'` |

---

## 6. Build Order

```
Step 1 → Create js/api.js with the full content from Section 3
Step 2 → Open admin/dashboard.html — apply Change 1 and Change 2
         Test: run the app, log in as admin, check dashboard shows real stats
Step 3 → Complete remaining admin pages (10 files)
Step 4 → Complete all hod pages (9 files)
Step 5 → Complete all faculty pages (7 files)
Step 6 → Complete all student pages (6 files)
Step 7 → Full end-to-end test for each role
```

Start with admin/dashboard.html first. Confirm real data shows before doing the rest.

---

## 7. How to Verify Each Page is Working

Open browser DevTools → Network tab → reload the page.
You should see API calls going out:

```
GET /api/dashboard/stats?role=admin&user_id=1   → 200
GET /api/departments                             → 200
GET /api/notifications                           → 200
```

If you see these requests and the dashboard shows real numbers — the page is wired correctly.

If a request shows 401 or 500 — the backend endpoint has an issue.
If no requests appear — `api.js` is not loaded or `API.init` was not called.

---

## 8. Strictly Out of Scope for This Change

- Do NOT modify `data.js` — it stays as is
- Do NOT modify `renderPage()` functions — they stay as is
- Do NOT modify `components.js`, `main.js`, `charts.js`
- Do NOT change any HTML structure or CSS
- Only add the script tag and update DOMContentLoaded — nothing else

---

*Version 1.0 — Smart Attendance API Wiring*
