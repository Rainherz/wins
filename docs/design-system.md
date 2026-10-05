# Wins — Design System

Source of truth for the visual decisions, matching what is implemented in
`src/shared/theme/tokens.ts` and `src/shared/ui/`. Base: the Figma prototype, with the
Stitch ideas that were adopted (milestone chip, per-project activity bars, per-day counts).

## Direction

A warm paper journal. Cream paper, ink text, orange used like a pen: only for the one main
action, the current selection and the data that matters. Serif for the few big moments,
one clean sans for everything you operate. The app is a tool people open every day, so
familiarity and scanability win over decoration.

## Principles

1. **Show progress, not pressure.** No guilt copy, no streak penalties.
2. **Data first.** Decoration never competes with the user's wins.
3. **No invented features.** UI copy only promises what the app does.
4. **One identity per project.** A project keeps the same color everywhere.
5. **Mobile-first, one codebase.** Same components on phone and desktop; navigation is the only structural change.

## Themes

Light is the default, dark is an alternative toggled by the user. Both are defined together in `tokens.ts`.

## Color tokens

| Token            | Light     | Dark      | Use                                         |
|------------------|-----------|-----------|---------------------------------------------|
| `bg`             | `#F7F5F1` | `#171614` | App background (paper)                      |
| `sidebar`        | `#F0ECE4` | `#1D1B18` | Second neutral layer: sidebar, tab bar      |
| `surface`        | `#FFFFFF` | `#211F1C` | Cards, sheets                               |
| `surfaceMuted`   | `#EFECE6` | `#2A2723` | Inset areas, hover, bar tracks              |
| `border`         | `#E6E1D8` | `#37332E` | Hairlines                                   |
| `text`           | `#1F1E1B` | `#F3EFE8` | Primary text                                |
| `textMuted`      | `#6B665E` | `#A8A29A` | Secondary text                              |
| `accent`         | `#EE8A3E` | `#F29A57` | Fills and icons                             |
| `accentStrong`   | `#B9500F` | `#F29A57` | Text and links on the page background       |
| `accentSoft`     | `#FCEBDC` | `#3A281B` | Highlight backgrounds (milestones, selection) |
| `onAccent`       | `#1F1E1B` | `#1F1E1B` | Text and icons on `accent`                  |
| `danger`         | `#B3261E` | `#F2A19B` | Destructive actions and errors              |
| `dangerSoft`     | `#FCE8E6` | `#3B1F1D` | Error notice background                     |

Contrast: white text on `accent` is about 2.5:1 and fails, so anything on `accent` uses
`onAccent` (dark ink, about 6.6:1) and orange text on the page uses `accentStrong`.

**Projects** take a palette slot (5 colors) in creation order and keep it:
`#6F96BD`, `#A084C4`, `#7BA383`, `#C99A5B`, `#C47F8F` (dark variants in `tokens.ts`).

**Mood** is always an icon plus a text label, never color alone: good `#4F8A63`,
so-so `#8C7A3B`, tough `#9A6B66`.

## Typography

Two families, loaded with `expo-font`:

- **DM Serif Display**: screen titles (`display`, 40 / 34 on phones) and the big week figure (`hero`, 34).
- **DM Sans** 400 / 500 / 600 / 700: everything else.

| Role        | Size / Line | Weight | Use                          |
|-------------|-------------|--------|------------------------------|
| `display`   | 40 / 44     | serif  | Screen titles                |
| `hero`      | 34 / 38     | serif  | "11 logros", project counts  |
| `title`     | 22 / 28     | 600    | Sheet titles                 |
| `heading`   | 18 / 24     | 600    | Day headers, project names   |
| `body`      | 16 / 24     | 400    | Win titles, inputs           |
| `bodySmall` | 14 / 20     | 400–600| Secondary text, buttons      |
| `caption`   | 12 / 16     | 500    | Metadata, chart labels       |

No eyebrow labels above headings. Custom fonts ship one file per weight, so always render
text through `@/shared/ui/Text`, which maps `fontWeight` to the right DM Sans file.

## Depth, spacing, radius

- Cards and sheets use soft layered shadows (`shadowCard`, `shadowRaised`): a small offset plus a wide blur, never a hard or zero-offset shadow. Hairlines separate rows inside a card.
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48.
- Radius: 8, 12 (controls), 16 (cards), 24 (hero cards, sheets), full (chips).
- Touch targets: minimum 44x44.

## Icons

One family: Material Community Icons (outline style), through `@/shared/ui/Icon`. No text
glyphs or emoji as icons.

## Layout and navigation

| Width     | Navigation                                      | Content                      |
|-----------|-------------------------------------------------|------------------------------|
| < 1024    | Bottom bar: Semana, raised center "+", Proyectos| Single column, 16 px gutter  |
| >= 1024   | Left sidebar (264 px): brand, "Agregar logro", Semana, Proyectos, account, theme, sign out | Centered column, max 720 |

- Adding a win is one entry point (`CaptureProvider`), reachable from the center "+" on phones and the sidebar button on desktop.
- Sheets are bottom sheets under 768 px and centered dialogs above.
- Days are listed most recent first; future days collapse into one "Por venir" line.

## Components

| Component        | Notes |
|------------------|-------|
| `Button`         | `primary` (the one main action, accent fill), `secondary` (outlined), `quiet` (text). Optional icon, `block`, `flush`. |
| `IconButton`     | 44x44 target around any icon; hover and pressed states. |
| `TextField`      | Label, optional leading icon and trailing control, focus ring in accent. |
| `Sheet` / `SheetHeader` | Container and title row shared by every sheet. |
| `ConfirmSheet` | Asks before a destructive action (`Alert.alert` does nothing on the web). Danger button, cancel next to it. |
| `ErrorNotice` | An error the user can act on: what happened plus Retry or Dismiss. Used for failed loads and actions. |
| `ChipSelect` / `Segmented` | Single choice. Chips wrap (days, projects); the segmented control stays on one line (filters). |
| `WeekPulse`      | Total, project count, delta vs last week, and a 7-day strip with counts, bars and mood icons. Bars grow in once on load (the only authored motion). |
| `DaySection`     | Day header (weekday, date, "Hoy", count, mood chip) plus the day's wins in one card with hairlines, or a calm empty state. |
| `WinRow`         | Project dot, title, project, time, GitHub link when imported, milestone star. Milestone rows get the soft accent background and a filled star. |
| `PendingWorkPanel` | Open issues and PRs of a project's GitHub repository, fetched live: PR and issue icons, draft state, labels, age, and a clear way out for every failure (not connected, rejected token, no access). |
| `ProjectCard`    | Colored avatar, name, description, "Activo hace N días", this-week count and 7-day bars. |
| `ProjectSelect`  | Chips with the project color. Replaces the native select. |
| `AppNav`         | Sidebar or bottom bar depending on width. |

Interactive components define default, hover (web), pressed, focus-visible, disabled and,
where it applies, error. Focus rings and text selection are themed in `src/global.css`.

## Content rules

- No motivational quotes, stock photos or decorative banners.
- No claims about features that do not exist.
- Tone: calm and neutral. Missing days are never framed as failure.
- UI copy is neutral Spanish (second person singular, no regional slang or voseo).
  Glossary: win = logro, milestone = hito, close out the day = cerrar el día, week = semana.
  Strings are inline in components for now. If a second language is ever needed, move
  them into a single catalog first.
