const BASE_URL = 'http://127.0.0.1:5000';

const API = {

  async get(url) {
    const res = await fetch(BASE_URL + url);
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
    const u = this.user();
    if (!u) return;
    APP_DATA.notifications = await this.get(`/api/notifications?user_id=${u.id}`);
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
    await fetch(BASE_URL + `/api/notifications/${id}/read`, { method: 'POST' });
  },

  async submitAttendance(payload) {
    const res = await fetch(BASE_URL + '/api/attendance/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async submitMarks(payload) {
    const res = await fetch(BASE_URL + '/api/marks/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async applyLeave(payload) {
    const res = await fetch(BASE_URL + '/api/leaves/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

};
