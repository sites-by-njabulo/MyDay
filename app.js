/* ==========================================================
   1. CONFIG
   ========================================================== */
// CHANGE THIS to your real password before you start using the app for real.
// This is a casual deterrent only, not real security (visible in page source).
const APP_PASSWORD = "02233";

const STORAGE_KEY = "myday_state";
const SESSION_UNLOCK_KEY = "myday_unlocked";

const DEFAULT_GOALS = { pushups: 200, curls: 100 };
const CHALLENGE_TARGET = 10000;
const CHALLENGE_DURATION_DAYS = 60;

// Inline SVG icons (replace emoji throughout the UI).
const ICONS = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.2-4.4-9.5-8.6C1 9 2 5.8 5 4.8c2-0.7 4 0.3 5 2 1-1.7 3-2.7 5-2 3 1 4 4.2 2.5 7.1-2.3 4.2-9.5 8.6-9.5 8.6z"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5c2-1 5-1 8 0v14c-3-1-6-1-8 0z"/><path d="M20 5.5c-2-1-5-1-8 0v14c3-1 6-1 8 0z"/></svg>`,
  dumbbell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="4" height="6" rx="1"/><rect x="18" y="9" width="4" height="6" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l9.5 16.5H2.5z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7.5 11l4.5 4.5L16.5 11"/><path d="M4 18.5h16"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4"/><path d="M7.5 8.5L12 4l4.5 4.5"/><path d="M4 18.5h16"/></svg>`
};

/* ==========================================================
   2. STORAGE
   ========================================================== */
function defaultState() {
  return {
    schemaVersion: 1,
    days: {},
    todos: [],
    videoPlan: [],
    challenge: { startDate: null, targetAmount: CHALLENGE_TARGET, durationDays: CHALLENGE_DURATION_DAYS, entries: [] },
    settings: { prayerReminderTime: "07:00", workoutReminderTime: "18:00" }
  };
}

// Migrates older saved data to the current shape:
// - day.todos (nested per-day) -> flat state.todos with a date field
// - day.faith.prayerDone (boolean) -> day.faith.prayerCount (number)
function migrateState(s) {
  Object.keys(s.days || {}).forEach(dateKey => {
    const day = s.days[dateKey];
    if (Array.isArray(day.todos)) {
      day.todos.forEach(t => s.todos.push({ id: t.id, text: t.text, done: t.done, date: dateKey }));
      delete day.todos;
    }
    if (day.faith && typeof day.faith.prayerCount === "undefined") {
      day.faith.prayerCount = day.faith.prayerDone ? 1 : 0;
      delete day.faith.prayerDone;
    }
  });
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return migrateState(Object.assign(defaultState(), parsed));
  } catch (e) {
    console.error("Failed to load state, resetting.", e);
    return defaultState();
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function ensureDayRecord(dateKey) {
  if (!state.days[dateKey]) {
    state.days[dateKey] = {
      faith: { prayerCount: 0, bibleReadingDone: false },
      workout: {
        pushups: { count: 0, goal: DEFAULT_GOALS.pushups },
        curls: { count: 0, goal: DEFAULT_GOALS.curls }
      }
    };
    saveState();
  }
  return state.days[dateKey];
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Apple Health-style circular progress ring. centerHtml is absolutely positioned over the SVG.
function ring(pct, size, stroke, centerHtml) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);
  const cx = size / 2, cy = size / 2;
  return `
    <div class="ring" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <circle class="ring-track" cx="${cx}" cy="${cy}" r="${r}" stroke-width="${stroke}" fill="none"/>
        <circle class="ring-fill" cx="${cx}" cy="${cy}" r="${r}" stroke-width="${stroke}" fill="none"
          stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
          transform="rotate(-90 ${cx} ${cy})"/>
      </svg>
      ${centerHtml ? `<div class="ring-center">${centerHtml}</div>` : ""}
    </div>
  `;
}

/* ==========================================================
   3. AUTH
   ========================================================== */
const lockView = document.getElementById("lock-view");
const appView = document.getElementById("app-view");
const lockForm = document.getElementById("lock-form");
const lockInput = document.getElementById("lock-input");
const lockError = document.getElementById("lock-error");
const lockCard = document.querySelector(".lock-card");

function isUnlocked() {
  return sessionStorage.getItem(SESSION_UNLOCK_KEY) === "true";
}

function unlockApp() {
  sessionStorage.setItem(SESSION_UNLOCK_KEY, "true");
  lockView.classList.add("hidden");
  appView.classList.remove("hidden");
  initApp();
}

function showLock() {
  lockView.classList.remove("hidden");
  appView.classList.add("hidden");
}

lockForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (lockInput.value === APP_PASSWORD) {
    lockError.classList.remove("show");
    unlockApp();
  } else {
    lockError.classList.add("show");
    lockCard.classList.remove("shake");
    requestAnimationFrame(() => lockCard.classList.add("shake"));
    lockInput.value = "";
    lockInput.focus();
  }
});

/* ==========================================================
   4. NAV ROUTER
   ========================================================== */
const mainNav = document.getElementById("main-nav");

function showSection(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.dataset.page === name));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === name));
  renderSection(name);
}

mainNav.addEventListener("click", function (e) {
  const btn = e.target.closest(".nav-item");
  if (!btn) return;
  showSection(btn.dataset.section);
});

function renderSection(name) {
  switch (name) {
    case "home": renderHome(); break;
    case "todo": renderTodo(); break;
    case "faith": renderFaith(); break;
    case "workout": renderWorkout(); break;
    case "video": renderVideoPlan(); break;
    case "challenge": renderChallenge(); break;
    case "calendar": renderCalendar(); break;
    case "settings": renderSettings(); break;
  }
}

/* ==========================================================
   5. HOME
   ========================================================== */
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function cycleIndex() {
  return (new Date().getDate() - 1) % 30;
}

function renderHome() {
  const today = new Date();
  const todayKey = getTodayKey();
  const dateLabel = `${WEEKDAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;
  const idx = cycleIndex();
  const verse = VERSES[idx];
  const quote = QUOTES[idx];
  const day = ensureDayRecord(todayKey);

  const todosToday = state.todos.filter(t => t.date <= todayKey);
  const todosTotal = todosToday.length;
  const todosDone = todosToday.filter(t => t.done).length;
  const pushups = day.workout.pushups;
  const curls = day.workout.curls;
  const cs = getChallengeStats();

  document.getElementById("page-home").innerHTML = `
    <div class="home-header">
      <p class="home-eyebrow">Today</p>
      <h1 class="home-date">${dateLabel}</h1>
    </div>

    <div class="overview-card">
      <h2 class="section-heading">Today's overview</h2>
      <div class="overview-grid">
        <div class="overview-chip ring-chip ${todosTotal > 0 && todosDone === todosTotal ? "done" : ""}">
          ${ring(todosTotal > 0 ? Math.round((todosDone / todosTotal) * 100) : 0, 40, 5)}
          <span class="overview-label">To-Dos</span>
          <span class="overview-value">${todosDone}/${todosTotal}</span>
        </div>
        <div class="overview-chip ${day.faith.prayerCount > 0 ? "done" : ""}">
          <span class="overview-icon">${ICONS.heart}</span>
          <span class="overview-label">Prayer</span>
          <span class="overview-value">${day.faith.prayerCount}×</span>
        </div>
        <div class="overview-chip ${day.faith.bibleReadingDone ? "done" : ""}">
          <span class="overview-icon">${ICONS.book}</span>
          <span class="overview-label">Bible Reading</span>
          <span class="overview-value">${day.faith.bibleReadingDone ? "Done" : "Not yet"}</span>
        </div>
        <div class="overview-chip ring-chip ${pushups.count >= pushups.goal ? "done" : ""}">
          ${ring(Math.round((pushups.count / pushups.goal) * 100), 40, 5)}
          <span class="overview-label">Push-ups</span>
          <span class="overview-value">${pushups.count}/${pushups.goal}</span>
        </div>
        <div class="overview-chip ring-chip ${curls.count >= curls.goal ? "done" : ""}">
          ${ring(Math.round((curls.count / curls.goal) * 100), 40, 5)}
          <span class="overview-label">Bicep Curls</span>
          <span class="overview-value">${curls.count}/${curls.goal}</span>
        </div>
      </div>
    </div>

    <div class="verse-card">
      <div class="verse-mark">"</div>
      <p class="verse-text">${verse.text}</p>
      <p class="verse-ref">${verse.reference}</p>
    </div>

    <div class="quote-card">
      <p class="quote-text">${quote.text}</p>
      ${quote.author ? `<p class="quote-author">— ${quote.author}</p>` : ""}
    </div>

    <div class="challenge-summary-card">
      <div class="challenge-summary-head">
        <span class="challenge-summary-title">$10K Challenge</span>
        <span class="challenge-summary-day">${cs.started ? `Day ${cs.dayNumber}/${state.challenge.durationDays}` : "Not started"}</span>
      </div>
      <div class="challenge-summary-body">
        <div class="challenge-summary-stats">
          <div class="challenge-summary-stat">
            <span class="challenge-summary-value">${cs.daysRemaining}</span>
            <span class="challenge-summary-label">Days Remaining</span>
          </div>
          <div class="challenge-summary-stat">
            <span class="challenge-summary-value">$${cs.totalEarned.toLocaleString()}</span>
            <span class="challenge-summary-label">Total Earned</span>
          </div>
        </div>
        ${ring(cs.pct, 64, 7, `<span class="ring-pct">${cs.pct}%</span>`)}
      </div>
    </div>
  `;
}

/* ==========================================================
   6. TODO
   ========================================================== */
function formatShortDate(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

function todoItemHtml(t, showDate) {
  return `
    <li class="todo-item ${t.done ? "done" : ""}" data-id="${t.id}">
      <button class="todo-check" data-action="toggle" aria-label="Toggle done">
        ${t.done ? "✓" : ""}
      </button>
      <span class="todo-text">${escapeHtml(t.text)}</span>
      ${showDate ? `<span class="todo-date-badge">${formatShortDate(t.date)}</span>` : ""}
      <button class="todo-delete" data-action="delete" aria-label="Delete task">✕</button>
    </li>
  `;
}

function renderTodo() {
  const todayKey = getTodayKey();
  const todayTodos = state.todos.filter(t => t.date <= todayKey);
  const upcomingTodos = state.todos.filter(t => t.date > todayKey).sort((a, b) => a.date.localeCompare(b.date));
  const todosDone = todayTodos.filter(t => t.done).length;

  const todayHtml = todayTodos.length
    ? todayTodos.map(t => todoItemHtml(t, false)).join("")
    : `<li class="todo-empty">No tasks yet. Add what you want to get done today.</li>`;

  const upcomingHtml = upcomingTodos.length
    ? `
      <h2 class="section-heading todo-section">Upcoming</h2>
      <ul class="todo-list">${upcomingTodos.map(t => todoItemHtml(t, true)).join("")}</ul>
    `
    : "";

  document.getElementById("page-todo").innerHTML = `
    <div class="page-header">
      <h1 class="page-title">To-Do List</h1>
      <p class="page-sub">${todosDone}/${todayTodos.length} completed today</p>
    </div>

    <form id="todo-form" class="add-form">
      <input type="text" id="todo-input" placeholder="Add a task..." aria-label="Task description" autocomplete="off" maxlength="120" />
      <input type="date" id="todo-date" min="${todayKey}" aria-label="Due date (defaults to today)" />
      <button type="submit">Add</button>
    </form>

    <ul class="todo-list">${todayHtml}</ul>
    ${upcomingHtml}
  `;

  document.getElementById("todo-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const input = document.getElementById("todo-input");
    const dateInput = document.getElementById("todo-date");
    const text = input.value.trim();
    if (!text) return;
    state.todos.push({ id: uid("t"), text, done: false, date: dateInput.value || todayKey });
    saveState();
    renderTodo();
  });

  document.getElementById("page-todo").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const li = btn.closest(".todo-item");
    const id = li.dataset.id;
    if (btn.dataset.action === "toggle") {
      const todo = state.todos.find(t => t.id === id);
      todo.done = !todo.done;
    } else if (btn.dataset.action === "delete") {
      state.todos = state.todos.filter(t => t.id !== id);
    }
    saveState();
    renderTodo();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ==========================================================
   8. FAITH
   ========================================================== */
function renderFaith() {
  const day = ensureDayRecord(getTodayKey());

  document.getElementById("page-faith").innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Faith</h1>
      <p class="page-sub">Stay accountable to your time with God today.</p>
    </div>

    <div class="faith-grid">
      <div class="faith-card prayer-card ${day.faith.prayerCount > 0 ? "done" : ""}">
        <button class="faith-undo" id="prayer-undo" aria-label="Undo last prayer log" ${day.faith.prayerCount === 0 ? "disabled" : ""}>−</button>
        <button class="faith-tap" id="prayer-card">
          <span class="faith-icon">${ICONS.heart}</span>
          <span class="faith-label">Prayer</span>
          <span class="faith-count">${day.faith.prayerCount}</span>
          <span class="faith-status">Tap to log a prayer</span>
        </button>
      </div>
      <button class="faith-card ${day.faith.bibleReadingDone ? "done" : ""}" id="bible-card">
        <span class="faith-icon">${ICONS.book}</span>
        <span class="faith-label">Bible Reading</span>
        <span class="faith-status">${day.faith.bibleReadingDone ? "Done today" : "Tap when done"}</span>
      </button>
    </div>
  `;

  document.getElementById("prayer-card").addEventListener("click", function () {
    day.faith.prayerCount += 1;
    saveState();
    renderFaith();
  });

  document.getElementById("prayer-undo").addEventListener("click", function () {
    if (day.faith.prayerCount === 0) return;
    day.faith.prayerCount -= 1;
    saveState();
    renderFaith();
  });

  document.getElementById("bible-card").addEventListener("click", function () {
    day.faith.bibleReadingDone = !day.faith.bibleReadingDone;
    saveState();
    renderFaith();
  });
}

/* ==========================================================
   9. WORKOUT
   ========================================================== */
function workoutCardHtml(key, label, icon, data) {
  const pct = Math.round((data.count / data.goal) * 100);
  const ringCenter = `<span class="workout-icon">${icon}</span><span class="ring-pct">${Math.min(100, pct)}%</span>`;
  return `
    <div class="workout-card">
      <div class="workout-head">
        ${ring(pct, 88, 9, ringCenter)}
        <div class="workout-info">
          <p class="workout-label">${label}</p>
          <p class="workout-count">${data.count} <span>/ ${data.goal}</span></p>
        </div>
      </div>
      <div class="workout-actions">
        <button class="quick-add" data-key="${key}" data-amount="10">+10</button>
        <button class="quick-add" data-key="${key}" data-amount="20">+20</button>
        <button class="quick-add" data-key="${key}" data-amount="50">+50</button>
        <button class="quick-add reset" data-key="${key}" data-amount="reset">Reset</button>
      </div>
    </div>
  `;
}

function renderWorkout() {
  const day = ensureDayRecord(getTodayKey());

  document.getElementById("page-workout").innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Workout</h1>
      <p class="page-sub">Build the habit, one set at a time.</p>
    </div>
    ${workoutCardHtml("pushups", "Push-ups", ICONS.dumbbell, day.workout.pushups)}
    ${workoutCardHtml("curls", "Bicep Curls", ICONS.dumbbell, day.workout.curls)}
  `;

  document.querySelectorAll(".quick-add").forEach(btn => {
    btn.addEventListener("click", function () {
      const key = btn.dataset.key;
      if (btn.dataset.amount === "reset") {
        day.workout[key].count = 0;
      } else {
        day.workout[key].count += parseInt(btn.dataset.amount, 10);
      }
      saveState();
      renderWorkout();
    });
  });
}

/* ==========================================================
   7. VIDEO PLAN
   ========================================================== */
function renderVideoPlan() {
  const videos = state.videoPlan;

  const listHtml = videos.length
    ? videos.slice().reverse().map(v => `
      <li class="todo-item video-item ${v.watched ? "done" : ""}" data-id="${v.id}">
        <button class="todo-check" data-action="toggle" aria-label="Toggle watched">
          ${v.watched ? "✓" : ""}
        </button>
        <a class="video-link" href="${escapeHtml(v.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(v.url)}</a>
        <button class="todo-delete" data-action="delete" aria-label="Remove video">✕</button>
      </li>
    `).join("")
    : `<li class="todo-empty">No videos queued. Paste tonight's links so tomorrow's ready to go.</li>`;

  document.getElementById("page-video").innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Video Plan</h1>
      <p class="page-sub">Paste links the night before so you're never hunting for what to watch.</p>
    </div>

    <form id="video-form" class="add-form">
      <input type="url" id="video-input" placeholder="Paste a YouTube link..." aria-label="YouTube link" autocomplete="off" />
      <button type="submit">Add</button>
    </form>

    <ul class="todo-list">${listHtml}</ul>
  `;

  document.getElementById("video-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const input = document.getElementById("video-input");
    const url = input.value.trim();
    if (!url) return;
    state.videoPlan.push({ id: uid("v"), url, watched: false, addedAt: new Date().toISOString() });
    saveState();
    renderVideoPlan();
  });

  document.querySelector("#page-video .todo-list").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const li = btn.closest(".video-item");
    const id = li.dataset.id;
    if (btn.dataset.action === "toggle") {
      const v = state.videoPlan.find(v => v.id === id);
      v.watched = !v.watched;
    } else if (btn.dataset.action === "delete") {
      state.videoPlan = state.videoPlan.filter(v => v.id !== id);
    }
    saveState();
    renderVideoPlan();
  });
}

/* ==========================================================
   10. CHALLENGE
   ========================================================== */
function daysElapsed(startDateKey) {
  const start = new Date(startDateKey + "T00:00:00");
  const today = new Date(getTodayKey() + "T00:00:00");
  return Math.floor((today - start) / 86400000);
}

// Shared by renderHome's read-only summary and renderChallenge's full page.
function getChallengeStats() {
  const c = state.challenge;
  const totalEarned = c.entries.reduce((sum, e) => sum + e.amount, 0);
  const pct = Math.min(100, Math.round((totalEarned / c.targetAmount) * 100));
  if (!c.startDate) {
    return { started: false, daysRemaining: c.durationDays, dayNumber: 0, totalEarned, pct };
  }
  const elapsed = daysElapsed(c.startDate);
  const daysRemaining = Math.max(0, c.durationDays - elapsed);
  const dayNumber = Math.min(elapsed + 1, c.durationDays);
  return { started: true, daysRemaining, dayNumber, totalEarned, pct };
}

function renderChallenge() {
  const c = state.challenge;

  if (!c.startDate) {
    document.getElementById("page-challenge").innerHTML = `
      <div class="page-header">
        <h1 class="page-title">$10K Challenge</h1>
        <p class="page-sub">A 60-day push toward $10,000/month.</p>
      </div>
      <div class="challenge-start-card">
        <p>You haven't started your challenge yet. Starting locks in today as Day 1 of 60.</p>
        <button id="start-challenge-btn">Start My 60-Day Challenge</button>
      </div>
    `;
    document.getElementById("start-challenge-btn").addEventListener("click", function () {
      c.startDate = getTodayKey();
      saveState();
      renderChallenge();
    });
    return;
  }

  const stats = getChallengeStats();
  const { daysRemaining, dayNumber, totalEarned, pct } = stats;

  const entriesHtml = c.entries.length
    ? c.entries.slice().reverse().map(e => `
      <li class="entry-item" data-id="${e.id}">
        <div class="entry-info">
          <span class="entry-desc">${escapeHtml(e.description || "Deal")}</span>
          <span class="entry-date">${e.date}</span>
        </div>
        <span class="entry-amount">+$${e.amount.toLocaleString()}</span>
        <button class="todo-delete" data-action="delete" aria-label="Remove entry">✕</button>
      </li>
    `).join("")
    : `<li class="todo-empty">No income logged yet. Add your first deal below.</li>`;

  document.getElementById("page-challenge").innerHTML = `
    <div class="page-header">
      <h1 class="page-title">$10K Challenge</h1>
      <p class="page-sub">Day ${dayNumber} of ${c.durationDays}</p>
    </div>

    <div class="challenge-stats">
      <div class="challenge-stat">
        <span class="challenge-stat-value">${daysRemaining}</span>
        <span class="challenge-stat-label">Days Remaining</span>
      </div>
      <div class="challenge-stat">
        <span class="challenge-stat-value">$${totalEarned.toLocaleString()}</span>
        <span class="challenge-stat-label">Total Earned</span>
      </div>
    </div>

    <div class="challenge-progress-card">
      <p class="challenge-progress-label">Progress toward $${c.targetAmount.toLocaleString()}</p>
      ${ring(pct, 140, 13, `<span class="ring-value">${pct}%</span><span class="ring-sublabel">$${totalEarned.toLocaleString()}</span>`)}
    </div>

    <h2 class="section-heading">Add a deal</h2>
    <form id="income-form" class="income-form">
      <input type="number" id="income-amount" placeholder="Amount ($)" aria-label="Income amount in dollars" min="0" step="1" required />
      <input type="text" id="income-desc" placeholder="Description (e.g. client name)" aria-label="Income description" maxlength="80" />
      <button type="submit">Add Income</button>
    </form>

    <h2 class="section-heading">Income log</h2>
    <ul class="entry-list">${entriesHtml}</ul>
  `;

  document.getElementById("income-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const amountInput = document.getElementById("income-amount");
    const descInput = document.getElementById("income-desc");
    const amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) return;
    c.entries.push({ id: uid("e"), amount, description: descInput.value.trim(), date: getTodayKey() });
    saveState();
    renderChallenge();
  });

  document.querySelector(".entry-list").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action='delete']");
    if (!btn) return;
    const id = btn.closest(".entry-item").dataset.id;
    c.entries = c.entries.filter(e => e.id !== id);
    saveState();
    renderChallenge();
  });
}

/* ==========================================================
   11. CALENDAR
   ========================================================== */
const calToday = new Date();
let calYear = calToday.getFullYear();
let calMonth = calToday.getMonth();
let selectedCalDate = null;

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const startDate = new Date(year, month, 1 - firstDay);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    cells.push({ day: d.getDate(), inMonth: d.getMonth() === month, dateKey: formatDateKey(d) });
  }
  return cells;
}

function renderCalendar() {
  const cells = buildMonthGrid(calYear, calMonth);
  const todayKey = getTodayKey();
  const datesWithTasks = new Set(state.todos.map(t => t.date));

  const cellsHtml = cells.map(c => {
    const isToday = c.dateKey === todayKey;
    const isSelected = c.dateKey === selectedCalDate;
    const hasTask = datesWithTasks.has(c.dateKey);
    const classes = ["cal-cell"];
    if (!c.inMonth) classes.push("muted");
    if (isToday) classes.push("today");
    if (isSelected) classes.push("selected");
    return `<div class="${classes.join(" ")}" data-date="${c.dateKey}">${c.day}${hasTask ? '<span class="cal-dot"></span>' : ""}</div>`;
  }).join("");

  let panelHtml = "";
  if (selectedCalDate) {
    const tasks = state.todos.filter(t => t.date === selectedCalDate);
    const label = new Date(selectedCalDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const tasksHtml = tasks.length
      ? tasks.map(t => `<li class="cal-panel-item ${t.done ? "done" : ""}"><span class="cal-panel-dot"></span>${escapeHtml(t.text)}</li>`).join("")
      : `<p class="cal-panel-empty">Nothing planned.</p>`;
    panelHtml = `
      <div class="cal-panel">
        <h2 class="cal-panel-title">${label}</h2>
        ${tasks.length ? `<ul class="cal-panel-list">${tasksHtml}</ul>` : tasksHtml}
      </div>
    `;
  }

  document.getElementById("page-calendar").innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Calendar</h1>
    </div>
    <div class="cal-layout">
      <div class="cal-card">
        <div class="cal-nav">
          <button id="cal-prev" aria-label="Previous month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
          <span class="cal-month-label">${MONTHS[calMonth]} ${calYear}</span>
          <button id="cal-next" aria-label="Next month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
        <div class="cal-weekdays">
          ${["S", "M", "T", "W", "T", "F", "S"].map(d => `<div>${d}</div>`).join("")}
        </div>
        <div class="cal-grid">${cellsHtml}</div>
      </div>
      ${panelHtml}
    </div>
  `;

  document.getElementById("cal-prev").addEventListener("click", function () {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById("cal-next").addEventListener("click", function () {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });
  document.querySelector(".cal-grid").addEventListener("click", function (e) {
    const cell = e.target.closest(".cal-cell");
    if (!cell) return;
    selectedCalDate = cell.dataset.date;
    renderCalendar();
  });
}

/* ==========================================================
   12. SETTINGS
   ========================================================== */
function renderSettings() {
  document.getElementById("page-settings").innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
    </div>

    <div class="settings-card">
      <h2 class="section-heading">Reminder times</h2>
      <div class="settings-row">
        <label for="workout-time">${ICONS.dumbbell} Workout reminder</label>
        <input type="time" id="workout-time" value="${state.settings.workoutReminderTime}" />
      </div>
      <p class="settings-note">${ICONS.warning}<span>Prayer now reminds you 3x a day (1PM, 5PM, 8PM) — those times
      are fixed in <code>.github/workflows/reminders.yml</code>, not editable here. Changing the workout time above
      updates MyDay only; you must also edit the matching cron line in that file (and push the change) for the real
      reminder to move. See CLAUDE.md for the full notification setup guide.</span></p>
    </div>

    <div class="settings-card">
      <h2 class="section-heading">Backup your data</h2>
      <p class="settings-note">MyDay stores everything on this device only — your laptop browser and your installed
      Android app do not sync automatically. Export here, then import on the other device to move your data.</p>
      <div class="settings-actions">
        <button id="export-btn">${ICONS.download} Export Data</button>
        <label class="import-btn">${ICONS.upload} Import Data<input type="file" id="import-input" accept="application/json" hidden /></label>
      </div>
    </div>

    <div class="settings-card">
      <h2 class="section-heading">About</h2>
      <p class="settings-note">MyDay is password-protected casually, not securely — the password lives in plain
      text in app.js. Don't rely on it to protect sensitive information from a determined viewer.</p>
    </div>
  `;

  document.getElementById("workout-time").addEventListener("change", function (e) {
    state.settings.workoutReminderTime = e.target.value;
    saveState();
  });

  document.getElementById("export-btn").addEventListener("click", function () {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myday-backup-${getTodayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("import-input").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof parsed.schemaVersion === "undefined") throw new Error("Not a MyDay backup file.");
        if (!confirm("This will overwrite all current data on this device with the imported backup. Continue?")) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        location.reload();
      } catch (err) {
        alert("Could not import this file: " + err.message);
      }
    };
    reader.readAsText(file);
  });
}

/* ==========================================================
   13. SERVICE WORKER + ONESIGNAL
   ========================================================== */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").then(reg => {
    // Force an immediate freshness check instead of waiting on the browser's
    // once-a-day automatic check, so deploys (like a password change) don't
    // get stuck behind a stale cached service worker.
    reg.update();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") reg.update();
    });
  }).catch(err => console.error("SW registration failed:", err));
}

/* ==========================================================
   14. BOOTSTRAP
   ========================================================== */
function initApp() {
  ensureDayRecord(getTodayKey());
  showSection("home");
  registerServiceWorker();
}

if (isUnlocked()) {
  lockView.classList.add("hidden");
  appView.classList.remove("hidden");
  initApp();
} else {
  showLock();
}
