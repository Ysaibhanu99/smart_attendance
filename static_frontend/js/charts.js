/* ============================================================
   SMART ATTENDANCE — CHARTS JS
   All Chart.js configurations for dashboards
   ============================================================ */

/* ── GLOBAL CHART.JS DEFAULTS ─────────────────────────────── */
function applyChartDefaults() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = '#64748b';
  Chart.defaults.borderColor = '#e5e7eb';
  Chart.defaults.font.family = 'DM Sans';
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = '#ffffff';
  Chart.defaults.plugins.tooltip.borderColor = '#e5e7eb';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = '#1e293b';
  Chart.defaults.plugins.tooltip.bodyColor = '#64748b';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
}

/* ── ATTENDANCE TREND CHART (line) ────────────────────────── */
function renderAttendanceTrendChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const colors = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];

  const chartDatasets = datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    borderColor: colors[i % colors.length],
    backgroundColor: colors[i % colors.length] + '15',
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: colors[i % colors.length],
    fill: false,
    tension: 0.35
  }));

  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: chartDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: {
          grid: { color: '#e5e7eb' },
          ticks: { maxRotation: 0 }
        },
        y: {
          min: 0, max: 100,
          grid: { color: '#e5e7eb' },
          ticks: {
            callback: val => val + '%'
          }
        }
      }
    }
  });
}

/* ── SUBJECT-WISE BAR CHART ───────────────────────────────── */
function renderSubjectBarChart(canvasId, labels, data, thresholds) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const bgColors = data.map(v => {
    if (v >= 80) return 'rgba(34,197,94,0.7)';
    if (v >= 75) return 'rgba(245,158,11,0.7)';
    return 'rgba(239,68,68,0.7)';
  });

  const borderColors = data.map(v => {
    if (v >= 80) return '#22c55e';
    if (v >= 75) return '#f59e0b';
    return '#ef4444';
  });

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Attendance %',
        data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y}%`
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          min: 0, max: 100,
          grid: { color: '#e5e7eb' },
          ticks: { callback: val => val + '%' }
        }
      }
    }
  });
}

/* ── DEPARTMENT COMPARISON CHART (horizontal bar) ─────────── */
function renderDeptComparisonChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Avg Attendance %',
        data,
        backgroundColor: 'rgba(59,130,246,0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          min: 0, max: 100,
          grid: { color: '#e5e7eb' },
          ticks: { callback: val => val + '%' }
        },
        y: { grid: { display: false } }
      }
    }
  });
}

/* ── AT-RISK DONUT CHART ──────────────────────────────────── */
function renderAtRiskDonut(canvasId, safe, warning, danger) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Safe (≥80%)', 'At Risk (75-79%)', 'Danger (<75%)'],
      datasets: [{
        data: [safe, warning, danger],
        backgroundColor: [
          'rgba(34,197,94,0.7)',
          'rgba(245,158,11,0.7)',
          'rgba(239,68,68,0.7)'
        ],
        borderColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 1,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
}

/* ── WEEKLY ATTENDANCE HEATMAP-STYLE BAR ──────────────────── */
function renderWeeklyBarChart(canvasId, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Attendance %',
        data: data || [88, 92, 76, 85, 70, 80],
        backgroundColor: 'rgba(59,130,246,0.5)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          min: 0, max: 100,
          grid: { color: '#e5e7eb' },
          ticks: { callback: val => val + '%' }
        }
      }
    }
  });
}

/* ── FACULTY CLASS PERFORMANCE LINE ────────────────────────── */
function renderFacultyTrendChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Class Avg %',
        data,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168,85,247,0.08)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#a855f7',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#e5e7eb' } },
        y: {
          min: 50, max: 100,
          grid: { color: '#e5e7eb' },
          ticks: { callback: val => val + '%' }
        }
      }
    }
  });
}

/* ── SEMESTER PROGRESS CHART ──────────────────────────────── */
function renderSemesterProgressChart(canvasId, labels, studentData, avgData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Your Attendance',
          data: studentData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6',
          fill: true,
          tension: 0.35
        },
        {
          label: 'Class Average',
          data: avgData,
          borderColor: '#64748b',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { color: '#e5e7eb' } },
        y: {
          min: 0, max: 100,
          grid: { color: '#e5e7eb' },
          ticks: { callback: val => val + '%' }
        }
      }
    }
  });
}

/* ── INIT ALL CHARTS ON PAGE ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyChartDefaults();

  // Each page auto-calls its specific chart init function
  // using data attributes or inline calls in HTML
  if (typeof initPageCharts === 'function') {
    initPageCharts();
  }
});
