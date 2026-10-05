# Wins — Design System

Source of truth for visual decisions. Base: Figma prototype, plus three elements
adopted from the Stitch exploration (see "Adopted from Stitch").

Values below are estimated from screenshots. Treat them as the starting tokens and
adjust once measured in the Figma file.

## Principles

1. **Show progress, not pressure.** No guilt copy, no streak penalties.
2. **Data first.** Decoration never competes with the user's wins.
3. **No invented features.** UI copy only promises what the app does.
4. **One identity per project.** A project keeps the same color everywhere.
5. **Mobile-first, one codebase.** Same components on phone and desktop.

## Themes

Light is the default. Dark is an alternative toggled by the user.

## Color tokens

### Neutrals

| Token            | Light     | Dark      | Use                          |
|------------------|-----------|-----------|------------------------------|
| `bg`             | `#F7F5F1` | `#171614` | App background               |
| `surface`        | `#FFFFFF` | `#211F1C` | Cards, modals                |
| `surface-muted`  | `#EFECE6` | `#2A2723` | Inset areas, toggles         |
| `border`         | `#E6E1D8` | `#37332E` | Card and input borders       |
| `text`           | `#1F1E1B` | `#F3EFE8` | Primary text                 |
| `text-muted`     | `#6B665E` | `#A8A29A` | Secondary text, labels       |

### Accent

| Token           | Light     | Dark      | Use                                   |
|-----------------|-----------|-----------|---------------------------------------|
| `accent`        | `#EE8A3E` | `#F29A57` | Fills, icons, FAB, active bars        |
| `accent-strong` | `#B9500F` | `#F29A57` | Text links, primary button with white text |
| `accent-soft`   | `#FDEBDD` | `#3A281B` | Highlight backgrounds (milestones)    |

Contrast rules (WCAG AA, 4.5:1 for body text):
- White text on `accent` is about 2.5:1 and **fails**. Use `text` color on `accent`
  fills, or use `accent-strong` when the button needs white text (about 5:1).
- Orange text on `bg` must use `accent-strong`, never `accent`.

### Projects

Assigned from this palette in creation order. The color is stored with the project.

| Slot | Light     | Dark      |
|------|-----------|-----------|
| 1    | `#6F96BD` | `#86ABD0` |
| 2    | `#A084C4` | `#B59BD4` |
| 3    | `#7BA383` | `#92B99A` |
| 4    | `#C99A5B` | `#D8AE72` |
| 5    | `#C47F8F` | `#D597A5` |

### Mood

| Mood      | Light     | Dark      |
|-----------|-----------|-----------|
| `good`    | `#6E9B7E` | `#86B396` |
| `so-so`   | `#A89560` | `#C1AE78` |
| `tough`   | `#9A7A76` | `#B7938E` |

Mood is always shown as an icon plus a text label. Never color alone.

## Typography

Family: **DM Sans** (the Figma output renders close to it; confirm in the file).
Fallback: system sans-serif.

| Role          | Size / Line | Weight | Use                        |
|---------------|-------------|--------|----------------------------|
| `display`     | 40 / 44     | 500    | Screen titles ("This week")|
| `title`       | 24 / 30     | 500    | Section titles             |
| `stat`        | 28 / 32     | 600    | "12 wins" numbers          |
| `body`        | 16 / 24     | 400    | Win titles, inputs         |
| `body-small`  | 14 / 20     | 400    | Secondary text             |
| `label`       | 12 / 16     | 600    | Uppercase eyebrow, tracked +0.08em |

On mobile `display` drops to 32 / 36.

## Spacing, radius, elevation

- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48. Base unit 4.
- Radius: `sm` 8 (chips, inputs), `md` 12 (rows), `lg` 20 (cards, modals), `full` (pills, FAB uses `lg`).
- Elevation: cards use a 1px `border` and no shadow. Modals and FAB use one soft
  shadow (`0 8px 24px` at 12% `text`).
- Touch targets: minimum 44x44 px (the star toggle needs a larger hit area than its icon).

## Layout and responsiveness

| Breakpoint | Navigation                     | Content                    |
|------------|--------------------------------|----------------------------|
| < 768      | Bottom tab bar (2 tabs) + FAB  | Single column, 16 px gutter|
| 768–1023   | Bottom tab bar + FAB           | Centered, max 640          |
| >= 1024    | Left sidebar, 240 px           | Centered, max 720          |

- The FAB must not cover content: reserve bottom padding equal to tab bar + FAB height.
- Modals become bottom sheets under 768 px.

## Navigation

Two destinations only: **Week** and **Projects**. "Close out today" is an action
(link on Week), not a tab. No Insights screen in the MVP.

## Components

| Component          | Notes                                                                 |
|--------------------|-----------------------------------------------------------------------|
| `MomentumCard`     | Total wins, project count, delta vs last week, 7 bars **with counts**.|
| `DayHeader`        | Weekday + date, win count, mood icon. Future days show "Still open".  |
| `WinRow`           | Project dot, title, project name, milestone star. Milestone = `accent-soft` background, 3px `accent` left bar and a "Milestone" chip. |
| `EmptyDay`         | One neutral sentence and an "Add" link. No guilt wording.             |
| `ProjectCard`      | Color avatar, name, description, wins this week, "last touched", 7-day mini bars. |
| `AddWinSheet`      | Text area, custom project select, milestone toggle. Save disabled until text exists. |
| `CloseOutSheet`    | Mood picker (3 options), today's wins, optional "what got stuck" note, "Close the day" disabled until a mood is picked. |
| `ProjectSelect`    | **Custom** component. The native browser select is not acceptable.    |
| `Fab`              | Opens `AddWinSheet`.                                                  |
| `ThemeToggle`      | Light/dark switch, persists the choice.                               |

Atomic levels: atoms (Button, Chip, Icon, Star, Dot), molecules (WinRow, DayHeader,
MoodOption), organisms (MomentumCard, WeekList, ProjectCard, sheets).

## Component states

Every interactive component defines: default, hover (web), pressed, focus-visible
(2px `accent-strong` ring), disabled, and error where it applies.

## Adopted from Stitch

1. Visible **Milestone** chip on starred wins.
2. Per-project **7-day mini bars** and "last touched" on the Projects screen.
3. Per-day **win counts** and a **Copy summary** action on the weekly card.

## Content rules

- No motivational quotes, no stock photos, no decorative banners.
- No claims about features that do not exist (encryption, sync, vaults).
- Tone: calm and neutral. Missing days are never framed as failure.
- All UI copy is English for now. Strings live in one place to allow translation later.

## Known issues to fix in the Figma file

- Mobile: FAB overlaps content and the tab bar covers the last row.
- Sample data: Saturday and Sunday show wins while labelled "Still open"; Wednesday
  shows a "Tough" mood with nothing logged.
- Weekly bars have no numeric labels.
