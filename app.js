/* ==========================================================
   1. CONFIG
   ========================================================== */
// Set to true to bring the password gate back. While false, the splash
// screen leads straight into the app and the lock screen never shows.
const LOCK_ENABLED = false;

// CHANGE THIS to your real password before you start using the app for real.
// This is a casual deterrent only, not real security (visible in page source).
const APP_PASSWORD = "02233";

const STORAGE_KEY = "myday_state";
const SESSION_UNLOCK_KEY = "myday_unlocked";

// Cross-device real-time sync (see CLAUDE.md for the full architecture and
// the required one-time Supabase SQL setup in supabase/schema.sql).
// No Supabase Auth is used — this is a single-person app with a casual
// client-side password (APP_PASSWORD above), not a real auth system, so the
// anon key below gets full read/write access via RLS. Same caveat as that
// password: a casual deterrent, not real security.
const SUPABASE_URL = "https://cqblgvscgcrfabvuxsml.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lskR1oUUEEQJyf8_rivQtA_7wO8lot9";
// window.supabase is missing if the CDN script failed to load (offline,
// blocked, etc.) — every Supabase call in this file checks `sb` first and
// falls back to localStorage-only behavior when it's null.
const sb = (typeof window !== "undefined" && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const DEFAULT_GOALS = { pushups: 200, curls: 100 };
const CHALLENGE_TARGET = 10000;
const CHALLENGE_DURATION_DAYS = 60;

// Shown on the You page header and used for the nav avatar initial.
const USER_NAME = "Njabulo";

// Inline SVG icons (replace emoji throughout the UI).
const ICONS = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.2-4.4-9.5-8.6C1 9 2 5.8 5 4.8c2-0.7 4 0.3 5 2 1-1.7 3-2.7 5-2 3 1 4 4.2 2.5 7.1-2.3 4.2-9.5 8.6-9.5 8.6z"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5c2-1 5-1 8 0v14c-3-1-6-1-8 0z"/><path d="M20 5.5c-2-1-5-1-8 0v14c3-1 6-1 8 0z"/></svg>`,
  dumbbell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="4" height="6" rx="1"/><rect x="18" y="9" width="4" height="6" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l9.5 16.5H2.5z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7.5 11l4.5 4.5L16.5 11"/><path d="M4 18.5h16"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4"/><path d="M7.5 8.5L12 4l4.5 4.5"/><path d="M4 18.5h16"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10.5 9l4.5 3-4.5 3V9z" fill="currentColor" stroke="none"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5v17"/><path d="M5 4.5c2-1.2 4-1.2 6 0s4 1.2 6 0v9c-2 1.2-4 1.2-6 0s-4-1.2-6 0z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>`,
  repeat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 14-5.2M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-14 5.2M4 20v-4h4"/></svg>`,
  notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2h8.5A1.5 1.5 0 0 1 20.5 8.5v9A1.5 1.5 0 0 1 19 19H4.5A1.5 1.5 0 0 1 3 17.5z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>`,
  listBullet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/></svg>`,
  listNumber: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><text x="1.5" y="8.5" font-size="6.5" fill="currentColor" stroke="none">1</text><text x="1.5" y="14.5" font-size="6.5" fill="currentColor" stroke="none">2</text><text x="1.5" y="20.5" font-size="6.5" fill="currentColor" stroke="none">3</text><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/></svg>`,
  newNote: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></svg>`
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
    settings: { prayerReminderTime: "07:00", workoutReminderTime: "18:00", theme: "dark" }
  };
}

// Migrates older saved data to the current shape:
// - day.todos (nested per-day) -> flat state.todos with a date field
// - day.faith.prayerDone (boolean) -> day.faith.prayerCount (number) -> day.faith.prayerTimes (3 checkboxes)
function migrateState(s) {
  Object.keys(s.days || {}).forEach(dateKey => {
    const day = s.days[dateKey];
    if (Array.isArray(day.todos)) {
      day.todos.forEach(t => s.todos.push({ id: t.id, text: t.text, done: t.done, date: dateKey }));
      delete day.todos;
    }
    if (day.faith && typeof day.faith.prayerCount === "undefined" && typeof day.faith.prayerTimes === "undefined") {
      day.faith.prayerCount = day.faith.prayerDone ? 1 : 0;
      delete day.faith.prayerDone;
    }
    if (day.faith && typeof day.faith.prayerTimes === "undefined") {
      // No way to know which specific times were prayed under the old counter
      // model, so this starts unchecked rather than guessing.
      day.faith.prayerTimes = { noon: false, evening: false, night: false };
      delete day.faith.prayerCount;
    }
  });
  if (typeof s.settings.theme === "undefined") s.settings.theme = "dark";
  return s;
}

function loadStateFromLocalStorage() {
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

// Offline-first: the localStorage copy is the immediately-available value
// every render/click-handler in this file already relies on synchronously.
// The Supabase fetch below starts right away in the background (in parallel
// with the splash screen and the rest of this script), and runSplash()
// (region 16) awaits it before the first real render — replacing `state`
// with the freshest cross-device copy when it succeeds. The realtime
// subscription keeps it updated after that. The app stays fully usable on
// the localStorage copy alone if any of this fails or never loads.
let state = loadStateFromLocalStorage();
const stateSupabaseSyncPromise = syncStateFromSupabase();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  pushStateToSupabase();
}

// Postgres returns timestamptz as e.g. "...798+00:00" while JS's
// toISOString() sends "...798Z" — date-equal but string-different, so
// comparing updated_at values with === to detect "this is just the echo of
// my own write" always failed, meaning every save (including ones mid-
// keystroke) was treated as a change FROM ANOTHER DEVICE and triggered a
// full re-render — destroying and recreating the contenteditable note body
// and stealing focus while typing. Parsing both into a Date first compares
// the actual instant instead of the string formatting.
function sameTimestamp(a, b) {
  if (!a || !b) return false;
  return new Date(a).getTime() === new Date(b).getTime();
}

// Defense in depth on top of sameTimestamp() above: even a genuine change
// from another device should never yank focus out from under whatever text
// field the user is actively typing in on THIS device. The data still gets
// applied (so nothing from the other device is lost) — only the visual
// re-render is deferred until the user isn't mid-keystroke.
function isTypingInTextField() {
  const el = document.activeElement;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

let stateUpdatedAt = null; // updated_at of the row we last read/wrote, used to ignore our own echoed realtime events
let statePushTimer = null;

function pushStateToSupabase() {
  if (!sb) return;
  clearTimeout(statePushTimer);
  // Debounced: typing in a description/title can call saveState() on every
  // keystroke. Coalescing rapid saves into one request avoids hammering the
  // network and keeps cross-device updates feeling instant without spamming.
  statePushTimer = setTimeout(async () => {
    // Set before the request, not after it resolves: the realtime echo of
    // this exact write can arrive over the websocket before this await
    // returns, and subscribeToStateChanges() needs stateUpdatedAt to
    // already reflect it at that moment to recognize the echo as our own.
    const nowIso = new Date().toISOString();
    stateUpdatedAt = nowIso;
    try {
      const { error } = await sb
        .from("myday_state")
        .update({ data: state, updated_at: nowIso })
        .eq("id", "singleton");
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase save failed; change is still safe in localStorage.", e);
    }
  }, 400);
}

async function syncStateFromSupabase() {
  if (!sb) return;
  try {
    const { data, error } = await sb.from("myday_state").select("data, updated_at").eq("id", "singleton").single();
    if (error) throw error;
    if (data && data.data && Object.keys(data.data).length > 0) {
      state = migrateState(Object.assign(defaultState(), data.data));
      stateUpdatedAt = data.updated_at;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      // First-ever run: the singleton row exists but is still the empty
      // default seeded by schema.sql. Push our local copy up so every other
      // device has something to sync from.
      pushStateToSupabase();
    }
  } catch (e) {
    console.warn("Supabase initial state load failed; using localStorage copy.", e);
  }
}

function subscribeToStateChanges() {
  if (!sb) return;
  sb.channel("myday_state_changes")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "myday_state" }, payload => {
      // Skip the echo of our own write — payload.new.updated_at will match
      // what pushStateToSupabase()/syncStateFromSupabase() just recorded.
      if (sameTimestamp(payload.new.updated_at, stateUpdatedAt)) return;
      state = migrateState(Object.assign(defaultState(), payload.new.data));
      stateUpdatedAt = payload.new.updated_at;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (!isTypingInTextField()) renderSection(currentSectionName);
    })
    .subscribe();
}

// Applied immediately on load (so the splash/lock screens also respect a saved
// theme) and again whenever the Settings toggle changes it.
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.settings.theme);
}
applyTheme();

// Desktop-only sidebar collapse — a per-device UI preference, not app data,
// so it lives in its own localStorage key rather than inside state/Supabase
// (collapsing it on a laptop shouldn't force it collapsed on a phone too,
// and the mobile bottom nav doesn't have an equivalent concept at all).
const SIDEBAR_COLLAPSED_KEY = "myday_sidebar_collapsed";

function setSidebarCollapsed(collapsed) {
  document.querySelector(".app-shell").classList.toggle("sidebar-collapsed", collapsed);
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
}

// Applied immediately on load, before the splash/app even become visible,
// so a previously-collapsed sidebar never flashes open first.
function applySidebarCollapsedState() {
  if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") {
    document.querySelector(".app-shell").classList.add("sidebar-collapsed");
  }
}
applySidebarCollapsedState();

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
      faith: { prayerTimes: { noon: false, evening: false, night: false }, bibleReadingDone: false },
      workout: {
        pushups: { count: 0, goal: DEFAULT_GOALS.pushups },
        curls: { count: 0, goal: DEFAULT_GOALS.curls }
      }
    };
    saveState();
  }
  return state.days[dateKey];
}

// Guarantees the faith/workout reset is visible even if the app is left open
// straight through midnight with no interaction (ensureDayRecord is otherwise
// lazy — it only fires on the next render). Re-arms itself every 24h.
function armMidnightWatcher() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
  setTimeout(function () {
    ensureDayRecord(getTodayKey());
    renderSection(currentSectionName);
    armMidnightWatcher();
  }, nextMidnight - now);
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
  // Fill starts fully empty (dashoffset = circumference); animateRings() below
  // tweens it to data-target-offset so the ring sweeps in instead of appearing
  // already-filled.
  return `
    <div class="ring" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <circle class="ring-track" cx="${cx}" cy="${cy}" r="${r}" stroke-width="${stroke}" fill="none"/>
        <circle class="ring-fill" cx="${cx}" cy="${cy}" r="${r}" stroke-width="${stroke}" fill="none"
          stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${c.toFixed(2)}"
          data-target-offset="${offset.toFixed(2)}"
          transform="rotate(-90 ${cx} ${cy})"/>
      </svg>
      ${centerHtml ? `<div class="ring-center">${centerHtml}</div>` : ""}
    </div>
  `;
}

// Sweeps every ring inside `container` from empty to its real value, each one
// starting slightly after the previous (cascading reveal). Skips straight to
// the final state when the user prefers reduced motion, or when `instant` is
// requested (e.g. a quick-add click updating a ring that's already on screen
// — re-sweeping from zero on every tap would look like lost progress).
function animateRings(container, { instant = false } = {}) {
  const fills = container.querySelectorAll(".ring-fill");
  const reduceMotion = instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  fills.forEach((el, i) => {
    const from = parseFloat(el.getAttribute("stroke-dashoffset"));
    const to = parseFloat(el.dataset.targetOffset);
    if (reduceMotion) {
      el.style.strokeDashoffset = to;
      return;
    }
    el.animate(
      [{ strokeDashoffset: from }, { strokeDashoffset: to }],
      { duration: 700, delay: i * 90, easing: "cubic-bezier(0.25, 1, 0.5, 1)", fill: "forwards" }
    );
  });
}

/* ==========================================================
   3. AUTH
   ========================================================== */
const splashView = document.getElementById("splash-view");
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
  // Let the success pulse play before cutting to the app, instead of an instant swap.
  lockCard.classList.add("unlock-success");
  setTimeout(() => {
    lockView.classList.add("hidden");
    appView.classList.remove("hidden");
    initApp();
  }, 380); // matches .unlock-success animation duration
}

function showLock() {
  lockCard.classList.remove("unlock-success");
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
    lockInput.classList.remove("error");
    requestAnimationFrame(() => lockInput.classList.add("error"));
    setTimeout(() => lockInput.classList.remove("error"), 400);
    lockInput.value = "";
    lockInput.focus();
  }
});

/* ==========================================================
   4. NAV ROUTER
   ========================================================== */
const mainNav = document.getElementById("main-nav");
let currentSectionName = "home";

function showSection(name) {
  currentSectionName = name;
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.dataset.page === name));
  let navTarget = (name === "settings" || name === "video") ? "you" : name;
  if (name === "home" && homeTab === "challenge") navTarget = "challenge";
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === navTarget));
  // The Add Task FAB (and its voice-input companion button) belong only to
  // the To-Do list view, and the mobile Notes bottom bar only to Notes —
  // hide all three by default on every navigation; renderTodo()/renderNotes()
  // are the only places allowed to re-show their own.
  document.getElementById("todo-fab").classList.add("hidden");
  document.getElementById("voice-fab").classList.add("hidden");
  document.getElementById("notes-mobile-bar").classList.add("hidden");
  renderSection(name);
}

mainNav.addEventListener("click", function (e) {
  const btn = e.target.closest(".nav-item");
  if (!btn) return;
  // Challenge is a desktop-only shortcut to the Home page's existing
  // Today/Challenge tab toggle — it is not its own page/section.
  if (btn.dataset.section === "challenge") {
    homeTab = "challenge";
    showSection("home");
    return;
  }
  showSection(btn.dataset.section);
});

function renderSection(name) {
  switch (name) {
    case "home": renderHome(); break;
    case "todo": renderTodo(); break;
    case "faith": renderFaith(); break;
    case "workout": renderWorkout(); break;
    case "video": renderVideoPlan(); break;
    case "notes": renderNotes(); break;
    case "you": renderYou(); break;
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

let homeTab = "today"; // "today" | "challenge"

function renderHome() {
  document.getElementById("page-home").innerHTML = `
    <div class="home-tabbar">
      <button class="home-tab ${homeTab === "today" ? "active" : ""}" data-tab="today">Today</button>
      <button class="home-tab ${homeTab === "challenge" ? "active" : ""}" data-tab="challenge">Challenge</button>
    </div>
    <div id="home-tab-content"></div>
  `;

  document.querySelectorAll(".home-tab").forEach(btn => {
    btn.addEventListener("click", function () {
      homeTab = btn.dataset.tab;
      renderHome();
      // Keep the desktop sidebar's Challenge shortcut in sync with the in-page
      // tab toggle (which stays the single source of truth for this state).
      const navTarget = homeTab === "challenge" ? "challenge" : "home";
      document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === navTarget));
    });
  });

  if (homeTab === "today") renderHomeToday();
  else renderChallenge("home-tab-content");
}

function renderHomeToday() {
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

  document.getElementById("home-tab-content").innerHTML = `
    <p class="eyebrow">${dateLabel}</p>

    <div class="verse-card">
      <p class="eyebrow verse-eyebrow">Verse of the day</p>
      <p class="verse-ref">${verse.reference}</p>
      <p class="verse-text">${verse.text}</p>
    </div>

    <div class="quote-card">
      <p class="quote-text">${quote.text}</p>
      ${quote.author ? `<p class="quote-author">— ${quote.author}</p>` : ""}
    </div>

    <div class="overview-card">
      <h2 class="section-heading">Today's overview</h2>
      <div class="overview-grid">
        <div class="overview-chip ring-chip ${todosTotal > 0 && todosDone === todosTotal ? "done" : ""}">
          ${ring(todosTotal > 0 ? Math.round((todosDone / todosTotal) * 100) : 0, 40, 5)}
          <span class="overview-label">To-Dos</span>
          <span class="overview-value">${todosDone}/${todosTotal}</span>
        </div>
        <div class="overview-chip ${PRAYER_TIMES.every(p => day.faith.prayerTimes[p.key]) ? "done" : ""}">
          <span class="overview-icon">${ICONS.heart}</span>
          <span class="overview-label">Prayer</span>
          <span class="overview-value">${PRAYER_TIMES.filter(p => day.faith.prayerTimes[p.key]).length}/${PRAYER_TIMES.length}</span>
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

  animateRings(document.getElementById("home-tab-content"));
}

/* ==========================================================
   6. TODO
   ========================================================== */
function formatShortDate(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

function formatTimeLabel(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function addDaysToKey(dateKey, n) {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + n);
  return formatDateKey(d);
}

function nextWeekdayFromKey(dateKey, targetDow) {
  const d = new Date(dateKey + "T00:00:00");
  do { d.setDate(d.getDate() + 1); } while (d.getDay() !== targetDow);
  return formatDateKey(d);
}

const PRIORITY_INFO = {
  low: { label: "Low priority", color: "var(--priority-low)" },
  med: { label: "Medium priority", color: "var(--priority-medium)" },
  high: { label: "High priority", color: "var(--priority-high)" }
};
const PRIORITY_CYCLE = [null, "low", "med", "high"];

function todoItemHtml(t, showDate) {
  const pInfo = PRIORITY_INFO[t.priority];
  const metaParts = [];
  if (showDate || t.time) {
    metaParts.push(`${showDate ? formatShortDate(t.date) : ""}${t.time ? `${showDate ? " · " : ""}${formatTimeLabel(t.time)}` : ""}`);
  }
  return `
    <li class="todo-item ${t.done ? "done" : ""}" data-id="${t.id}">
      <button class="todo-check" data-action="toggle" aria-label="Toggle done">
        ${t.done ? "✓" : ""}
      </button>
      <div class="todo-item-main">
        <span class="todo-text-row">
          ${pInfo ? `<span class="todo-priority-dot" style="background:${pInfo.color}" title="${pInfo.label}"></span>` : ""}
          <span class="todo-text">${escapeHtml(t.text)}</span>
        </span>
        ${t.description ? `<span class="todo-meta todo-desc-meta">${escapeHtml(t.description)}</span>` : ""}
        ${metaParts.length ? `<span class="todo-meta">${metaParts.join("")}</span>` : ""}
      </div>
      <button class="todo-delete" data-action="delete" aria-label="Delete task">✕</button>
    </li>
  `;
}

let todoView = "list"; // "list" | "calendar"
let todoSheetOpen = false;
let todoDateSubSheetOpen = false;
let todoDraftText = "";
let todoDraftDescription = "";
let todoDraftDate = null; // null = today
let todoDraftTime = null;
let todoDraftPriority = null;
let sheetCalYear = new Date().getFullYear();
let sheetCalMonth = new Date().getMonth();

function renderTodo() {
  document.getElementById("page-todo").innerHTML = `
    <h1 class="page-title">To-Do</h1>
    <div class="seg-control">
      <button class="seg-btn ${todoView === "list" ? "active" : ""}" data-view="list">List</button>
      <button class="seg-btn ${todoView === "calendar" ? "active" : ""}" data-view="calendar">Calendar</button>
    </div>
    <div id="todo-view-content"></div>
  `;

  document.querySelectorAll(".seg-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      todoView = btn.dataset.view;
      renderTodo();
    });
  });

  // Delegated once here, on the freshly-created container — renderTodoList()
  // runs repeatedly (every toggle/delete/add) and only replaces this
  // container's innerHTML, never the container itself, so attaching the
  // listener again inside renderTodoList() would stack a duplicate handler
  // on every single render (the cause of the checkbox "does nothing /
  // freezes" bug: N stacked handlers means N toggles fire per click).
  document.getElementById("todo-view-content").addEventListener("click", function (e) {
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
    renderTodoList();
  });

  if (todoView === "list") {
    renderTodoList();
    document.getElementById("todo-fab").classList.remove("hidden");
    if (speechRecognitionSupported()) document.getElementById("voice-fab").classList.remove("hidden");
  } else {
    renderCalendar("todo-view-content");
    document.getElementById("todo-fab").classList.add("hidden");
    document.getElementById("voice-fab").classList.add("hidden");
  }
}

function renderTodoList() {
  const today = new Date();
  const todayKey = getTodayKey();
  const todayTodos = state.todos.filter(t => t.date <= todayKey);
  const upcomingTodos = state.todos.filter(t => t.date > todayKey).sort((a, b) => a.date.localeCompare(b.date));
  const todosDone = todayTodos.filter(t => t.done).length;
  const dateHeader = `${MONTHS[today.getMonth()].slice(0, 3)} ${today.getDate()} · Today · ${WEEKDAYS[today.getDay()]}`;

  const todayHtml = todayTodos.length
    ? todayTodos.map(t => todoItemHtml(t, false)).join("")
    : `<li class="todo-empty">No tasks yet. Add what you want to get done today.</li>`;

  const upcomingHtml = upcomingTodos.length
    ? `
      <h2 class="todo-section-label">Upcoming</h2>
      <ul class="todo-list">${upcomingTodos.map(t => todoItemHtml(t, true)).join("")}</ul>
    `
    : "";

  document.getElementById("todo-view-content").innerHTML = `
    <p class="todo-count">${ICONS.check} ${todosDone}/${todayTodos.length} done today</p>
    <div class="todo-date-divider"><span>${dateHeader}</span></div>

    <button class="todo-add-inline" id="todo-add-inline">+ <span>Add task</span></button>

    <ul class="todo-list">${todayHtml}</ul>
    ${upcomingHtml}
  `;

  document.getElementById("todo-add-inline").addEventListener("click", () => openTodoSheet());
}

/* ----- Add Task sheet (mobile: bottom sheet · desktop: centered modal) ----- */

function openTodoSheet(initialText = "") {
  todoSheetOpen = true;
  todoDateSubSheetOpen = false;
  todoDraftText = initialText;
  todoDraftDescription = "";
  todoDraftDate = null;
  todoDraftTime = null;
  todoDraftPriority = null;
  const base = todoDraftDate ? new Date(todoDraftDate + "T00:00:00") : new Date();
  sheetCalYear = base.getFullYear();
  sheetCalMonth = base.getMonth();
  renderTodoSheet();
}

function captureSheetDraftFields() {
  const nameInput = document.getElementById("todo-sheet-name");
  const descInput = document.getElementById("todo-sheet-desc");
  if (nameInput) todoDraftText = nameInput.value;
  if (descInput) todoDraftDescription = descInput.value;
}

function closeTodoSheet() {
  const root = document.getElementById("todo-sheet-root");
  const panel = root.querySelector(".todo-sheet");
  const scrim = root.querySelector(".todo-sheet-scrim");
  if (panel) panel.classList.add("closing");
  if (scrim) scrim.classList.add("closing");
  setTimeout(() => {
    todoSheetOpen = false;
    todoDateSubSheetOpen = false;
    root.innerHTML = "";
  }, 200);
}

/* ----- Voice-to-task (Web Speech API) ----- */

function speechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

let activeRecognition = null;

function startVoiceCapture() {
  const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionImpl) return;

  const voiceBtn = document.getElementById("voice-fab");
  if (activeRecognition) {
    activeRecognition.stop();
    return;
  }

  const recognition = new SpeechRecognitionImpl();
  activeRecognition = recognition;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  voiceBtn.classList.add("listening");

  recognition.addEventListener("result", function (e) {
    const transcript = e.results[0][0].transcript.trim();
    if (transcript) openTodoSheet(transcript);
  });

  recognition.addEventListener("error", function () {
    activeRecognition = null;
    voiceBtn.classList.remove("listening");
  });

  recognition.addEventListener("end", function () {
    activeRecognition = null;
    voiceBtn.classList.remove("listening");
  });

  recognition.start();
}

function renderTodoSheet() {
  const root = document.getElementById("todo-sheet-root");
  if (!todoSheetOpen) {
    root.innerHTML = "";
    return;
  }
  root.innerHTML = todoDateSubSheetOpen ? dateSubSheetHtml() : addTaskSheetHtml();
  root.querySelector(".todo-sheet-scrim").addEventListener("click", closeTodoSheet);
  if (todoDateSubSheetOpen) attachDateSubSheetEvents();
  else attachAddTaskSheetEvents();
}

function addTaskSheetHtml() {
  const dateLabel = todoDraftDate ? formatShortDate(todoDraftDate) : "Today";
  const pInfo = PRIORITY_INFO[todoDraftPriority];
  return `
    <div class="todo-sheet-scrim" id="todo-sheet-scrim"></div>
    <div class="todo-sheet" id="todo-sheet-panel" role="dialog" aria-label="Add task">
      <div class="todo-sheet-handle"></div>
      <form id="todo-sheet-form">
        <input type="text" id="todo-sheet-name" class="todo-name-input" placeholder="e.g., Call the supplier" aria-label="Task name" autocomplete="off" maxlength="120" value="${escapeHtml(todoDraftText)}" />
        <input type="text" id="todo-sheet-desc" class="todo-desc-input" placeholder="Description" aria-label="Description" autocomplete="off" maxlength="300" value="${escapeHtml(todoDraftDescription)}" />
        <div class="todo-chip-row">
          <button type="button" class="todo-pill" id="todo-pill-date">
            ${ICONS.calendar}<span>${dateLabel}${todoDraftTime ? ` · ${formatTimeLabel(todoDraftTime)}` : ""}</span>
          </button>
          <button type="button" class="todo-pill ${pInfo ? "todo-pill-set" : ""}" id="todo-pill-priority" style="${pInfo ? `--pill-color:${pInfo.color}` : ""}">
            ${ICONS.flag}<span>${pInfo ? pInfo.label.replace(" priority", "") : "Priority"}</span>
          </button>
        </div>
        <div class="todo-sheet-actions">
          <button type="button" id="todo-sheet-cancel" class="todo-btn-cancel">Cancel</button>
          <button type="submit" class="todo-btn-add">Add task</button>
        </div>
      </form>
    </div>
  `;
}

function attachAddTaskSheetEvents() {
  document.getElementById("todo-sheet-cancel").addEventListener("click", closeTodoSheet);

  document.getElementById("todo-pill-priority").addEventListener("click", function () {
    const idx = PRIORITY_CYCLE.indexOf(todoDraftPriority);
    todoDraftPriority = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length];
    captureSheetDraftFields();
    renderTodoSheet();
  });

  document.getElementById("todo-pill-date").addEventListener("click", function () {
    captureSheetDraftFields();
    todoDateSubSheetOpen = true;
    const base = todoDraftDate ? new Date(todoDraftDate + "T00:00:00") : new Date();
    sheetCalYear = base.getFullYear();
    sheetCalMonth = base.getMonth();
    renderTodoSheet();
  });

  document.getElementById("todo-sheet-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const text = document.getElementById("todo-sheet-name").value.trim();
    if (!text) return;
    const description = document.getElementById("todo-sheet-desc").value.trim();
    state.todos.push({
      id: uid("t"),
      text,
      done: false,
      date: todoDraftDate || getTodayKey(),
      description,
      priority: todoDraftPriority,
      time: todoDraftTime
    });
    saveState();
    closeTodoSheet();
    renderTodoList();
  });
}

function dateSubSheetHtml() {
  const todayKey = getTodayKey();
  const cells = buildMonthGrid(sheetCalYear, sheetCalMonth);
  const cellsHtml = cells.map(c => {
    const classes = ["cal-cell"];
    if (!c.inMonth) classes.push("muted");
    if (c.dateKey === todayKey) classes.push("today");
    if (c.dateKey === todoDraftDate) classes.push("selected");
    return `<div class="${classes.join(" ")}" data-date="${c.dateKey}">${c.day}</div>`;
  }).join("");

  return `
    <div class="todo-sheet-scrim" id="todo-sheet-scrim"></div>
    <div class="todo-sheet todo-date-subsheet" id="todo-sheet-panel" role="dialog" aria-label="Set date">
      <div class="todo-sheet-handle"></div>
      <div class="todo-subsheet-header">
        <button type="button" id="todo-date-back" aria-label="Back">${ICONS.chevronLeft}</button>
        <span>Set date</span>
      </div>
      <ul class="todo-quick-dates">
        <li><button type="button" data-quick="tomorrow"><span>Tomorrow</span><span class="todo-quick-date-label">${formatShortDate(addDaysToKey(todayKey, 1))}</span></button></li>
        <li><button type="button" data-quick="nextweek"><span>Next week</span><span class="todo-quick-date-label">${formatShortDate(nextWeekdayFromKey(todayKey, 1))}</span></button></li>
        <li><button type="button" data-quick="nextweekend"><span>Next weekend</span><span class="todo-quick-date-label">${formatShortDate(nextWeekdayFromKey(todayKey, 6))}</span></button></li>
        <li><button type="button" data-quick="nodate"><span>No date</span></button></li>
      </ul>
      <div class="todo-mini-cal">
        <div class="cal-nav">
          <button type="button" id="todo-mini-prev" aria-label="Previous month">${ICONS.chevronLeft}</button>
          <span class="cal-month-label">${MONTHS[sheetCalMonth]} ${sheetCalYear}</span>
          <button type="button" id="todo-mini-next" aria-label="Next month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
        <div class="cal-weekdays">${["S", "M", "T", "W", "T", "F", "S"].map(d => `<div>${d}</div>`).join("")}</div>
        <div class="cal-grid" id="todo-mini-cal-grid">${cellsHtml}</div>
      </div>
      <button type="button" class="todo-subsheet-row" id="todo-time-row">
        ${ICONS.clock}<span>${todoDraftTime ? formatTimeLabel(todoDraftTime) : "Time"}</span>
        <input type="time" id="todo-time-input" value="${todoDraftTime || ""}" aria-label="Task time" />
      </button>
      <button type="button" class="todo-subsheet-row todo-subsheet-disabled" disabled aria-disabled="true">
        ${ICONS.repeat}<span>Repeat</span><span class="todo-soon-badge">Soon</span>
      </button>
      <div class="todo-sheet-actions">
        <button type="button" id="todo-date-done" class="todo-btn-add todo-btn-full">Done</button>
      </div>
    </div>
  `;
}

function attachDateSubSheetEvents() {
  const backToMain = function () {
    todoDateSubSheetOpen = false;
    renderTodoSheet();
  };
  document.getElementById("todo-date-back").addEventListener("click", backToMain);
  document.getElementById("todo-date-done").addEventListener("click", backToMain);

  document.querySelectorAll(".todo-quick-dates button").forEach(btn => {
    btn.addEventListener("click", function () {
      const todayKey = getTodayKey();
      const quick = btn.dataset.quick;
      if (quick === "tomorrow") todoDraftDate = addDaysToKey(todayKey, 1);
      else if (quick === "nextweek") todoDraftDate = nextWeekdayFromKey(todayKey, 1);
      else if (quick === "nextweekend") todoDraftDate = nextWeekdayFromKey(todayKey, 6);
      else if (quick === "nodate") todoDraftDate = null;
      backToMain();
    });
  });

  document.getElementById("todo-mini-prev").addEventListener("click", function () {
    sheetCalMonth--;
    if (sheetCalMonth < 0) { sheetCalMonth = 11; sheetCalYear--; }
    renderTodoSheet();
  });
  document.getElementById("todo-mini-next").addEventListener("click", function () {
    sheetCalMonth++;
    if (sheetCalMonth > 11) { sheetCalMonth = 0; sheetCalYear++; }
    renderTodoSheet();
  });
  document.getElementById("todo-mini-cal-grid").addEventListener("click", function (e) {
    const cell = e.target.closest(".cal-cell");
    if (!cell) return;
    todoDraftDate = cell.dataset.date;
    renderTodoSheet();
  });

  const timeInput = document.getElementById("todo-time-input");
  timeInput.addEventListener("change", function () {
    todoDraftTime = timeInput.value || null;
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
const PRAYER_TIMES = [
  { key: "noon", label: "12:00 PM" },
  { key: "evening", label: "5:00 PM" },
  { key: "night", label: "8:00 PM" }
];

function renderFaith() {
  const day = ensureDayRecord(getTodayKey());
  const allPrayed = PRAYER_TIMES.every(p => day.faith.prayerTimes[p.key]);

  document.getElementById("page-faith").innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Faith</h1>
      <p class="page-sub">Stay accountable to your time with God today.</p>
    </div>

    <div class="faith-grid">
      <div class="faith-card prayer-card ${allPrayed ? "done" : ""}">
        <div class="prayer-card-head">
          <span class="faith-icon">${ICONS.heart}</span>
          <span class="faith-label">Prayer</span>
        </div>
        <ul class="prayer-time-list">
          ${PRAYER_TIMES.map(p => `
            <li class="prayer-time-row">
              <span class="prayer-time-label">${p.label}</span>
              <button class="prayer-checkbox ${day.faith.prayerTimes[p.key] ? "checked" : ""}" data-time="${p.key}" aria-label="${p.label} prayer">${day.faith.prayerTimes[p.key] ? "✓" : ""}</button>
            </li>
          `).join("")}
        </ul>
      </div>
      <button class="faith-card ${day.faith.bibleReadingDone ? "done" : ""}" id="bible-card">
        <span class="faith-icon">${ICONS.book}</span>
        <span class="faith-label">Bible Reading</span>
        <span class="faith-status">${day.faith.bibleReadingDone ? "Done today" : "Tap when done"}</span>
      </button>
    </div>
  `;

  document.querySelectorAll(".prayer-checkbox").forEach(btn => {
    btn.addEventListener("click", function () {
      const key = btn.dataset.time;
      day.faith.prayerTimes[key] = !day.faith.prayerTimes[key];
      saveState();
      renderFaith();
    });
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

function renderWorkout(skipRingAnimation = false) {
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
      renderWorkout(true);
    });
  });

  animateRings(document.getElementById("page-workout"), { instant: skipRingAnimation });
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

function renderChallenge(targetId = "page-challenge", skipRingAnimation = false) {
  const c = state.challenge;

  if (!c.startDate) {
    document.getElementById(targetId).innerHTML = `
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
      renderChallenge(targetId);
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

  document.getElementById(targetId).innerHTML = `
    <div class="page-header">
      <h1 class="page-title">$10K Challenge</h1>
      <p class="page-sub">Day ${dayNumber} of ${c.durationDays}</p>
    </div>
    <button id="reset-challenge-btn" class="challenge-reset-link">Reset Challenge</button>

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

  document.getElementById("reset-challenge-btn").addEventListener("click", function () {
    if (!confirm("Reset the $10K Challenge? This clears your start date and income log so you can start fresh — it can't be undone.")) return;
    c.startDate = null;
    c.entries = [];
    saveState();
    renderChallenge(targetId);
  });

  document.getElementById("income-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const amountInput = document.getElementById("income-amount");
    const descInput = document.getElementById("income-desc");
    const amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) return;
    c.entries.push({ id: uid("e"), amount, description: descInput.value.trim(), date: getTodayKey() });
    saveState();
    renderChallenge(targetId, true);
  });

  document.querySelector(".entry-list").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action='delete']");
    if (!btn) return;
    const id = btn.closest(".entry-item").dataset.id;
    c.entries = c.entries.filter(e => e.id !== id);
    saveState();
    renderChallenge(targetId, true);
  });

  animateRings(document.getElementById(targetId), { instant: skipRingAnimation });
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

function renderCalendar(targetId = "todo-view-content") {
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

  document.getElementById(targetId).innerHTML = `
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
    renderCalendar(targetId);
  });
  document.getElementById("cal-next").addEventListener("click", function () {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar(targetId);
  });
  document.querySelector(".cal-grid").addEventListener("click", function (e) {
    const cell = e.target.closest(".cal-cell");
    if (!cell) return;
    selectedCalDate = cell.dataset.date;
    renderCalendar(targetId);
  });
}

/* ==========================================================
   12. YOU
   ========================================================== */
function renderYou() {
  const cs = getChallengeStats();
  const todayKey = getTodayKey();
  const todosToday = state.todos.filter(t => t.date <= todayKey);
  const todosDone = todosToday.filter(t => t.done).length;

  document.getElementById("page-you").innerHTML = `
    <div class="you-header">
      <button class="you-gear" id="you-settings-btn" aria-label="Settings">${ICONS.gear}</button>
    </div>

    <div class="you-identity">
      <h1 class="you-name">${USER_NAME}</h1>
      <span class="you-avatar">${USER_NAME.charAt(0)}</span>
    </div>

    <div class="you-tiles">
      <button class="you-tile" data-action="video">${ICONS.video}<span>Videos</span></button>
      <button class="you-tile" data-action="calendar">${ICONS.calendar}<span>Calendar</span></button>
      <button class="you-tile" data-action="challenge">${ICONS.target}<span>Challenge</span></button>
    </div>

    <div class="you-stat-card">
      <div>
        <span class="you-stat-value">${cs.started ? cs.dayNumber : "—"}</span>
        <span class="you-stat-label">Challenge Day${cs.started ? ` of ${state.challenge.durationDays}` : ""}</span>
      </div>
      ${ring(cs.pct, 44, 5, `<span class="ring-pct">${cs.pct}%</span>`)}
    </div>

    <div class="you-stat-card">
      <div>
        <span class="you-stat-value">${todosDone}/${todosToday.length}</span>
        <span class="you-stat-label">To-Dos Today</span>
      </div>
    </div>
  `;

  document.getElementById("you-settings-btn").addEventListener("click", () => showSection("settings"));

  document.querySelectorAll(".you-tile").forEach(btn => {
    btn.addEventListener("click", function () {
      const action = btn.dataset.action;
      if (action === "video") {
        showSection("video");
      } else if (action === "calendar") {
        todoView = "calendar";
        showSection("todo");
      } else if (action === "challenge") {
        homeTab = "challenge";
        showSection("home");
      }
    });
  });

  animateRings(document.getElementById("page-you"));
}

/* ==========================================================
   13. NOTES
   ========================================================== */
// Separate localStorage key — Notes data is independent of myday_state and
// must never be touched by the daily-reset / midnight-watcher logic above.
const NOTES_STORAGE_KEY = "myday_notes";

function defaultNotesData() {
  return { schemaVersion: 1, folders: [], notes: [] };
}

function loadNotesDataFromLocalStorage() {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return defaultNotesData();
    return Object.assign(defaultNotesData(), JSON.parse(raw));
  } catch (e) {
    console.error("Failed to load notes, resetting.", e);
    return defaultNotesData();
  }
}

// Same offline-first pattern as state above: synchronous localStorage value
// first, the Supabase fetch starts immediately in the background, and
// runSplash() awaits it before the first real render.
let notesData = loadNotesDataFromLocalStorage();
const notesSupabaseSyncPromise = syncNotesFromSupabase();

function saveNotesData() {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesData));
  pushNotesToSupabase();
}

let notesUpdatedAt = null;
let notesPushTimer = null;

function pushNotesToSupabase() {
  if (!sb) return;
  clearTimeout(notesPushTimer);
  notesPushTimer = setTimeout(async () => {
    // Set before the request, not after — see the matching comment in
    // pushStateToSupabase() above for why.
    const nowIso = new Date().toISOString();
    notesUpdatedAt = nowIso;
    try {
      const { error } = await sb
        .from("myday_notes")
        .update({ data: notesData, updated_at: nowIso })
        .eq("id", "singleton");
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase notes save failed; change is still safe in localStorage.", e);
    }
  }, 400);
}

async function syncNotesFromSupabase() {
  if (!sb) return;
  try {
    const { data, error } = await sb.from("myday_notes").select("data, updated_at").eq("id", "singleton").single();
    if (error) throw error;
    if (data && data.data && Object.keys(data.data).length > 0) {
      notesData = Object.assign(defaultNotesData(), data.data);
      notesUpdatedAt = data.updated_at;
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesData));
    } else {
      pushNotesToSupabase();
    }
  } catch (e) {
    console.warn("Supabase initial notes load failed; using localStorage copy.", e);
  }
}

function subscribeToNotesChanges() {
  if (!sb) return;
  sb.channel("myday_notes_changes")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "myday_notes" }, payload => {
      if (sameTimestamp(payload.new.updated_at, notesUpdatedAt)) return;
      notesData = Object.assign(defaultNotesData(), payload.new.data);
      notesUpdatedAt = payload.new.updated_at;
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesData));
      if (currentSectionName === "notes" && !isTypingInTextField()) renderNotes();
    })
    .subscribe();
}

let notesView = "folders"; // mobile drill-down only: "folders" | "list" | "editor"
let activeFolderId = null; // null = "All Notes"
let activeNoteId = null;
let notesSearchQuery = "";

function stripHtml(html) {
  const div = document.createElement("div");
  // textContent doesn't insert a space between separate block elements
  // (e.g. two <p>s), so "line one</p><p>line two" would otherwise read as
  // one run-on word in previews — add one at each block boundary first.
  div.innerHTML = html.replace(/<\/(p|div|li|h[1-6])>/gi, " </$1>");
  return div.textContent || "";
}

function notePreview(note) {
  return stripHtml(note.bodyHtml).trim().replace(/\s+/g, " ").slice(0, 90);
}

function formatNoteDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// "25 May 2026 at 21:17" — shown centered above the title on the mobile editor screen.
function formatNoteFullDate(ts) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} at ${h}:${m}`;
}

// Groups the notes list the way iCloud Notes does: Today / Yesterday / Previous 7 Days / Previous 30 Days / Earlier.
function noteTimeGroupLabel(ts) {
  const todayKey = getTodayKey();
  const noteKey = formatDateKey(new Date(ts));
  const diffDays = Math.round((new Date(todayKey + "T00:00:00") - new Date(noteKey + "T00:00:00")) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 Days";
  if (diffDays <= 30) return "Previous 30 Days";
  return "Earlier";
}

function notesInFolder(folderId) {
  let list = notesData.notes;
  if (folderId !== null) list = list.filter(n => n.folderId === folderId);
  const q = notesSearchQuery.trim().toLowerCase();
  if (q) list = list.filter(n => n.title.toLowerCase().includes(q) || stripHtml(n.bodyHtml).toLowerCase().includes(q));
  return list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
}

function createNote(folderId) {
  const note = { id: uid("n"), folderId, title: "", bodyHtml: "", createdAt: Date.now(), updatedAt: Date.now() };
  notesData.notes.unshift(note);
  saveNotesData();
  return note;
}

function createFolder(name) {
  const folder = { id: uid("f"), name, createdAt: Date.now() };
  notesData.folders.push(folder);
  saveNotesData();
  return folder;
}

function deleteFolder(folderId) {
  notesData.notes.forEach(n => { if (n.folderId === folderId) n.folderId = null; });
  notesData.folders = notesData.folders.filter(f => f.id !== folderId);
  saveNotesData();
}

function deleteNote(noteId) {
  notesData.notes = notesData.notes.filter(n => n.id !== noteId);
  saveNotesData();
  if (activeNoteId === noteId) activeNoteId = null;
}

function renderNotes() {
  const visibleNotes = notesInFolder(activeFolderId);
  if (!activeNoteId || !visibleNotes.some(n => n.id === activeNoteId)) {
    activeNoteId = visibleNotes.length ? visibleNotes[0].id : null;
  }
  document.getElementById("page-notes").innerHTML = `
    <div class="notes-layout" id="notes-layout" data-mobile-view="${notesView}">
      ${notesFoldersPaneHtml()}
      ${notesListPaneHtml(visibleNotes)}
      ${notesEditorPaneHtml()}
    </div>
  `;
  attachNotesFolderEvents();
  attachNotesListEvents();
  attachNotesEditorEvents();
  renderNotesMobileBar();
}

// Mobile's search bar + compose button (and, in the editor, the formatting
// toolbar pill) are rendered into #notes-mobile-bar — a fixed-position
// element living OUTSIDE #page-notes, as a direct sibling of .app-shell.
// They can't live inside the page itself: .page.active plays a translateY
// entrance animation, and CSS treats translateY(0) (the animation's "both"
// fill-mode resting value, not the keyword "none") as a non-none transform
// for as long as the page stays active — which makes the page a containing
// block for any fixed-position descendant, anchoring it to the PAGE's own
// box instead of the viewport. That's why this can't just be a fixed div
// nested in one of the panes (it was, and silently floated at the top of
// the page's content instead of pinning to the screen's bottom edge).
// On mobile, the on-screen keyboard shrinks window.visualViewport without
// shrinking the layout viewport that position:fixed anchors to — so a
// fixed-bottom element just sits where it always does, now covered by the
// keyboard, unless something actively moves it. Comparing the two viewport
// heights gives the keyboard's height, which we use to lift the bar to sit
// just above it; when the keyboard closes, the gap collapses back to ~0 and
// the bar returns to its normal CSS position (above the nav pill).
function repositionNotesMobileBar() {
  const bar = document.getElementById("notes-mobile-bar");
  if (!bar || !window.visualViewport) return;
  const keyboardHeight = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
  bar.style.bottom = keyboardHeight > 80 ? `${keyboardHeight + 10}px` : "";
}

function setupNotesMobileBarKeyboardHandling() {
  if (!window.visualViewport) return;
  window.visualViewport.addEventListener("resize", repositionNotesMobileBar);
  window.visualViewport.addEventListener("scroll", repositionNotesMobileBar);
}

function renderNotesMobileBar() {
  const bar = document.getElementById("notes-mobile-bar");
  bar.classList.remove("hidden");
  repositionNotesMobileBar();
  if (notesView === "editor") {
    const note = activeNoteId ? notesData.notes.find(n => n.id === activeNoteId) : null;
    bar.innerHTML = `
      ${note ? `<div class="note-toolbar note-toolbar-external">${noteToolbarButtonsHtml()}</div>` : `<span class="notes-mobile-bar-spacer"></span>`}
      <button class="notes-compose-fab" id="notes-new-note-editor-mobile" aria-label="New note">${ICONS.newNote}</button>
    `;
    if (note) wireToolbarButtons(bar);
    document.getElementById("notes-new-note-editor-mobile").addEventListener("click", handleCreateNote);
  } else {
    bar.innerHTML = `
      <div class="notes-search-pill">
        ${ICONS.search}
        <input type="text" id="notes-search-input-mobile" placeholder="Search" autocomplete="off" value="${notesView === "list" ? escapeHtml(notesSearchQuery) : ""}" />
        <span class="notes-search-mic" aria-hidden="true">${ICONS.mic}</span>
      </div>
      <button class="notes-compose-fab" id="notes-new-note-mobile" aria-label="New note">${ICONS.newNote}</button>
    `;
    document.getElementById("notes-new-note-mobile").addEventListener("click", handleCreateNote);
    const searchInput = document.getElementById("notes-search-input-mobile");
    if (notesView === "list") {
      searchInput.addEventListener("input", function (e) {
        notesSearchQuery = e.target.value;
        rerenderNotesListRows();
      });
    } else {
      // Folders screen: search jumps to a filtered All Notes list on Enter
      // (mirrors real Notes apps, where folder-screen search is a global
      // note search) instead of filtering live, which would mean rebuilding
      // this very bar — and stealing focus from its own input — every keystroke.
      searchInput.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        notesSearchQuery = e.target.value;
        activeFolderId = null;
        notesView = "list";
        renderNotes();
      });
    }
  }
}

function notesFoldersPaneHtml() {
  const allCount = notesData.notes.length;
  const folderRows = notesData.folders.map(f => {
    const count = notesData.notes.filter(n => n.folderId === f.id).length;
    return `
      <li class="notes-folder-item">
        <button class="notes-folder-row ${activeFolderId === f.id ? "active" : ""}" data-folder="${f.id}">
          ${ICONS.folder}<span class="notes-folder-name">${escapeHtml(f.name)}</span><span class="notes-folder-count">${count}</span>
        </button>
        <button class="notes-folder-delete" data-delete-folder="${f.id}" aria-label="Delete folder">✕</button>
      </li>
    `;
  }).join("");

  return `
    <div class="notes-folders-pane">
      <div class="notes-pane-header">
        <h2 class="notes-pane-title">Notes</h2>
        <button class="notes-icon-btn" id="notes-add-folder" aria-label="New folder">+</button>
      </div>
      <div class="notes-search">
        ${ICONS.search}
        <input type="text" id="notes-search-input" placeholder="Search all notes" value="${escapeHtml(notesSearchQuery)}" autocomplete="off" />
      </div>

      <h1 class="notes-mobile-title">Folders</h1>

      <div class="notes-folder-card">
        <button class="notes-folder-row notes-all-notes-row ${activeFolderId === null ? "active" : ""}" data-folder="all">
          ${ICONS.notes}<span class="notes-folder-name">All Notes</span><span class="notes-folder-count">${allCount}</span>
        </button>
        <ul class="notes-folder-list">${folderRows}</ul>
      </div>
    </div>
  `;
}

function notesListRowHtml(n) {
  return `
    <li>
      <button class="notes-list-row ${activeNoteId === n.id ? "active" : ""}" data-id="${n.id}">
        <span class="notes-row-top"><span class="notes-row-title">${escapeHtml(n.title) || "New Note"}</span><span class="notes-row-date">${formatNoteDate(n.updatedAt)}</span></span>
        <span class="notes-row-preview">${escapeHtml(notePreview(n)) || "No additional text"}</span>
      </button>
    </li>
  `;
}

// Mobile groups notes under Today/Yesterday/Previous 7 Days/etc. labels (matching iCloud Notes);
// desktop ignores the group headers entirely via CSS (display:none on .notes-time-group-label).
function notesListRowsHtml(visibleNotes) {
  if (!visibleNotes.length) return `<li class="notes-empty">No notes here yet.</li>`;
  let html = "";
  let lastGroup = null;
  visibleNotes.forEach(n => {
    const group = noteTimeGroupLabel(n.updatedAt);
    if (group !== lastGroup) {
      html += `<li class="notes-time-group-label">${group}</li>`;
      lastGroup = group;
    }
    html += notesListRowHtml(n);
  });
  return html;
}

function notesListPaneHtml(visibleNotes) {
  const folder = activeFolderId ? notesData.folders.find(f => f.id === activeFolderId) : null;
  const folderLabel = folder ? folder.name : "All Notes";

  return `
    <div class="notes-list-pane">
      <div class="notes-pane-header">
        <button class="notes-back-btn" id="notes-back-to-folders" aria-label="Back">${ICONS.chevronLeft}</button>
        <h2 class="notes-pane-title">${escapeHtml(folderLabel)}</h2>
        <span class="notes-topbar-spacer"></span>
      </div>

      <div class="notes-mobile-topbar">
        <button class="notes-icon-btn" id="notes-back-to-folders-mobile" aria-label="Back">${ICONS.chevronLeft}</button>
        <div class="notes-pill-group">
          <button class="notes-pill-icon" disabled aria-hidden="true" title="Sharing isn't available — MyDay stores notes only on this device">${ICONS.upload}</button>
        </div>
      </div>
      <h1 class="notes-mobile-title">${escapeHtml(folderLabel)}</h1>
      <p class="notes-mobile-subtitle">${visibleNotes.length} Note${visibleNotes.length === 1 ? "" : "s"}</p>

      <div class="notes-list-card">
        <ul class="notes-list-rows">${notesListRowsHtml(visibleNotes)}</ul>
      </div>
    </div>
  `;
}

function notesEditorPaneHtml() {
  const note = activeNoteId ? notesData.notes.find(n => n.id === activeNoteId) : null;
  return `
    <div class="notes-editor-pane">
      <div class="notes-pane-header">
        <button class="notes-back-btn" id="notes-back-to-list" aria-label="Back">${ICONS.chevronLeft}</button>
        <span class="notes-topbar-spacer"></span>
        <button class="notes-icon-btn" id="notes-new-note" aria-label="New note">${ICONS.newNote}</button>
      </div>

      <div class="notes-mobile-topbar">
        <button class="notes-icon-btn" id="notes-back-to-list-mobile" aria-label="Back">${ICONS.chevronLeft}</button>
        <div class="notes-pill-group">
          <button class="notes-pill-icon" disabled aria-hidden="true" title="Sharing isn't available — MyDay stores notes only on this device">${ICONS.upload}</button>
          ${note ? `<button class="notes-pill-icon" id="notes-delete-note-mobile" aria-label="Delete note">⋯</button>` : ""}
        </div>
      </div>

      ${note ? `
        <p class="notes-mobile-date">${formatNoteFullDate(note.updatedAt)}</p>
        <input type="text" id="note-title-input" class="note-title-input" placeholder="Title" value="${escapeHtml(note.title)}" autocomplete="off" />
        <div class="note-toolbar">${noteToolbarButtonsHtml()}</div>
        <div class="note-body" id="note-body" contenteditable="true">${note.bodyHtml}</div>
      ` : `
        <div class="notes-editor-empty">
          <p>No note selected.</p>
        </div>
      `}
    </div>
  `;
}

function noteToolbarButtonsHtml() {
  return `
    <div class="note-toolbar-row">
      <button type="button" data-cmd="bold" aria-label="Bold"><b>B</b></button>
      <button type="button" data-cmd="italic" aria-label="Italic"><i>I</i></button>
      <button type="button" data-cmd="underline" aria-label="Underline"><u>U</u></button>
      <button type="button" data-cmd="strikeThrough" aria-label="Strikethrough"><s>S</s></button>
    </div>
    <div class="note-toolbar-divider"></div>
    <div class="note-toolbar-row">
      <button type="button" data-cmd="formatBlock" data-val="H1">Title</button>
      <button type="button" data-cmd="formatBlock" data-val="H2">Heading</button>
      <button type="button" data-cmd="formatBlock" data-val="H3">Subheading</button>
      <button type="button" data-cmd="formatBlock" data-val="P">Body</button>
      <button type="button" data-cmd="insertUnorderedList" aria-label="Bulleted list">${ICONS.listBullet}</button>
      <button type="button" data-cmd="insertOrderedList" aria-label="Numbered list">${ICONS.listNumber}</button>
      <button type="button" data-action="checklist" aria-label="Checklist">${ICONS.check}</button>
    </div>
  `;
}

// Shared by the desktop inline toolbar and the external mobile toolbar pill
// (#notes-mobile-bar) so both can format the one active note consistently.
function persistActiveNote() {
  const note = notesData.notes.find(n => n.id === activeNoteId);
  const titleInput = document.getElementById("note-title-input");
  const body = document.getElementById("note-body");
  if (!note || !titleInput || !body) return;
  note.title = titleInput.value;
  note.bodyHtml = body.innerHTML;
  note.updatedAt = Date.now();
  saveNotesData();
  updateNoteListRowInPlace(note);
}

function wireToolbarButtons(container) {
  const body = document.getElementById("note-body");
  if (!body) return;
  container.querySelectorAll("button[data-cmd]").forEach(btn => {
    btn.addEventListener("mousedown", function (e) {
      e.preventDefault();
      document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null);
      persistActiveNote();
    });
  });
  const checklistBtn = container.querySelector('button[data-action="checklist"]');
  if (checklistBtn) {
    checklistBtn.addEventListener("mousedown", function (e) {
      e.preventDefault();
      body.focus();
      document.execCommand("insertHTML", false, '<ul class="note-checklist"><li><input type="checkbox">List item</li></ul>');
      persistActiveNote();
    });
  }
}

function updateNoteListRowInPlace(note) {
  const row = document.querySelector(`.notes-list-row[data-id="${note.id}"]`);
  if (!row) return;
  row.querySelector(".notes-row-title").textContent = note.title || "New Note";
  row.querySelector(".notes-row-date").textContent = formatNoteDate(note.updatedAt);
  row.querySelector(".notes-row-preview").textContent = notePreview(note) || "No additional text";
}

// Shared by every "+ new note" entry point (desktop header, mobile folders
// screen, mobile list screen, mobile editor screen) — all create a note in
// whatever folder is currently selected and jump straight into the editor.
function handleCreateNote() {
  const note = createNote(activeFolderId);
  activeNoteId = note.id;
  notesView = "editor";
  renderNotes();
  const titleInput = document.getElementById("note-title-input");
  if (titleInput) titleInput.focus();
}

function handleAddFolder() {
  const name = prompt("Folder name");
  if (!name || !name.trim()) return;
  const folder = createFolder(name.trim());
  activeFolderId = folder.id;
  notesView = "list";
  renderNotes();
}

function attachNotesFolderEvents() {
  document.querySelectorAll(".notes-folder-row").forEach(btn => {
    btn.addEventListener("click", function () {
      activeFolderId = btn.dataset.folder === "all" ? null : btn.dataset.folder;
      notesView = "list";
      renderNotes();
    });
  });

  document.querySelectorAll(".notes-folder-delete").forEach(btn => {
    btn.addEventListener("click", function () {
      const folderId = btn.dataset.deleteFolder;
      if (!confirm("Delete this folder? Its notes will move to All Notes.")) return;
      deleteFolder(folderId);
      if (activeFolderId === folderId) activeFolderId = null;
      renderNotes();
    });
  });

  document.getElementById("notes-add-folder").addEventListener("click", handleAddFolder);

  document.getElementById("notes-search-input").addEventListener("input", function (e) {
    notesSearchQuery = e.target.value;
    rerenderNotesListRows();
  });
}

function attachNotesListEvents() {
  document.getElementById("notes-back-to-folders").addEventListener("click", function () {
    notesView = "folders";
    renderNotes();
  });
  document.getElementById("notes-back-to-folders-mobile").addEventListener("click", function () {
    notesView = "folders";
    renderNotes();
  });
  document.querySelectorAll(".notes-list-row").forEach(btn => {
    btn.addEventListener("click", function () {
      activeNoteId = btn.dataset.id;
      notesView = "editor";
      renderNotes();
    });
  });
}

function attachNotesEditorEvents() {
  document.getElementById("notes-back-to-list").addEventListener("click", function () {
    notesView = "list";
    renderNotes();
  });
  document.getElementById("notes-back-to-list-mobile").addEventListener("click", function () {
    notesView = "list";
    renderNotes();
  });
  document.getElementById("notes-new-note").addEventListener("click", handleCreateNote);

  const deleteBtn = document.getElementById("notes-delete-note-mobile");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      if (!confirm("Delete this note? This can't be undone.")) return;
      deleteNote(activeNoteId);
      notesView = "list";
      renderNotes();
    });
  }

  const titleInput = document.getElementById("note-title-input");
  const body = document.getElementById("note-body");
  if (!titleInput || !body) return;

  titleInput.addEventListener("input", persistActiveNote);
  body.addEventListener("input", persistActiveNote);

  wireToolbarButtons(document.querySelector(".notes-editor-pane .note-toolbar"));
}

// Search re-renders only the rows inside the notes list (and the editor pane,
// but only when the active note actually changes) — never the search inputs
// themselves or the rest of either pane, so whichever search field the user
// is typing in (desktop's, in the folders pane, or mobile's, in the list
// pane) never loses focus mid-keystroke.
function rerenderNotesListRows() {
  const visibleNotes = notesInFolder(activeFolderId);
  const activeNoteChanged = !activeNoteId || !visibleNotes.some(n => n.id === activeNoteId);
  if (activeNoteChanged) activeNoteId = visibleNotes.length ? visibleNotes[0].id : null;

  document.querySelector(".notes-list-rows").innerHTML = notesListRowsHtml(visibleNotes);
  document.querySelectorAll(".notes-list-row").forEach(btn => {
    btn.addEventListener("click", function () {
      activeNoteId = btn.dataset.id;
      notesView = "editor";
      renderNotes();
    });
  });
  document.querySelectorAll(".notes-mobile-subtitle").forEach(el => {
    el.textContent = `${visibleNotes.length} Note${visibleNotes.length === 1 ? "" : "s"}`;
  });

  if (activeNoteChanged) {
    document.querySelector(".notes-editor-pane").outerHTML = notesEditorPaneHtml();
    attachNotesEditorEvents();
  }
}

/* ==========================================================
   14. SETTINGS
   ========================================================== */
function renderSettings() {
  document.getElementById("page-settings").innerHTML = `
    <div class="settings-topbar">
      <button class="settings-back" id="settings-back-btn" aria-label="Back">${ICONS.chevronLeft}</button>
      <h1 class="settings-title">Settings</h1>
      <span class="settings-topbar-spacer"></span>
    </div>

    <h2 class="settings-section-label">Appearance</h2>
    <div class="settings-list">
      <div class="settings-list-row">
        <span class="settings-row-label">Dark mode</span>
        <button class="toggle-pill ${state.settings.theme === "dark" ? "on" : ""}" id="theme-toggle" role="switch" aria-checked="${state.settings.theme === "dark"}"><span class="toggle-pill-knob"></span></button>
      </div>
    </div>

    <h2 class="settings-section-label">Reminder times</h2>
    <div class="settings-list">
      <div class="settings-list-row">
        <span class="settings-row-label">Workout reminder</span>
        <input type="time" id="workout-time" value="${state.settings.workoutReminderTime}" />
      </div>
    </div>
    <p class="settings-note">${ICONS.warning}<span>Prayer now reminds you 3x a day (1PM, 5PM, 8PM) — those times
    are fixed in <code>.github/workflows/reminders.yml</code>, not editable here. Changing the workout time above
    updates MyDay only; you must also edit the matching cron line in that file (and push the change) for the real
    reminder to move. See CLAUDE.md for the full notification setup guide.</span></p>

    <h2 class="settings-section-label">Backup your data</h2>
    <div class="settings-list">
      <button class="settings-list-row settings-row-action" id="export-btn"><span class="settings-row-label">${ICONS.download} Export Data</span></button>
      <label class="settings-list-row settings-row-action import-btn"><span class="settings-row-label">${ICONS.upload} Import Data</span><input type="file" id="import-input" accept="application/json" hidden /></label>
    </div>
    <p class="settings-note">MyDay stores everything on this device only — your laptop browser and your installed
    Android app do not sync automatically. Export here, then import on the other device to move your data.</p>

    <h2 class="settings-section-label">About</h2>
    <p class="settings-note">MyDay is password-protected casually, not securely — the password lives in plain
    text in app.js. Don't rely on it to protect sensitive information from a determined viewer.</p>
  `;

  document.getElementById("settings-back-btn").addEventListener("click", () => showSection("you"));

  document.getElementById("theme-toggle").addEventListener("click", function () {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
    renderSettings();
  });

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
   15. SERVICE WORKER + ONESIGNAL
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
   16. BOOTSTRAP
   ========================================================== */
function initApp() {
  ensureDayRecord(getTodayKey());
  document.querySelectorAll(".nav-avatar").forEach(el => el.textContent = USER_NAME.charAt(0));
  document.getElementById("todo-fab").addEventListener("click", () => openTodoSheet());
  document.getElementById("voice-fab").addEventListener("click", startVoiceCapture);
  document.getElementById("sidebar-toggle-btn").addEventListener("click", () => setSidebarCollapsed(true));
  document.getElementById("sidebar-reopen-btn").addEventListener("click", () => setSidebarCollapsed(false));
  showSection("home");
  registerServiceWorker();
  armMidnightWatcher();
  subscribeToStateChanges();
  subscribeToNotesChanges();
  setupNotesMobileBarKeyboardHandling();
}

function runSplash() {
  setTimeout(() => {
    splashView.classList.add("fade-out");
    setTimeout(async () => {
      splashView.classList.add("hidden");
      // Give the Supabase fetches (already in flight since the moment this
      // script started) a chance to land before the first real render, so
      // the app opens with the freshest cross-device data when possible —
      // but never block startup for more than 3s if the network is slow or
      // unreachable; the localStorage copy is already a perfectly usable
      // fallback (see the comments on stateSupabaseSyncPromise above).
      await Promise.race([
        Promise.all([stateSupabaseSyncPromise, notesSupabaseSyncPromise]),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
      // LOCK_ENABLED is off, so the password gate is skipped entirely and we
      // go straight to the app. Flip LOCK_ENABLED back to true to restore it
      // without losing any of the lock-screen code below.
      if (!LOCK_ENABLED || isUnlocked()) {
        lockView.classList.add("hidden");
        appView.classList.remove("hidden");
        initApp();
      } else {
        showLock();
      }
    }, 400); // matches #splash-view's CSS transition duration
  }, 700); // minimum splash dwell time
}

runSplash();
