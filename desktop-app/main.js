/* ─── MindFirst Desktop · Main Process ───────────────────────── */

'use strict';

const {
  app, BrowserWindow, Tray, Menu,
  nativeImage, Notification, ipcMain, screen,
} = require('electron');
const path = require('path');
const fs   = require('fs');
const { exec } = require('child_process');

// ─── Data persistence (plain JSON, no external deps) ──────────
const DATA_PATH = path.join(app.getPath('userData'), 'mindfirst-data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    }
  } catch (_) {}
  return { settings: { dailyLimitMinutes: 120 }, today: null, history: [] };
}

function saveData(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (_) {}
}

// ─── AI App definitions ───────────────────────────────────────
// Each entry: { canonical name, substrings to match in app name }
const AI_APP_DEFS = [
  { name: 'ChatGPT',    match: ['chatgpt'] },
  { name: 'Claude',     match: ['claude'] },
  { name: 'Copilot',    match: ['copilot'] },
  { name: 'Notion',     match: ['notion'] },
  { name: 'Perplexity', match: ['perplexity'] },
];

function classifyApp(appName) {
  if (!appName) return null;
  const lower = appName.toLowerCase();

  for (const def of AI_APP_DEFS) {
    if (def.match.some(m => lower.includes(m))) return def.name;
  }
  // Any app whose name contains " AI" or "AI " (standalone word)
  if (/\bai\b/i.test(appName)) return appName;

  return null;
}

// ─── Active-app detection via AppleScript ─────────────────────
function getActiveApp() {
  return new Promise(resolve => {
    exec(
      `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
      { timeout: 1800 },
      (err, stdout) => resolve(err ? null : stdout.trim()),
    );
  });
}

// ─── Day management ───────────────────────────────────────────
function todayStr() {
  return new Date().toDateString();
}

function ensureToday(data) {
  const today = todayStr();
  if (!data.today || data.today.date !== today) {
    // Archive previous day if it had activity
    if (data.today && data.today.total > 0) {
      data.history.unshift(data.today);
      data.history = data.history.slice(0, 60); // keep 60 days
    }
    data.today = { date: today, apps: {}, total: 0 };
    data.settings.notified50 = false;
    data.settings.notified90 = false;
    saveData(data);
  }
  return data;
}

// ─── Tracking state ───────────────────────────────────────────
let appData = loadData();
let lastAIApp    = null;  // canonical name of currently active AI app, or null
let lastTickTime = null;  // Date.now() of last tick
let ticking      = false; // prevent overlapping ticks
let tray         = null;
let dashboardWin = null;

// ─── Time accumulation ────────────────────────────────────────
function addUsage(aiApp, seconds) {
  ensureToday(appData);
  appData.today.apps[aiApp] = (appData.today.apps[aiApp] || 0) + seconds;
  appData.today.total = Object.values(appData.today.apps).reduce((a, b) => a + b, 0);
  saveData(appData);
  checkNotifications();
  updateTrayTitle();
}

function checkNotifications() {
  const limitSecs = (appData.settings.dailyLimitMinutes || 120) * 60;
  const total     = appData.today.total;
  const pct       = total / limitSecs;

  if (pct >= 0.5 && !appData.settings.notified50) {
    appData.settings.notified50 = true;
    saveData(appData);
    notify(
      'You are halfway through your AI time today',
      `${Math.round(total / 60)} of ${appData.settings.dailyLimitMinutes} minutes used.`,
    );
  }
  if (pct >= 0.9 && !appData.settings.notified90) {
    appData.settings.notified90 = true;
    saveData(appData);
    notify(
      'You are almost at your AI limit for today',
      `${Math.round(total / 60)} of ${appData.settings.dailyLimitMinutes} minutes used. Consider a break.`,
    );
  }
}

function notify(title, body) {
  if (!Notification.isSupported()) return;
  new Notification({ title: `◈ MindFirst — ${title}`, body, silent: false }).show();
}

// ─── Tray title (shows minutes used today) ────────────────────
function updateTrayTitle() {
  if (!tray) return;
  const mins = Math.round((appData.today?.total || 0) / 60);
  tray.setTitle(mins > 0 ? `${mins}m` : '');
}

// ─── Main tracking poll (runs every 2 seconds) ────────────────
async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const now     = Date.now();
    const rawApp  = await getActiveApp();
    const aiApp   = classifyApp(rawApp);

    if (aiApp && lastAIApp === aiApp && lastTickTime) {
      const elapsed = (now - lastTickTime) / 1000;
      if (elapsed <= 5) addUsage(aiApp, elapsed); // ignore gaps > 5s
    }

    lastAIApp    = aiApp;
    lastTickTime = now;
  } finally {
    ticking = false;
  }
}

// ─── Daily summary at 10 pm ───────────────────────────────────
function scheduleDailySummary() {
  function msUntil10pm() {
    const t = new Date();
    t.setHours(22, 0, 0, 0);
    if (t <= Date.now()) t.setDate(t.getDate() + 1);
    return t - Date.now();
  }

  setTimeout(function fire() {
    const d = ensureToday(appData).today;
    if (d.total >= 60) {
      const mins  = Math.round(d.total / 60);
      const lines = Object.entries(d.apps)
        .sort(([, a], [, b]) => b - a)
        .map(([name, s]) => `${name}: ${Math.round(s / 60)}m`)
        .join(' · ');
      notify(`Daily Summary — ${mins} min total`, lines);
    }
    setTimeout(fire, 24 * 60 * 60 * 1000); // repeat each day
  }, msUntil10pm());
}

// ─── Dashboard window ─────────────────────────────────────────
function createDashboard() {
  dashboardWin = new BrowserWindow({
    width: 360,
    height: 560,
    frame: false,
    resizable: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  dashboardWin.loadFile(path.join(__dirname, 'renderer', 'dashboard.html'));

  // Hide when it loses focus
  dashboardWin.on('blur', () => {
    if (dashboardWin && !dashboardWin.isDestroyed()) dashboardWin.hide();
  });

  dashboardWin.on('closed', () => { dashboardWin = null; });
}

function positionAndShow() {
  if (!tray || !dashboardWin) return;
  const tb  = tray.getBounds();
  const wb  = dashboardWin.getBounds();
  const disp = screen.getDisplayNearestPoint({ x: tb.x, y: tb.y });
  const wa  = disp.workArea;

  let x = Math.round(tb.x + tb.width / 2 - wb.width / 2);
  let y = tb.y + tb.height + 4;

  // Keep inside screen bounds
  x = Math.max(wa.x + 4, Math.min(x, wa.x + wa.width - wb.width - 4));
  y = Math.max(wa.y + 4, Math.min(y, wa.y + wa.height - wb.height - 4));

  dashboardWin.setPosition(x, y, false);
  dashboardWin.show();
  dashboardWin.focus();
}

function toggleDashboard() {
  if (!dashboardWin || dashboardWin.isDestroyed()) {
    createDashboard();
    dashboardWin.once('ready-to-show', positionAndShow);
  } else if (dashboardWin.isVisible()) {
    dashboardWin.hide();
  } else {
    positionAndShow();
  }
}

// ─── IPC handlers ─────────────────────────────────────────────
ipcMain.handle('get-data', () => {
  ensureToday(appData);
  return {
    today   : appData.today,
    history : appData.history,
    settings: {
      dailyLimitMinutes: appData.settings.dailyLimitMinutes || 120,
    },
  };
});

ipcMain.handle('set-limit', (_, minutes) => {
  const m = Math.max(1, Math.min(1440, parseInt(minutes) || 120));
  appData.settings.dailyLimitMinutes = m;
  appData.settings.notified50 = false;
  appData.settings.notified90 = false;
  saveData(appData);
  return { ok: true };
});

ipcMain.handle('close-dashboard', () => {
  if (dashboardWin && !dashboardWin.isDestroyed()) dashboardWin.hide();
});

// ─── App bootstrap ────────────────────────────────────────────
app.whenReady().then(() => {
  // Pure menu-bar app — no dock icon
  if (app.dock) app.dock.hide();

  ensureToday(appData);

  // Build tray icon
  const iconPath = path.join(__dirname, 'assets', 'trayIcon.png');
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('MindFirst');
  updateTrayTitle();

  // Left-click → dashboard
  tray.on('click', toggleDashboard);

  // Right-click → context menu
  tray.on('right-click', () => {
    tray.popUpContextMenu(Menu.buildFromTemplate([
      { label: 'MindFirst', enabled: false },
      { type: 'separator' },
      { label: 'Dashboard', click: toggleDashboard },
      { type: 'separator' },
      { label: 'Quit MindFirst', click: () => app.quit() },
    ]));
  });

  // Start polling
  setInterval(tick, 2000);

  // Daily summary
  scheduleDailySummary();
});

// Keep the app alive when all windows are closed
app.on('window-all-closed', e => e.preventDefault());
