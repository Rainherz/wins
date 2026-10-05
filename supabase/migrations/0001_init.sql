-- Wins: initial schema.
-- Every table is owned by a user and protected by row level security.

create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  description text not null default '',
  color_slot  smallint not null check (color_slot between 0 and 4),
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);

-- A user cannot have two projects with the same name (case-insensitive).
create unique index projects_user_name_key on public.projects (user_id, lower(name));

create table public.wins (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id   uuid not null references public.projects (id) on delete restrict,
  title        text not null check (char_length(title) between 1 and 280),
  is_milestone boolean not null default false,
  achieved_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index wins_user_achieved_idx on public.wins (user_id, achieved_at desc);
create index wins_project_idx on public.wins (project_id);

create table public.day_closures (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day        date not null,
  mood       text not null check (mood in ('good', 'so-so', 'tough')),
  stuck_note text,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Row level security: each user can only touch their own rows.
alter table public.projects enable row level security;
alter table public.wins enable row level security;
alter table public.day_closures enable row level security;

create policy "Owner manages own projects"
  on public.projects for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owner manages own wins"
  on public.wins for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owner manages own day closures"
  on public.day_closures for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
