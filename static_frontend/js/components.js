/* ============================================================
   COMPONENTS.JS
   Replaces Jinja2 {% extends %} and {% block %} system.
   Injects sidebar + topbar into every page via DOM injection.
   No fetch() needed — everything inline for local file:// use.
   ============================================================ */

/* ── SIDEBAR CONFIGS PER ROLE ────────────────────────────── */
const SIDEBARS = {
  admin: [
    { section: 'Overview' },
    { href: '../admin/dashboard.html', icon: 'fa-gauge-high',    label: 'Dashboard' },
    { section: 'Management' },
    { href: '../admin/departments.html',icon: 'fa-building',      label: 'Departments' },
    { href: '../admin/students.html',  icon: 'fa-user-graduate', label: 'Manage Students' },
    { href: '../admin/users.html',     icon: 'fa-users',         label: 'Manage Staff' },
    { href: '../admin/holidays.html',  icon: 'fa-calendar-xmark',label: 'Holidays' },
    { href: '../admin/leave-requests.html', icon:'fa-file-circle-check',label:'Leave Requests', badge: () => APP_DATA.hodStats.pending_leaves },
    { href: '../admin/history.html',   icon: 'fa-clock-rotate-left',label: 'History & Logs' },
    { section: 'Academics' },
    { href: '../admin/marks.html',     icon: 'fa-graduation-cap', label: 'Marks Overview' },
    { section: 'Reports' },
    { href: '../admin/at-risk.html',   icon: 'fa-triangle-exclamation', label: 'At-Risk Students' },
    { href: '../admin/analytics.html', icon: 'fa-chart-line',    label: 'Analytics' },
  ],
  hod: [
    { section: 'Overview' },
    { href: '../hod/dashboard.html',   icon: 'fa-gauge-high',         label: 'Dashboard' },
    { section: 'Department' },
    { href: '../hod/timetable.html',   icon: 'fa-calendar-week',      label: 'Manage Timetable' },
    { href: '../hod/students.html',    icon: 'fa-user-graduate',      label: 'Students' },
    { href: '../hod/at-risk.html',     icon: 'fa-triangle-exclamation',label:'At-Risk List' },
    { href: '../hod/leave-requests.html', icon:'fa-file-circle-check',label:'Leave Requests', badge: () => APP_DATA.hodStats.pending_leaves },
    { href: '../hod/substitute.html',  icon: 'fa-user-clock',         label: 'Manage Substitutes' },
    { href: '../hod/history.html',     icon: 'fa-clock-rotate-left',  label: 'History' },
    { section: 'Academics' },
    { href: '../hod/marks.html',       icon: 'fa-graduation-cap',     label: 'Marks Management' },
    { section: 'Reports' },
    { href: '../hod/analytics.html',   icon: 'fa-chart-bar',          label: 'Analytics' },
  ],
  faculty: [
    { section: 'Overview' },
    { href: '../faculty/dashboard.html',        icon: 'fa-gauge-high',      label: 'Dashboard' },
    { section: 'Attendance' },
    { href: '../faculty/mark-attendance.html',  icon: 'fa-clipboard-check', label: 'Mark Attendance' },
    { href: '../faculty/history.html',          icon: 'fa-clock-rotate-left',label: 'History' },
    { href: '../faculty/corrections.html',      icon: 'fa-pen-to-square',   label: 'Corrections' },
    { href: '../faculty/substitute.html',       icon: 'fa-user-clock',      label: 'Substitute Request' },
    { section: 'Academics' },
    { href: '../faculty/marks.html',            icon: 'fa-graduation-cap',  label: 'Enter Marks' },
    { section: 'Reports' },
    { href: '../faculty/at-risk.html',          icon: 'fa-triangle-exclamation', label: 'At-Risk List' },
  ],
  student: [
    { section: 'My Dashboard' },
    { href: '../student/dashboard.html',   icon: 'fa-gauge-high',       label: 'Dashboard' },
    { href: '../student/attendance.html',  icon: 'fa-calendar-check',   label: 'Attendance Details' },
    { section: 'Academics' },
    { href: '../student/marks.html',       icon: 'fa-graduation-cap',   label: 'My Marks' },
    { section: 'Leave' },
    { href: '../student/apply-leave.html', icon: 'fa-file-circle-plus', label: 'Apply for Leave' },
    { href: '../student/leave-status.html',icon: 'fa-list-check',       label: 'Leave Status' },
    { href: '../student/history.html',     icon: 'fa-clock-rotate-left',label: 'Full History' },
  ],
};

const ROLE_LABELS = { admin: 'Super Admin', hod: 'HOD', faculty: 'Faculty', student: 'Student' };
const ROLE_COLORS = { admin: '#a855f7', hod: '#3b82f6', faculty: '#22c55e', student: '#f59e0b' };

/* ── BUILD SIDEBAR HTML ──────────────────────────────────── */
function buildSidebar(role, activePath) {
  const user = Session.get() || APP_DATA.session[role];
  const items = SIDEBARS[role] || [];
  const currentFile = activePath || window.location.pathname.split('/').pop();

  let navHTML = '';
  items.forEach(item => {
    if (item.section) {
      navHTML += `<span class="nav-section-label">${item.section}</span>`;
    } else {
      const isActive = item.href && item.href.includes(currentFile);
      const badge = item.badge ? item.badge() : null;
      navHTML += `
        <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
          <i class="fa-solid ${item.icon}"></i> ${item.label}
          ${badge ? `<span style="margin-left:auto;background:var(--accent-red);color:#fff;font-size:10px;padding:1px 6px;border-radius:10px">${badge}</span>` : ''}
        </a>`;
    }
  });

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <span class="logo-mark">SmartAttend</span>
        <span class="logo-sub">SGCSR College · Rajam</span>
      </div>
      <div class="sidebar-role-badge" style="border-color:${ROLE_COLORS[role]}20;color:${ROLE_COLORS[role]};background:${ROLE_COLORS[role]}12">
        <i class="fa-solid fa-shield-halved" style="margin-right:5px"></i>
        ${ROLE_LABELS[role] || 'User'}
      </div>
      <nav class="sidebar-nav">${navHTML}</nav>
      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar">${user ? user.avatar || user.name[0].toUpperCase() : 'U'}</div>
          <div class="user-info">
            <div class="user-name">${user ? user.name : 'User'}</div>
            <div class="user-role">${ROLE_LABELS[role] || ''}</div>
          </div>
          <a href="../login.html" onclick="Session.clear()" title="Logout"
             style="color:var(--text-muted);font-size:14px">
            <i class="fa-solid fa-right-from-bracket"></i>
          </a>
        </div>
      </div>
    </aside>`;
}

/* ── BUILD TOPBAR HTML ───────────────────────────────────── */
function buildTopbar(pageTitle, role) {
  const userNotifications = APP_DATA.notifications || [];
  const showBadge = userNotifications.length > 0;
  
  let notifHTML = '';
  if (userNotifications.length === 0) {
    notifHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px"><i class="fa-regular fa-bell-slash" style="margin-right:6px"></i>No new alerts</div>`;
  } else {
    notifHTML = userNotifications.map(n => `
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:flex-start">
        <div style="background:#ef444420;color:#ef4444;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:12px"></i>
        </div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:13px;color:var(--text-primary);margin-bottom:2px">${n.title}</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.4">${n.message}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:6px"><i class="fa-regular fa-clock" style="margin-right:3px"></i>${n.date}</div>
        </div>
      </div>
    `).join('');
  }

  return `
    <div class="topbar">
      <button class="sidebar-toggle" id="sidebarToggle">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div class="topbar-title">${pageTitle || 'Dashboard'}</div>
      <div class="topbar-actions">
        <div class="topbar-btn" title="Notifications" id="notificationBtn" style="position:relative;cursor:pointer">
          <i class="fa-solid fa-bell"></i>
          ${showBadge ? `<span class="badge-dot" id="notificationDot" style="background:#ef4444"></span>` : ''}
          
          <!-- Dropdown Menu -->
          <div id="notificationDropdown" style="display:none;position:absolute;right:0;top:40px;width:320px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);z-index:100;overflow:hidden;text-align:left">
            <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-weight:600;font-size:14px;color:var(--text-primary);display:flex;justify-content:space-between;align-items:center">
              <span>System Alerts</span>
              ${showBadge ? `<span style="font-size:11px;background:#ef4444;color:#fff;padding:2px 6px;border-radius:10px">${userNotifications.length} active</span>` : ''}
            </div>
            <div style="max-height:280px;overflow-y:auto">
              ${notifHTML}
            </div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:5px">
          <i class="fa-regular fa-calendar"></i>
          <span id="currentDate"></span>
        </div>
      </div>
    </div>`;
}

/* ── MAIN INJECT FUNCTION ────────────────────────────────── */
function loadComponents(role, pageTitle, activePath) {
  // Guard: redirect to login if not authenticated
  const sessionRole = Session.role();
  if (!sessionRole) {
    // Allow login page to load without redirect
    if (!window.location.pathname.includes('login')) {
      window.location.href = '../login.html';
      return;
    }
  }

  const effectiveRole = sessionRole || role;

  // Build layout wrapper
  const layout = document.getElementById('app');
  if (!layout) return;

  layout.innerHTML = `
    <div class="layout">
      ${buildSidebar(effectiveRole, activePath)}
      <div class="main-wrap" id="mainWrap">
        ${buildTopbar(pageTitle, effectiveRole)}
        <div id="flashMessages" style="padding:0 24px"></div>
        <div class="page-content" id="pageContent">
          <!-- page-specific content injected by renderPage() -->
        </div>
      </div>
    </div>
    <div class="toast-container" id="toastContainer"></div>
  `;

  // Set date
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  // Mobile sidebar overlay
  const overlay = document.createElement('div');
  overlay.id = 'sidebarOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99;display:none';
  document.body.appendChild(overlay);

  // Init sidebar and notifications dropdown
  initSidebar();
  initNotifications();
}

/* ── NOTIFICATIONS DROPDOWN TOGGLER ───────────────────────── */
function initNotifications() {
  const btn = document.getElementById('notificationBtn');
  const dropdown = document.getElementById('notificationDropdown');
  const dot = document.getElementById('notificationDot');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = dropdown.style.display === 'none';
    dropdown.style.display = isClosed ? 'block' : 'none';
    if (isClosed && dot) {
      dot.style.display = 'none'; // Clear badge dot on click
    }
  });

  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
}

/* ── FLASH MESSAGE HELPER ────────────────────────────────── */
function flashMessage(msg, type = 'info') {
  const container = document.getElementById('flashMessages');
  if (!container) return;
  const iconMap = { success: 'circle-check', danger: 'circle-xmark', info: 'circle-info', warning: 'triangle-exclamation' };
  container.innerHTML = `
    <div class="alert alert-${type}" data-auto-dismiss style="margin-top:16px">
      <i class="fa-solid fa-${iconMap[type] || 'circle-info'}"></i> ${msg}
    </div>`;
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

/* ── SIDEBAR TOGGLE HELPER ───────────────────────────────── */
function initSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar   = document.getElementById('sidebar');
  const mainWrap  = document.getElementById('mainWrap');
  const overlay   = document.getElementById('sidebarOverlay');

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Mobile: slide-in with dark overlay
      const isOpen = sidebar.classList.toggle('open');
      overlay.style.display = isOpen ? 'block' : 'none';
    } else {
      // Desktop: collapse sidebar and shift main content
      const isCollapsed = sidebar.classList.toggle('collapsed');
      if (mainWrap) mainWrap.classList.toggle('sidebar-collapsed', isCollapsed);
    }
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    });
  }
}
