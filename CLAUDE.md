# MyDay

Personal daily life management PWA. Vanilla HTML/CSS/JS, no build step, no framework — consistent with the other site folders in this workspace.

## Tech

- `index.html` / `styles.css` / `app.js` — single-page app, section-based router.
- `data/verses.js`, `data/quotes.js` — 30 entries each, cycle by `(date.getDate() - 1) % 30`.
- `manifest.json` + `sw.js` — PWA installability + offline app shell caching.
- `.github/workflows/reminders.yml` — sends the daily push reminders via OneSignal's REST API on a cron schedule.

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
      "faith": { "prayerCount": 0, "bibleReadingDone": false },
      "workout": { "pushups": {"count":0,"goal":200}, "curls": {"count":0,"goal":100} }
    }
  },
  "todos": [{ "id": "", "text": "", "done": false, "date": "YYYY-MM-DD" }],
  "videoPlan": [{ "id": "", "url": "", "watched": false, "addedAt": "" }],
  "challenge": { "startDate": null, "targetAmount": 10000, "durationDays": 60, "entries": [{ "id": "", "amount": 0, "description": "", "date": "" }] },
  "settings": { "prayerReminderTime": "07:00", "workoutReminderTime": "18:00" }
}
```

- `days["YYYY-MM-DD"]` is created lazily by `ensureDayRecord()` — the entire daily-reset mechanism for faith/workout, no cron needed client-side.
- `todos` is a flat, root-level array (not nested per day). Each item carries its own `date`. The To-Do page buckets `date <= today` into "Today" (this also surfaces overdue, undone tasks) and `date > today` into "Upcoming". The Calendar page reads this same array to show dots and the day-detail panel.
- `faith.prayerCount` is an incrementing counter (tap to log each prayer), not a boolean — prayer happens multiple times a day. `bibleReadingDone` stays a simple boolean.
- `migrateState()` in `app.js` (region 2) upgrades older saved data on load: flattens any old nested `day.todos` into the root `todos` array, and converts old `faith.prayerDone` booleans into `prayerCount` (0 or 1). Safe to run repeatedly; only touches days that still have the old shape.
- `getChallengeStats()` (region 10) is the single source of truth for days-remaining/total-earned/progress — used by both the read-only Home summary card and the full Challenge page so they never drift out of sync.

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
| Prayer | 1:00 PM, 5:00 PM, 8:00 PM | `7 11 * * *`, `7 15 * * *`, `7 18 * * *` |
| Workout (placeholder, edit to your time) | 6:00 PM | `7 16 * * *` |

**To change a reminder time:** edit the matching cron line in `.github/workflows/reminders.yml` and commit. The in-app Settings page only has a workout-time picker now (local-display-only, does not update this file automatically) — prayer no longer has an in-app picker since it fires 3 fixed times a day, set directly in the workflow file.

## Known limitations

- **No cross-device sync.** Laptop browser localStorage and the installed Android PWA's localStorage are separate. Use Settings → Export/Import to move data manually.
- **Two places to update the workout reminder time** — see above.
- **Cron isn't exact-to-the-second.** GitHub Actions can delay scheduled runs by minutes under high load.
- **Client-side password is a casual deterrent, not real security** — `APP_PASSWORD` in `app.js` is visible in page source.
- **Public GitHub Pages.** The link isn't shared anywhere, but the source is technically viewable by anyone with the URL. Personal data itself stays in localStorage, not in the deployed source.

## Things still to do

- Set a real `APP_PASSWORD` in `app.js` (currently `changeme123`).
- Insert the real OneSignal App ID in `index.html` and the two GitHub Actions secrets.
- Deploy to GitHub Pages and update the Site URL in OneSignal / the Launch URLs in `reminders.yml` if desired.
- Optional: replace the placeholder "M" icon in `icons/` with a custom design.
