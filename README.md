# Wins

A personal progress tracker for people whose days are made of projects and tasks. Log what you finished, close the day with how it felt, and see your week at a glance, so progress stops disappearing the moment you check something off.

Built with React Native (Expo), runs on web, iOS and Android from one codebase. Backend: Supabase.

## The problem

Finished tasks vanish. At the end of the week it feels like nothing moved, and motivation drops. Wins keeps every finished thing visible, grouped by day and project.

## Features

| Screen | What it does |
|--------|--------------|
| **Week** | Total wins and projects touched, comparison with last week, a bar per day, and every win grouped by day with the day's mood. Star a win to mark it as a milestone. |
| **Add a win** | Capture what you finished in a few seconds: text, project, optional milestone. |
| **Close out today** | Pick how the day felt (good, so-so, tough), review today's wins and leave an optional note about what got stuck. |
| **Projects** | Each project with wins this week, last touched, and a 7-day activity chart. Add new projects, each with its own color. |

Also: light theme by default with a dark alternative, responsive layout (bottom sheets on phones, centered modals on wide screens), and single-user sign-in.

## Quick path

Requirements: a recent Node.js, [pnpm](https://pnpm.io) and a free [Supabase](https://supabase.com) account.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a Supabase project, then open **SQL Editor** and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

3. In Supabase, create your user under **Authentication → Users → Add user** (check **Auto Confirm User**), then disable **Allow new users to sign up** in the sign-in settings.

4. Copy the environment file and fill in the project URL and publishable key (**Connect** or **Settings → API Keys**):

   ```bash
   cp .env.example .env
   ```

5. Start the app:

   ```bash
   pnpm web
   ```

Expected result: a sign-in screen. After signing in you land on the Week screen.

> Use only the **publishable** key. The secret / service role key must never go in this project.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm start` | Start the Expo dev server |
| `pnpm web` | Run in the browser |
| `pnpm ios` / `pnpm android` | Run on a simulator or device |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint with the Expo config |

## How it is built

| Area | Choice |
|------|--------|
| App | Expo SDK 57, React Native, TypeScript (strict), Expo Router |
| Backend | Supabase: Postgres, Auth, row level security |
| Architecture | Hexagonal (ports and adapters), organized by feature |
| Design | Tokens and components documented in [`docs/design-system.md`](docs/design-system.md) |

Each feature (`wins`, `projects`, `closeout`, `auth`) has four layers. Dependencies point inward, so the domain never imports React or Supabase:

```
presentation → application → domain
infrastructure → application (implements its ports)
```

```
src/
├── app/            # Expo Router routes (thin)
├── features/       # wins, projects, closeout, auth
│   └── <feature>/{domain,application,infrastructure,presentation}
├── shared/         # theme tokens, UI atoms, helpers
└── composition/    # wires Supabase adapters into use cases
supabase/migrations # database schema and RLS policies
```

Swapping Supabase for another backend means writing new adapters only. Details in [`docs/architecture.md`](docs/architecture.md).

## Security

- Every table has row level security: a user can only read and write their own rows.
- Sign-up is disabled, so the account created in the dashboard is the only one.
- `.env` is git-ignored. Only the publishable key is used on the client.

## Notes

- Automated tests are out of scope for this first version. The hexagonal split keeps domain logic free of React and Supabase, so unit tests can be added later without refactoring.
- With pnpm 11, `expo install` fails. Add dependencies with `pnpm add` using the versions Expo recommends.

## Roadmap

- [ ] Sidebar navigation on desktop
- [ ] Real icon set and the DM Sans typeface
- [ ] Deploy the web build
- [ ] Edit and delete wins and projects
- [ ] Offline support
