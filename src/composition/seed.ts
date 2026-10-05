import type { DayClosure } from '@/features/closeout/domain/dayClosure';
import type { Project } from '@/features/projects/domain/project';
import type { Win } from '@/features/wins/domain/win';
import { addDays, dayKey, startOfWeek } from '@/shared/lib/dates';

export const seedProjects: Project[] = [
  { id: 'atlas', name: 'Atlas', description: 'Team platform', colorSlot: 0 },
  { id: 'sidekick', name: 'Sidekick', description: 'Developer tools', colorSlot: 1 },
  { id: 'personal', name: 'Personal', description: 'Learning & craft', colorSlot: 2 },
];

type SeedWin = [dayOffset: number, hour: number, projectId: string, title: string, milestone?: boolean];

const rows: SeedWin[] = [
  // Previous week
  [-6, 11, 'atlas', 'Reviewed the data model'],
  [-5, 15, 'sidekick', 'Drafted the command palette spec'],
  [-4, 10, 'atlas', 'Cleaned up CI caching'],
  [-3, 16, 'personal', 'Read two chapters on system design'],
  [-2, 12, 'sidekick', 'Fixed a focus trap bug'],
  [-1, 17, 'atlas', 'Documented the release process'],
  [-7, 14, 'personal', 'Planned the week'],
  // Current week
  [0, 11, 'atlas', 'Shipped the new onboarding flow', true],
  [0, 16, 'atlas', 'Fixed the flaky auth test'],
  [1, 10, 'sidekick', 'Mapped the command palette states'],
  [1, 14, 'sidekick', "Reviewed Priya's search PR"],
  [1, 17, 'atlas', 'Simplified the release checklist'],
  [3, 11, 'sidekick', 'Released keyboard shortcuts', true],
  [3, 15, 'atlas', 'Documented the API error states'],
  [4, 10, 'personal', 'Built the weekly reflection view'],
  [4, 14, 'atlas', 'Paired on query caching'],
  [4, 17, 'sidekick', 'Cleared the accessibility audit'],
  [5, 11, 'personal', 'Finished a chapter of Designing Data-Intensive Apps'],
];

/** Sample data anchored to the current week so the app always looks populated. */
export function buildSeed(now: Date) {
  const weekStart = startOfWeek(now);

  const wins: Win[] = rows.map(([offset, hour, projectId, title, milestone], index) => {
    const achievedAt = addDays(weekStart, offset);
    achievedAt.setHours(hour, 0, 0, 0);
    return { id: `seed-${index}`, projectId, title, isMilestone: milestone ?? false, achievedAt };
  });

  const closures: DayClosure[] = [
    { day: dayKey(addDays(weekStart, 0)), mood: 'good' },
    { day: dayKey(addDays(weekStart, 1)), mood: 'so-so' },
    { day: dayKey(addDays(weekStart, 2)), mood: 'tough' },
    { day: dayKey(addDays(weekStart, 3)), mood: 'good' },
  ];

  return { wins, projects: seedProjects, closures };
}
