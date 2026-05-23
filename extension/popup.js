/* ─── Try First · Popup Dashboard v2 ────────────────────────── */

chrome.storage.local.get(['stats', 'apiKey'], (data) => {
  const stats = data.stats || {
    thinkingTasks : 0,
    lookupTasks   : 0,
    answered      : 0,
    skipped       : 0,
    streak        : 0,
    lastAnswerDate: '',
  };

  // ── API key warning
  if (!data.apiKey) {
    document.getElementById('no-key-banner').style.display = 'flex';
  }

  // ── Thinking Ratio
  const ratio = stats.thinkingTasks > 0
    ? Math.round((stats.answered / stats.thinkingTasks) * 100)
    : null;

  const ratioEl = document.getElementById('ratio-num');
  ratioEl.textContent = ratio !== null ? ratio + '%' : '—';

  // Colour-code the ratio
  if (ratio !== null) {
    if (ratio >= 70) ratioEl.classList.add('ratio-good');
    else if (ratio >= 40) ratioEl.classList.add('ratio-mid');
    else ratioEl.classList.add('ratio-low');
  }

  // ── Streak
  document.getElementById('streak-num').textContent = stats.streak || 0;

  // ── Ratio bar
  const barPct = ratio !== null ? ratio : 0;
  setTimeout(() => {
    const bar = document.getElementById('ratio-bar');
    bar.style.width = barPct + '%';
    if (barPct >= 70) bar.classList.add('bar-good');
    else if (barPct >= 40) bar.classList.add('bar-mid');
    else bar.classList.add('bar-low');
  }, 80);

  document.getElementById('answered-label').textContent =
    `${stats.answered} answered`;
  document.getElementById('skipped-label').textContent =
    `${stats.skipped} skipped`;

  // ── Breakdown
  document.getElementById('count-thinking').textContent = stats.thinkingTasks;
  document.getElementById('count-lookup').textContent   = stats.lookupTasks;
  document.getElementById('count-answered').textContent = stats.answered;
  document.getElementById('count-skipped').textContent  = stats.skipped;

  // ── Recent activity — stored as simple log entries in stats.log
  chrome.storage.local.get(['activityLog'], (logData) => {
    const log = logData.activityLog || [];
    const list  = document.getElementById('history-list');
    const empty = document.getElementById('empty-state');
    const titleEl = document.getElementById('activity-title');

    if (log.length === 0) {
      list.style.display    = 'none';
      titleEl.style.display = 'none';
      empty.style.display   = 'block';
      return;
    }

    log.slice(0, 8).forEach((item) => {
      const isThinking = item.type === 'THINKING';
      const answered   = item.answered;
      const site = (item.site || '').replace('www.', '').split('.')[0];
      const timeAgo = formatTime(item.ts);

      const el = document.createElement('div');
      el.className = 'history-item';

      let badge, badgeClass;
      if (!isThinking) {
        badge = 'Lookup';
        badgeClass = 'badge-lookup';
      } else if (answered) {
        badge = 'Tried First ✓';
        badgeClass = 'badge-answered';
      } else {
        badge = 'Skipped';
        badgeClass = 'badge-skipped';
      }

      el.innerHTML = `
        <div class="history-row">
          <span class="history-site">${site || 'AI site'}</span>
          <span class="history-badge ${badgeClass}">${badge}</span>
        </div>
        <div class="history-time">${timeAgo}</div>
      `;
      list.appendChild(el);
    });
  });
});

// ── Settings button → open options page
document.getElementById('settings-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ── No-key banner → open options
document.getElementById('open-options-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ── Helpers
function formatTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
