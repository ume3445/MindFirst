const STORAGE_KEY = "mf_log";
const LIMIT_KEY   = "mf_limit";
const STREAK_KEY  = "mf_streak";
const DAILY_LIMIT = 10;

const CAT_LABELS = {
  study:    "Study/Work",
  creative: "Creative",
  personal: "Personal",
  lookup:   "Quick Lookup",
};

const CAT_BADGE = {
  study:    "badge-study",
  creative: "badge-creative",
  personal: "badge-personal",
  lookup:   "badge-lookup",
};

function getToday() { return new Date().toDateString(); }

function load() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function save(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function getLimit() {
  return parseInt(localStorage.getItem(LIMIT_KEY) || DAILY_LIMIT);
}

function render() {
  const history = load();
  const limit   = getLimit();
  const today   = getToday();

  const todaySessions   = history.filter((h) => h.date === today);
  const intentionalToday = todaySessions.filter((h) => h.countsAgainstLimit).length;
  const freeToday        = todaySessions.filter((h) => !h.countsAgainstLimit).length;

  // Streak (consecutive days with at least 1 intentional session)
  const streak = calcStreak(history);

  document.getElementById("s-intentional").textContent = intentionalToday;
  document.getElementById("s-free").textContent        = freeToday;
  document.getElementById("s-streak").textContent      = streak;

  // Limit bar
  const pct = Math.min(100, Math.round((intentionalToday / limit) * 100));
  document.getElementById("limit-text").textContent = `${intentionalToday} / ${limit} intentional uses today`;
  const bar = document.getElementById("limit-bar");
  setTimeout(() => { bar.style.width = pct + "%"; }, 80);
  bar.className = pct >= 100 ? "full" : pct >= 70 ? "warn" : "";

  // Today's history
  const list  = document.getElementById("history-list");
  const empty = document.getElementById("history-empty");
  list.innerHTML = "";

  if (todaySessions.length === 0) {
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    todaySessions.forEach((item) => {
      const el = document.createElement("div");
      el.className = "h-item";
      const badgeCls = CAT_BADGE[item.category] || "";
      const label    = CAT_LABELS[item.category] || item.category || "—";
      el.innerHTML = `
        <div class="h-left">
          <span class="h-site">${item.site || "unknown"}</span>
          ${item.preview ? `<span class="h-preview">${item.preview}</span>` : ""}
        </div>
        <span class="h-badge ${badgeCls}">${label}</span>
      `;
      list.appendChild(el);
    });
  }

  // All-time counts
  const counts = { study: 0, creative: 0, personal: 0, lookup: 0 };
  history.forEach((h) => { if (counts[h.category] !== undefined) counts[h.category]++; });
  document.getElementById("at-study").textContent    = counts.study;
  document.getElementById("at-creative").textContent = counts.creative;
  document.getElementById("at-personal").textContent = counts.personal;
  document.getElementById("at-lookup").textContent   = counts.lookup;
}

function calcStreak(history) {
  const days = [...new Set(
    history.filter((h) => h.countsAgainstLimit).map((h) => h.date)
  )];
  if (days.length === 0) return 0;

  let streak = 0;
  let check  = new Date();
  check.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dayStr = check.toDateString();
    if (days.includes(dayStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ── State
let selectedCat  = null;
let selectedSite = null;

// Category buttons
document.querySelectorAll(".cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedCat = { id: btn.dataset.id, countsAgainstLimit: btn.dataset.counts === "true" };

    const thinkSection = document.getElementById("think-section");
    thinkSection.style.display = selectedCat.countsAgainstLimit ? "block" : "none";

    updateLogBtn();
  });
});

// Site buttons
document.querySelectorAll(".site-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".site-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedSite = btn.dataset.site;
    updateLogBtn();
  });
});

function updateLogBtn() {
  document.getElementById("log-btn").disabled = !(selectedCat && selectedSite);
}

// Log button
document.getElementById("log-btn").addEventListener("click", () => {
  if (!selectedCat || !selectedSite) return;

  const preview = (document.getElementById("think-input")?.value || "").trim().slice(0, 120);
  const history = load();

  history.unshift({
    date:               getToday(),
    timestamp:          Date.now(),
    site:               selectedSite,
    category:           selectedCat.id,
    categoryLabel:      CAT_LABELS[selectedCat.id],
    countsAgainstLimit: selectedCat.countsAgainstLimit,
    preview,
    source: "manual",
  });

  save(history.slice(0, 200));

  // Reset UI
  document.querySelectorAll(".cat-btn, .site-btn").forEach((b) => b.classList.remove("selected"));
  if (document.getElementById("think-input")) document.getElementById("think-input").value = "";
  document.getElementById("think-section").style.display = "none";
  selectedCat = null;
  selectedSite = null;
  updateLogBtn();

  showToast("Session logged ✓");
  render();
});

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

render();
