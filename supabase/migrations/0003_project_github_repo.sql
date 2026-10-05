-- Link a project to the GitHub repository it comes from ("owner/name").
-- Lets the app show the repository's open issues and pull requests, and match imports
-- by repository instead of by project name.
alter table public.projects
  add column github_repo text
    check (github_repo is null or github_repo ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$');

-- A repository can be linked to at most one project per user (case-insensitive).
create unique index projects_user_github_repo_key
  on public.projects (user_id, lower(github_repo))
  where github_repo is not null;
