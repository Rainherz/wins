-- GitHub import: mark where a win came from and store the user's GitHub token.

-- A win imported from GitHub keeps a stable external id (for example
-- "github:owner/repo#12") so importing twice never creates duplicates.
alter table public.wins
  add column external_id  text,
  add column external_url text;

create unique index wins_user_external_id_key
  on public.wins (user_id, external_id)
  where external_id is not null;

-- One GitHub connection per user. Use a fine-grained, read-only token limited to
-- the repositories you want to import from.
create table public.github_connections (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  login      text not null,
  token      text not null,
  updated_at timestamptz not null default now()
);

alter table public.github_connections enable row level security;

create policy "Owner manages own github connection"
  on public.github_connections for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
