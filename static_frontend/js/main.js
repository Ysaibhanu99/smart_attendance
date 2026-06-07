/* ============================================================
   SMART ATTENDANCE — MAIN JS
   Global utilities, sidebar, tabs, toasts, modals
   ============================================================ */

/* ── TABS ────────────────────────────────────────────────── */
function initTabs(containerSelector) {
  const containers = document.querySelectorAll(containerSelector || '.tabs-container');
  containers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const contents = container.querySelectorAll('.tab-content');

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        if (contents[idx]) contents[idx].classList.add('active');
      });
    });

    // Activate first tab
    if (buttons[0]) buttons[0].classList.add('active');
    if (contents[0]) contents[0].classList.add('active');
  });
}

/* ── TOAST ───────────────────────────────────────────────── */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info:    'fa-circle-info'
  };

  const colors = {
    success: '#22c55e',
    error:   '#ef4444',
    warning: '#f59e0b',
    info:    '#3b82f6'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}" style="color:${colors[type]};font-size:15px;flex-shrink:0"></i>
    <span style="flex:1">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:0 2px">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── MODAL ───────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function initModals() {
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('open');
    });
  });

  // Open triggers
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-open-modal');
      openModal(target);
    });
  });
}

/* ── CONFIRM DIALOG ──────────────────────────────────────── */
function confirmAction(message, onConfirm) {
  const id = 'confirmModal';
  let modal = document.getElementById(id);

  if (!modal) {
    modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <span class="modal-title">Confirm Action</span>
          <button class="modal-close" data-close-modal><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <p id="confirmMsg" style="color:var(--text-secondary);font-size:13.5px;line-height:1.6"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost btn-sm" data-close-modal>Cancel</button>
          <button id="confirmOkBtn" class="btn btn-danger btn-sm">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    initModals();
  }

  document.getElementById('confirmMsg').textContent = message;
  openModal(id);

  const okBtn = document.getElementById('confirmOkBtn');
  const newBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newBtn, okBtn);
  newBtn.addEventListener('click', () => {
    closeModal(id);
    onConfirm();
  });
}

/* ── SEARCH/FILTER TABLE ──────────────────────────────────── */
function initTableSearch(inputId, tableBodyId) {
  const input = document.getElementById(inputId);
  const tbody = document.getElementById(tableBodyId);
  if (!input || !tbody) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    tbody.querySelectorAll('tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

/* ── FLASH MESSAGE AUTO-DISMISS ───────────────────────────── */
function initAlerts() {
  document.querySelectorAll('.alert[data-auto-dismiss]').forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.4s';
      setTimeout(() => alert.remove(), 400);
    }, 4000);
  });
}

/* ── ATTENDANCE BULK TOGGLE ───────────────────────────────── */
function initAttendanceMarking() {
  const markAllPresentBtn = document.getElementById('markAllPresent');
  if (!markAllPresentBtn) return;

  markAllPresentBtn.addEventListener('click', () => {
    document.querySelectorAll('.att-btn.present').forEach(btn => btn.click());
    showToast('All students marked Present', 'success');
  });

  // Individual toggle logic
  document.querySelectorAll('.att-student-row').forEach(row => {
    const buttons = row.querySelectorAll('.att-btn');
    const hiddenInput = row.querySelector('input[type="hidden"]');

    // Default: present
    const presentBtn = row.querySelector('.att-btn.present');
    if (presentBtn) {
      presentBtn.classList.add('active');
      if (hiddenInput) hiddenInput.value = 'present';
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (hiddenInput) {
          if (btn.classList.contains('present')) hiddenInput.value = 'present';
          else if (btn.classList.contains('absent')) hiddenInput.value = 'absent';
          else if (btn.classList.contains('excused')) hiddenInput.value = 'excused';
        }
      });
    });
  });

  // Timer countdown (30-second mark)
  startMarkingTimer();
}

function startMarkingTimer() {
  const timerEl = document.getElementById('markingTimer');
  if (!timerEl) return;

  let seconds = 0;
  setInterval(() => {
    seconds++;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

/* ── PROGRESS BAR ANIMATION ───────────────────────────────── */
function animateProgressBars() {
  document.querySelectorAll('.progress-fill').forEach(bar => {
    const target = bar.getAttribute('data-width') || bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = target;
    }, 100);
  });
}

/* ── FETCH WRAPPER ────────────────────────────────────────── */
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    showToast(`Request failed: ${err.message}`, 'error');
    throw err;
  }
}

/* ── AI INSIGHT LOADER ────────────────────────────────────── */
function loadAIInsight(containerId, endpoint, payload = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="ai-label"><i class="fa-solid fa-microchip-ai"></i> AI Insight</div>
    <div class="ai-content" style="color:var(--text-muted)">
      <i class="fa-solid fa-circle-notch fa-spin" style="margin-right:6px"></i>
      Generating insight...
    </div>
  `;

  apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(data => {
    container.innerHTML = `
      <div class="ai-label"><i class="fa-solid fa-microchip-ai"></i> AI Insight</div>
      <div class="ai-content">${data.insight || data.message || 'No insight available.'}</div>
    `;
  }).catch(() => {
    container.innerHTML = `
      <div class="ai-label"><i class="fa-solid fa-microchip-ai"></i> AI Insight</div>
      <div class="ai-content" style="color:var(--text-muted)">Could not generate insight. Please try again later.</div>
    `;
  });
}

/* ── CHART THEME DEFAULTS ─────────────────────────────────── */
const chartDefaults = {
  color: '#64748b',
  borderColor: '#e5e7eb',
  backgroundColor: 'transparent',
  font: { family: 'DM Sans', size: 12 }
};

function getChartColors() {
  return {
    blue:   'rgba(59,130,246,',
    green:  'rgba(34,197,94,',
    red:    'rgba(239,68,68,',
    amber:  'rgba(245,158,11,',
    purple: 'rgba(168,85,247,',
    cyan:   'rgba(6,182,212,'
  };
}

/* ── INIT ON DOM READY ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // initSidebar handled by components.js loadComponents()
  initTabs();
  initModals();
  initAlerts();
  animateProgressBars();
  initAttendanceMarking();
});
