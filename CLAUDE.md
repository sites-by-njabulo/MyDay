# MyDay

Personal daily life management PWA. Vanilla HTML/CSS/JS, no build step, no framework — consistent with the other site folders in this workspace.

## Tech

- `index.html` / `styles.css` / `app.js` — single-page app, section-based router.
- `data/verses.js`, `data/quotes.js` — 30 entries each, cycle by `(date.getDate() - 1) % 30`.
- `manifest.json` + `sw.js` — PWA installability + offline app shell caching. The fetch handler is **network-first**: every load tries the network for the latest deployed files first and only falls back to the cache when offline. (It used to be cache-first, which silently kept serving stale `app.js`/`styles.css` after every deploy unless `sw.js` itself also changed bytes — bumping `CACHE_NAME` is no longer required for a deploy to take effect, only useful to force the offline-fallback cache to refresh.)
- `.github/workflows/reminders.yml` — sends the daily push reminders via OneSignal's REST API on a cron schedule.
- Supabase (`@supabase/supabase-js` v2, loaded via CDN in `index.html`) — cross-device real-time sync. See "Cross-device sync" below for the full architecture and the one-time setup required.

## Palette & Typography

Dark minimalist theme. All accent usage is intentionally sparse — only active states, buttons, and progress bars use it.

| Token | Value |
|---|---|
| `--bg` (page background) | `#18181b` |
| `--sidebar-bg` (nav) | `#111111` |
| `--card-bg` | `#27272a` |
| `--text-primary` | `#f4f4f5` |
| `--text-secondary` | `#a1a1aa` |
| `--accent` (sparingly) | `#7c3aed` |
| `--border` | `#3f3f46` |
| `--input-bg` | `#1c1c1f` |

Font: Inter, used everywhere including the Bible verse callout (no serif). Icons throughout the UI are inline SVGs (`ICONS` object in `app.js` for JS-rendered content, static markup in `index.html` for the nav) — no emoji in the interface.

## localStorage shape (`myday_state`)

```json
{
  "schemaVersion": 1,
  "days": {
    "YYYY-MM-DD": {
      "faith": { "prayerTimes": { "noon": false, "evening": false, "night": false }, "bibleReadingDone": false },
      "workout": { "pushups": {"count":0,"goal":200}, "curls": {"count":0,"goal":100} }
    }
  },
  "todos": [{ "id": "", "text": "", "done": false, "date": "YYYY-MM-DD", "description": "", "priority": null, "time": null }],
  "videoPlan": [{ "id": "", "url": "", "watched": false, "addedAt": "" }],
  "challenge": { "startDate": null, "targetAmount": 10000, "durationDays": 60, "entries": [{ "id": "", "amount": 0, "description": "", "date": "" }] },
  "settings": { "prayerReminderTime": "07:00", "workoutReminderTime": "18:00" }
}
```

- `days["YYYY-MM-DD"]` is created lazily by `ensureDayRecord()` — the entire daily-reset mechanism for faith/workout, no cron needed client-side.
- `todos` is a flat, root-level array (not nested per day). Each item carries its own `date`. The To-Do page buckets `date <= today` into "Today" (this also surfaces overdue, undone tasks) and `date > today` into "Upcoming". The Calendar page reads this same array to show dots and the day-detail panel.
- `faith.prayerTimes` is 3 fixed checkboxes (`noon`/`evening`/`night` = 12PM/5PM/8PM), not a counter — check one when you pray at that time. `bibleReadingDone` stays a simple boolean. Both reset at midnight via `ensureDayRecord()`/`armMidnightWatcher()`, same as workout counts.
- `todos[].description`/`priority`/`time` are optional (older saved todos simply lack them, read safely as falsy). `priority` is `null|"low"|"med"|"high"`, shown as a colored dot on the task row. `time` is `"HH:MM"|null`. `armMidnightWatcher()` (region 4) re-renders the active section right after local midnight so faith/workout counters visibly reset even if the app was left open straight through it — `ensureDayRecord()` alone only resets lazily, on the next render.

## localStorage shape (`myday_notes`) — separate key, never touched by the daily reset

```json
{
  "schemaVersion": 1,
  "folders": [{ "id": "", "name": "", "createdAt": 0 }],
  "notes": [{ "id": "", "folderId": null, "title": "", "bodyHtml": "", "createdAt": 0, "updatedAt": 0 }]
}
```

- `folderId: null` means unfiled — visible only under "All Notes". Deleting a folder un-files its notes rather than deleting them.
- `bodyHtml` is the note editor's raw `contenteditable` `innerHTML` (formatted via `document.execCommand` for bold/italic/underline/strike/headings/lists; checklists are a hand-inserted `<ul class="note-checklist">`). This is a deliberate simplification, not a structured document model.
- Desktop renders all 3 Notes panes (folders/list/editor) at once; mobile drill-down (`notesView`: `"folders"|"list"|"editor"`) shows one at a time via `.notes-layout[data-mobile-view]` in `styles.css`, same DOM either way.
- `migrateState()` in `app.js` (region 2) upgrades older saved data on load: flattens any old nested `day.todos` into the root `todos` array, and walks old `faith.prayerDone` (boolean) → `prayerCount` (number) → `prayerTimes` (3 checkboxes) shapes forward to the current one. Safe to run repeatedly; only touches days that still have an old shape. Note the old counter can't tell you *which* times were prayed, so migrating a counter-shaped day starts all 3 checkboxes unchecked rather than guessing.
- `getChallengeStats()` (region 10) is the single source of truth for days-remaining/total-earned/progress — used by both the read-only Home summary card and the full Challenge page so they never drift out of sync.

## Cross-device sync (Supabase)

MyDay syncs across devices in real time through Supabase, while staying fully offline-capable.

**Architecture** — two Postgres tables, each holding exactly one row (`id = 'singleton'`) with the entire existing localStorage blob stored as JSONB in a `data` column:

| Table | Mirrors localStorage key | Holds |
|---|---|---|
| `myday_state` | `myday_state` | `state` — days, todos, videoPlan, challenge, settings |
| `myday_notes` | `myday_notes` | `notesData` — folders, notes |

This was a deliberate choice over a normalized relational schema (separate `todos`/`days`/`entries`/`notes` tables): it means `loadState()`/`saveState()`/`loadNotesData()`/`saveNotesData()` are the *only* functions that needed to change. Every other function in `app.js` still reads/writes `state.x` / `notesData.x` as plain in-memory JS objects exactly as before.

**Offline-first flow** (`app.js` regions 2, 13, 16):
1. `state`/`notesData` load synchronously from localStorage first — the app is interactive immediately, sync or no sync.
2. `syncStateFromSupabase()` / `syncNotesFromSupabase()` start in the background the instant the script runs. `runSplash()` awaits both (capped at 3s) before the first real render, so the app *usually* opens with the freshest cross-device copy — but never hangs on a slow/dead network.
3. `saveState()`/`saveNotesData()` still write to localStorage synchronously and unconditionally (nothing about the save path got slower or riskier), then fire a **debounced** (400ms) background `update` to Supabase. A failed push only logs a `console.warn` — the localStorage write already succeeded.
4. `subscribeToStateChanges()` / `subscribeToNotesChanges()` (started in `initApp()`) listen for Postgres `UPDATE` events on both tables and live-merge + re-render when another device pushes a change. Each side tracks the `updated_at` of its own last write/read to ignore the realtime echo of its own save.

**One-time setup required** (this hasn't been run yet — until it is, the app silently falls back to localStorage-only, exactly as before this feature existed):
1. Open the Supabase dashboard for project `cqblgvscgcrfabvuxsml` → SQL Editor → New query.
2. Paste and run `supabase/schema.sql` (creates both tables, seeds the singleton rows, enables RLS + Realtime).
3. Reload MyDay on two devices/tabs — a change on one should appear on the other within ~1s.

**Security note:** no Supabase Auth is used (MyDay has no login system — `APP_PASSWORD` is a casual client-side gate, not real auth). The RLS policies in `schema.sql` give the anon/publishable key full read/write access, so anyone with the project URL + anon key can read or overwrite this data. Same trust model as `APP_PASSWORD`: fine for one person's personal data, not a substitute for real access control.

## Notification setup checklist (one-time, manual)

1. Create a free account at onesignal.com, create an app called "MyDay".
2. Add a Web Push platform, Site URL = your GitHub Pages URL for this project.
3. Copy the **public App ID** into `index.html`'s OneSignal init snippet (replace `YOUR-ONESIGNAL-APP-ID`).
4. In the MyDay GitHub repo: Settings → Secrets and variables → Actions → add:
   - `ONESIGNAL_APP_ID`
   - `ONESIGNAL_REST_API_KEY` (from OneSignal dashboard → Settings → Keys & IDs — keep this secret, never put it in client code)
5. Deploy to GitHub Pages, visit the live site once, accept the browser push permission prompt to subscribe your device.
6. In the repo's Actions tab, use "Run workflow" (`workflow_dispatch`) on `reminders.yml` to test-send each reminder type before trusting the schedule.

Reminder schedule (Africa/Johannesburg, UTC+2, no DST):

| Reminder | Local time | Cron (UTC) |
|---|---|---|
| Bible verse | 10:00 AM | `7 8 * * *` |
| Set to-do list | 11:00 AM | `7 9 * * *` |
| Motivational quote | 3:00 PM | `7 13 * * *` |
| Prayer | 12:00 PM, 5:00 PM, 8:00 PM | `7 10 * * *`, `7 15 * * *`, `7 18 * * *` |
| Workout (placeholder, edit to your time) | 6:00 PM | `7 16 * * *` |

**To change a reminder time:** edit the matching cron line in `.github/workflows/reminders.yml` and commit. The in-app Settings page only has a workout-time picker now (local-display-only, does not update this file automatically) — prayer no longer has an in-app picker since it fires 3 fixed times a day, set directly in the workflow file.

## Known limitations

- **Two places to update the workout reminder time** — see above.
- **Cron isn't exact-to-the-second.** GitHub Actions can delay scheduled runs by minutes under high load.
- **Client-side password is a casual deterrent, not real security** — `APP_PASSWORD` in `app.js` is visible in page source.
- **No Supabase Auth — same trust model as the password above.** Anyone with the Supabase URL + anon key (both visible in `app.js`) can read/write the synced data. Acceptable for one person's personal data; see "Cross-device sync" above.
- **Public GitHub Pages.** The link isn't shared anywhere, but the source is technically viewable by anyone with the URL. Personal data now lives in Supabase (synced) with a localStorage fallback copy, not in the deployed source itself.

## Things still to do

- **Run `supabase/schema.sql` once in the Supabase SQL Editor** — until this is done, sync silently falls back to localStorage-only (see "Cross-device sync" above).
- Set a real `APP_PASSWORD` in `app.js` (currently `changeme123`).
- Insert the real OneSignal App ID in `index.html` and the two GitHub Actions secrets.
- Deploy to GitHub Pages and update the Site URL in OneSignal / the Launch URLs in `reminders.yml` if desired.
- Optional: replace the placeholder "M" icon in `icons/` with a custom design.
