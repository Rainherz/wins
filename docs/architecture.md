# Wins — Architecture

Hexagonal (ports and adapters), screaming structure by feature, TDD for domain and
application layers. Backend: Supabase. Client: React Native with Expo, targeting
iOS, Android and web from one codebase.

## Stack

| Concern            | Choice                                   | Notes                                     |
|--------------------|------------------------------------------|-------------------------------------------|
| Framework          | Expo (React Native) + TypeScript strict  | Web via react-native-web. Pin SDK at init.|
| Routing            | expo-router                              | Routes stay thin, no logic.               |
| Backend            | Supabase (Postgres, Auth, RLS)           | Reached only through adapters.            |
| Server state       | TanStack Query                           | Wraps use cases, handles cache/loading.   |
| Tests              | Jest (jest-expo) + React Native Testing Library | Domain tests are plain Jest, no RN.|
| Styling            | Theme tokens from `docs/design-system.md`| One `theme` module, light and dark.       |

## Layers and dependency rule

```
presentation  ->  application  ->  domain
infrastructure ->  application (implements ports)
```

- **domain**: entities, value objects, pure functions. No imports from React,
  Expo or Supabase.
- **application**: use cases and **ports** (interfaces). Depends only on domain.
- **infrastructure**: adapters that implement ports (Supabase repositories, auth).
- **presentation**: screens, components, hooks. Calls use cases, never Supabase.
- Composition root wires adapters into use cases (`src/app/container.ts`).

Dependencies point inward. Swapping Supabase for a custom API means writing new
adapters only.

## Folder structure

```
wins/
├── app/                         # expo-router routes (thin)
│   ├── _layout.tsx
│   ├── (tabs)/week.tsx
│   ├── (tabs)/projects.tsx
│   └── sign-in.tsx
├── src/
│   ├── features/
│   │   ├── wins/
│   │   │   ├── domain/          # Win, WeekRange, weekly aggregation
│   │   │   ├── application/     # LogWin, ToggleMilestone, GetWeekSummary, ports
│   │   │   ├── infrastructure/  # SupabaseWinRepository
│   │   │   └── presentation/    # WeekScreen, MomentumCard, DayHeader, WinRow, AddWinSheet
│   │   ├── projects/
│   │   │   ├── domain/          # Project, ProjectColor
│   │   │   ├── application/     # CreateProject, ListProjectsOverview, ports
│   │   │   ├── infrastructure/
│   │   │   └── presentation/    # ProjectsScreen, ProjectCard, ProjectSelect
│   │   ├── closeout/
│   │   │   ├── domain/          # DayClosure, Mood
│   │   │   ├── application/     # CloseDay, ports
│   │   │   ├── infrastructure/
│   │   │   └── presentation/    # CloseOutSheet, MoodOption
│   │   └── auth/
│   │       ├── domain/
│   │       ├── application/     # SignIn, SignOut, GetSession, AuthPort
│   │       ├── infrastructure/  # SupabaseAuthAdapter
│   │       └── presentation/
│   ├── shared/
│   │   ├── ui/                  # atoms and molecules (Button, Chip, Star, Dot, Fab)
│   │   ├── theme/               # tokens, light/dark, useTheme
│   │   └── lib/                 # date helpers, result type
│   └── app/container.ts         # composition root
└── supabase/
    └── migrations/              # SQL schema + RLS policies, versioned
```

## Domain model

| Entity        | Fields                                                                 | Rules                                           |
|---------------|------------------------------------------------------------------------|-------------------------------------------------|
| `Win`         | id, projectId, title, isMilestone, achievedAt                          | Title required, trimmed, max 280 chars.         |
| `Project`     | id, name, description, colorSlot (1–5), archivedAt                     | Name unique per user. Color slot fixed at creation. |
| `DayClosure`  | date, mood (`good` / `so-so` / `tough`), stuckNote                     | One closure per user per day.                   |

Derived (pure functions, no storage): week range (Mon–Sun), wins per day, delta vs
previous week, "last touched" per project, 7-day project bars, weekly summary text
for "Copy summary".

## Ports (application layer)

- `WinRepository`: `add`, `setMilestone`, `listByRange`, `countByRange`
- `ProjectRepository`: `create`, `list`, `archive`
- `DayClosureRepository`: `upsert`, `listByRange`
- `AuthPort`: `signIn`, `signOut`, `currentSession`, `onSessionChange`
- `Clock`: `now()` so time-dependent logic is testable

## Use cases (MVP)

`LogWin`, `ToggleMilestone`, `GetWeekSummary`, `CloseDay`, `CreateProject`,
`ListProjectsOverview`, `BuildWeeklySummaryText`, `SignIn`, `SignOut`.

## Supabase schema

All tables have `user_id uuid not null default auth.uid()` and **row level security
enabled**. Policies allow `select/insert/update/delete` only where
`(select auth.uid()) = user_id`.

```
projects(id, user_id, name, description, color_slot, archived_at, created_at)
wins(id, user_id, project_id -> projects, title, is_milestone, achieved_at, created_at)
day_closures(user_id, day date, mood, stuck_note, created_at)  -- unique (user_id, day)
```

- The publishable key is shipped in the app. Security comes from RLS, not from
  hiding the key. The service role key never enters the client.
- Client config lives in `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, never committed (`.env` in `.gitignore`).
- Session persistence uses a storage adapter with `autoRefreshToken: true`,
  `persistSession: true`, `detectSessionInUrl: false`.

## Testing strategy (strict TDD)

1. **Domain**: pure Jest tests written first (week range, aggregation, rules).
2. **Application**: use cases tested with in-memory fakes of the ports.
3. **Infrastructure**: adapter tests against a Supabase local stack or mocked client.
4. **Presentation**: Testing Library for key flows (add a win, close the day).

Red, green, refactor. No use case is written without a failing test first.

## Out of MVP

Offline mode and sync, push notifications, insights/analytics, project detail
screen, social or shared projects, sign-up, password reset, profile.

## Auth (single-user)

The app has exactly one user: the owner. Authentication still exists because the
publishable key ships inside the client; RLS plus a signed-in session is what keeps
the data private.

- Method: **email and password**.
- The user is created once from the Supabase dashboard. **"Allow new users to sign
  up" is disabled**, so nobody else can register.
- No sign-up, password reset or profile screens. Only `SignIn` and `SignOut`.
- The session persists on the device, so sign-in happens once per device.
- RLS policies stay as defined (`auth.uid() = user_id`). They are cheap and keep the
  model correct if the scope ever grows.

## Open decisions

- Session storage adapter (AsyncStorage vs expo-sqlite localStorage). Check current
  Supabase and Expo guidance when scaffolding.
- Expo SDK version to pin.
