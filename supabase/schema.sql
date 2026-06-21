-- MyDay Supabase setup — run this once in the Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste this whole file -> Run).
--
-- Architecture: each table holds ONE row (id = 'singleton') containing the
-- entire app-state blob as JSONB, mirroring the existing localStorage shape
-- exactly. This keeps the migration surgical — only the load/save functions
-- in app.js change; every other function still reads/writes state.x /
-- notesData.x exactly as before.
--
-- No Supabase Auth is used here (MyDay is a single-person app with a casual
-- client-side password, not a real auth system). The anon/publishable key
-- is given full read/write access via RLS below. Treat this the same way
-- as APP_PASSWORD in app.js: a casual deterrent, not real security — anyone
-- who has the URL + anon key can read or overwrite this data. Acceptable
-- for personal use; do not reuse this key/project for anything sensitive.

create table if not exists public.myday_state (
  id text primary key default 'singleton',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.myday_notes (
  id text primary key default 'singleton',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Seed the one row each table will ever have. ON CONFLICT DO NOTHING makes
-- this safe to re-run.
insert into public.myday_state (id, data) values ('singleton', '{}'::jsonb)
  on conflict (id) do nothing;
insert into public.myday_notes (id, data) values ('singleton', '{}'::jsonb)
  on conflict (id) do nothing;

alter table public.myday_state enable row level security;
alter table public.myday_notes enable row level security;

drop policy if exists "anon full access" on public.myday_state;
create policy "anon full access" on public.myday_state
  for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.myday_notes;
create policy "anon full access" on public.myday_notes
  for all to anon using (true) with check (true);

-- Enable Realtime so other open devices/tabs get pushed live updates.
alter publication supabase_realtime add table public.myday_state;
alter publication supabase_realtime add table public.myday_notes;
