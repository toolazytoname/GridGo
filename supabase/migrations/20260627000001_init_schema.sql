-- ──────────────────────────────────────────────────────────
-- GridGo initial schema
-- 主 App (app.html) 的数据模型
-- ──────────────────────────────────────────────────────────

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── profiles ────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text not null default '',
  role          text,
  bio           text,
  avatar_color  text not null default 'oklch(58% 0.18 255)',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── okrs ────────────────────────────────────────────────
create table public.okrs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  title         text not null,
  description   text,
  category      text not null check (category in ('product','health','skill','finance')),
  quarter       text not null,            -- e.g. '2026-Q3'
  progress      numeric(4,3) not null default 0 check (progress >= 0 and progress <= 1),
  archived      boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index okrs_user_idx on public.okrs(user_id, archived, quarter);

alter table public.okrs enable row level security;

create policy "okrs: read own" on public.okrs for select using (auth.uid() = user_id);
create policy "okrs: insert own" on public.okrs for insert with check (auth.uid() = user_id);
create policy "okrs: update own" on public.okrs for update using (auth.uid() = user_id);
create policy "okrs: delete own" on public.okrs for delete using (auth.uid() = user_id);

-- ─── key_results ─────────────────────────────────────────
create table public.key_results (
  id            uuid primary key default gen_random_uuid(),
  okr_id        uuid not null references public.okrs on delete cascade,
  title         text not null,
  progress      numeric(4,3) not null default 0 check (progress >= 0 and progress <= 1),
  due_date      date,
  done          boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index key_results_okr_idx on public.key_results(okr_id, sort_order);

alter table public.key_results enable row level security;

create policy "key_results: read via okr" on public.key_results
  for select using (
    exists (select 1 from public.okrs o where o.id = key_results.okr_id and o.user_id = auth.uid())
  );
create policy "key_results: write via okr" on public.key_results
  for insert with check (
    exists (select 1 from public.okrs o where o.id = key_results.okr_id and o.user_id = auth.uid())
  );
create policy "key_results: update via okr" on public.key_results
  for update using (
    exists (select 1 from public.okrs o where o.id = key_results.okr_id and o.user_id = auth.uid())
  );
create policy "key_results: delete via okr" on public.key_results
  for delete using (
    exists (select 1 from public.okrs o where o.id = key_results.okr_id and o.user_id = auth.uid())
  );

-- ─── tasks ───────────────────────────────────────────────
create table public.tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  okr_id          uuid references public.okrs on delete set null,
  key_result_id   uuid references public.key_results on delete set null,
  parent_task_id  uuid references public.tasks on delete cascade,
  title           text not null,
  notes           text,
  quadrant        text check (quadrant in ('q1','q2','q3','q4')),
  priority        text check (priority in ('low','med','high')),
  due_date        date,
  estimate_min    int,
  done            boolean not null default false,
  done_at         timestamptz,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index tasks_user_idx on public.tasks(user_id, done, due_date);
create index tasks_okr_idx on public.tasks(okr_id) where okr_id is not null;
create index tasks_parent_idx on public.tasks(parent_task_id) where parent_task_id is not null;
create index tasks_quadrant_idx on public.tasks(user_id, quadrant) where quadrant is not null;

alter table public.tasks enable row level security;

create policy "tasks: read own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks: insert own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks: update own" on public.tasks for update using (auth.uid() = user_id);
create policy "tasks: delete own" on public.tasks for delete using (auth.uid() = user_id);

-- ─── calendar_events ─────────────────────────────────────
create table public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  task_id     uuid references public.tasks on delete cascade,
  title       text not null,
  start_at    timestamptz not null,
  end_at      timestamptz,
  quadrant    text check (quadrant in ('q1','q2','q3','q4')),
  created_at  timestamptz not null default now()
);

create index calendar_user_start_idx on public.calendar_events(user_id, start_at);

alter table public.calendar_events enable row level security;

create policy "calendar_events: read own" on public.calendar_events for select using (auth.uid() = user_id);
create policy "calendar_events: write own" on public.calendar_events for insert with check (auth.uid() = user_id);
create policy "calendar_events: update own" on public.calendar_events for update using (auth.uid() = user_id);
create policy "calendar_events: delete own" on public.calendar_events for delete using (auth.uid() = user_id);

-- ─── achievements ────────────────────────────────────────
create table public.achievements (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  key          text not null,
  title        text not null,
  description  text,
  unlocked_at  timestamptz not null default now(),
  unique (user_id, key)
);

alter table public.achievements enable row level security;

create policy "achievements: read own" on public.achievements for select using (auth.uid() = user_id);
create policy "achievements: insert own" on public.achievements for insert with check (auth.uid() = user_id);
