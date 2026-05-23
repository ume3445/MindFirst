/* ─── MindFirst Desktop · Dashboard Renderer ─────────────────── */
'use strict';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtMins(secs) {
  const m = Math.round(secs / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}m` : `${h}h`;
}

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return DAY_NAMES[d.getDay()];
}

// ─── Render today tab ─────────────────────────────────────────
function renderToday(today, limitMins) {
  const totalSecs = today.total || 0;
  const limitSecs = limitMins * 60;
  const pct = Math.min(100, Math.round((totalSecs / limitSecs) * 100));

  document.getElementById('today-total').textContent = fmtMins(totalSecs);

  // Ring
  const circumference = 2 * Math.PI * 18; // ≈ 113.1
  const arc = circumference - (pct / 100) * circumference;
  const ringArc = document.getElementById('ring-arc');
  ringArc.style.strokeDashoffset = arc;
  ringArc.classList.toggle('ring-warn',   pct >= 50 && pct < 90);
  ringArc.classList.toggle('ring-danger', pct >= 90);
  document.getElementById('ring-pct').textContent = `${pct}%`;

  // App list
  const appList = document.getElementById('app-list');
  const noAct   = document.getElementById('no-activity');
  const apps    = Object.entries(today.apps || {}).sort(([, a], [, b]) => b - a);

  if (apps.length === 0) {
    noAct.style.display = 'block';
    return;
  }
  noAct.style.display = 'none';

  const maxSecs = apps[0][1];
  appList.innerHTML = '';
  apps.forEach(([name, secs]) => {
    const barPct = maxSecs > 0 ? Math.round((secs / maxSecs) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'app-row';
    row.innerHTML = `
      <span class="app-name">${name}</span>
      <div class="app-bar-wrap">
        <div class="app-bar" style="width:${barPct}%"></div>
      </div>
      <span class="app-time">${fmtMins(secs)}</span>
    `;
    appList.appendChild(row);
  });
}

// ─── Render week tab ──────────────────────────────────────────
function renderWeek(today, history) {
  // Build last 7 days (oldest → newest)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    if (ds === today.date) {
      days.push({ date: ds, total: today.total, apps: today.apps });
    } else {
      const h = history.find(r => r.date === ds);
      days.push(h || { date: ds, total: 0, apps: {} });
    }
  }

  const maxTotal = Math.max(...days.map(d => d.total), 1);
  const todayStr = new Date().toDateString();

  // Bar chart
  const chart = document.getElementById('week-chart');
  chart.innerHTML = '';
  days.forEach(day => {
    const heightPct = Math.max(2, Math.round((day.total / maxTotal) * 100));
    const label = fmtDate(day.date);
    const isToday = day.date === todayStr;
    const col = document.createElement('div');
    col.className = 'week-bar-col';
    col.innerHTML = `
      <div class="week-bar" style="height:${heightPct}%;${isToday ? 'opacity:1' : 'opacity:0.55'}"></div>
      <span class="week-day-label${isToday ? ' today' : ''}">${label}</span>
    `;
    col.title = `${fmtDate(day.date)}: ${fmtMins(day.total)}`;
    chart.appendChild(col);
  });

  // Totals by app across the week
  const appTotals = {};
  days.forEach(d => {
    Object.entries(d.apps || {}).forEach(([name, secs]) => {
      appTotals[name] = (appTotals[name] || 0) + secs;
    });
  });

  const weekTotal = Object.values(appTotals).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(appTotals).sort(([, a], [, b]) => b - a);

  const totals = document.getElementById('week-totals');
  totals.innerHTML = `
    <div class="week-total-row">
      <span class="wt-label">Total this week</span>
      <span class="wt-val">${fmtMins(weekTotal)}</span>
    </div>
    ${sorted.map(([name, secs]) => `
      <div class="week-total-row">
        <span>${name}</span>
        <span class="wt-val">${fmtMins(secs)}</span>
      </div>
    `).join('')}
  `;
}

// ─── Tab switching ────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ─── Close button ─────────────────────────────────────────────
document.getElementById('close-btn').addEventListener('click', () => window.mf.close());

// ─── Settings ─────────────────────────────────────────────────
document.getElementById('save-limit-btn').addEventListener('click', async () => {
  const val = parseInt(document.getElementById('limit-input').value);
  if (!val || val < 10) return;
  await window.mf.setLimit(val);
  const status = document.getElementById('save-status');
  status.textContent = '✓ Saved';
  setTimeout(() => { status.textContent = ''; }, 2500);
});

// ─── Load + render ────────────────────────────────────────────
async function load() {
  const { today, history, settings } = await window.mf.getData();
  document.getElementById('limit-input').value = settings.dailyLimitMinutes;
  renderToday(today, settings.dailyLimitMinutes);
  renderWeek(today, history);
}

load();

// Refresh data every 5 seconds while open
setInterval(load, 5000);
