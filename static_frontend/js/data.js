/* ============================================================
   DATA.JS — Mock data replacing Jinja2 context variables
   In real app: replace these with fetch() calls to Flask API
   ============================================================ */

const APP_DATA = {

  /* ── SESSION (replaces current_user) ──────────────────── */
  session: {
    admin:   { id:1, name:'Dr. Ramesh Kumar',  email:'principal@college.edu', role:'admin',   dept:'All',  avatar:'R' },
    hod:     { id:2, name:'Dr. Anand Kumar',   email:'hod.cse@college.edu',  role:'hod',     dept:'CSE',  avatar:'A' },
    faculty: { id:3, name:'Prof. John Doe',    email:'john@cse.edu',         role:'faculty', dept:'CSE',  avatar:'J' },
    student: { id:4, name:'Rahul Sharma',      email:'rahul@cse.edu',        role:'student', dept:'CSE',  avatar:'R', roll:'22BCA018' },
  },

  /* ── NOTIFICATIONS (In-app Alerts Center) ──────────────── */
  notifications: [
    { id:1, recipient:'student', type:'warning', title:'Attendance Alert: Data Structures', message:'Your current attendance in Data Structures is 68%, which is below the required 75% threshold. Please meet Prof. John Doe.', date:'Just now' },
    { id:2, recipient:'faculty', type:'warning', title:'Defaulter Warning: CSE 2nd Year', message:'Rahul Verma and Arun Pillai have fallen below the 75% threshold in your class Data Structures.', date:'10m ago' },
    { id:3, recipient:'hod', type:'warning', title:'Department Defaulter Update', message:'5 students in CSE 2nd Year are currently marked at-risk with attendance below 75%.', date:'1h ago' },
    { id:4, recipient:'admin', type:'warning', title:'College Defaulter Update', message:'87 students across all departments are currently flagged at-risk due to low attendance.', date:'2h ago' }
  ],

  /* ── ADMIN STATS ───────────────────────────────────────── */
  adminStats: {
    departments: 0, students: 0, faculty: 0,
    at_risk: 0, avg_attendance: 0, holidays: 0
  },

  departments: [],

  users: [],

  holidays: [],

  auditLogs: [],

  /* ── HOD DATA ──────────────────────────────────────────── */
  hodStats: { students: 0, avg_att: 0, at_risk: 0, pending_leaves: 0 },

  atRiskStudents: [],

  leaveRequests: [],

  /* ── FACULTY DATA ──────────────────────────────────────── */
  facultyStats: { subjects: 0, students: 0, defaulters: 0, classes_today: 0 },

  todaysClasses: [],

  defaulters: [],

  attendanceHistory: [],

  attendanceStudents: [],

  /* ── STUDENT DATA ──────────────────────────────────────── */
  studentStats: { overall_pct: 0, total_present: 0, total_absent: 0, at_risk_count: 0 },

  majorSubjects: [],

  minorSubjects: [],

  dailyHistory: [],

  pastLeaves: [],

  /* ── SUBSTITUTE DATA ───────────────────────────────────── */
  staffList: [],
  
  substituteRequests: [],

  /* ── MARKS DATA ────────────────────────────────────────── */
  examTypes: ['Internal 1', 'Internal 2', 'Mid-Term', 'Pre-Final'],

  gradeConfig: [
    { min:90, grade:'O',  label:'Outstanding',  color:'#22c55e' },
    { min:75, grade:'A+', label:'Excellent',     color:'#3b82f6' },
    { min:60, grade:'A',  label:'Very Good',     color:'#06b6d4' },
    { min:50, grade:'B+', label:'Good',          color:'#f59e0b' },
    { min:40, grade:'B',  label:'Average',       color:'#f97316' },
    { min:0,  grade:'F',  label:'Fail',          color:'#ef4444' },
  ],

  classList: [],

  marksEntry: [],

  studentMarks: [],

  deptMarksSummary: [],

};

/* ── SESSION HELPERS ─────────────────────────────────────── */
const Session = {
  set(role) { localStorage.setItem('sa_role', role); localStorage.setItem('sa_user', JSON.stringify(APP_DATA.session[role])); },
  get()     { return JSON.parse(localStorage.getItem('sa_user') || 'null'); },
  role()    { return localStorage.getItem('sa_role') || null; },
  clear()   { localStorage.removeItem('sa_role'); localStorage.removeItem('sa_user'); },
  guard(expectedRole) {
    const role = this.role();
    if (!role) { window.location.href = '/login.html'; return false; }
    if (expectedRole && role !== expectedRole) { window.location.href = '/403.html'; return false; }
    return true;
  }
};
