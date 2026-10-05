import { addDays, daysAgo, startOfWeek } from '@/shared/lib/dates';

import type { Win } from '@/features/wins/domain/win';
import type { Project } from '../domain/project';

export type ProjectOverview = {
  project: Project;
  winsThisWeek: number;
  totalWins: number;
  lastTouched?: Date;
  archived: boolean;
  /** Whole days since the last win (0 = today). Undefined if the project has no wins. */
  daysSinceTouched?: number;
  /** Wins per day for the last 7 days, oldest first. */
  last7Days: number[];
};

/** Numbers for one project, computed from its own wins. */
export function summarizeProject(project: Project, own: Win[], now: Date): ProjectOverview {
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);

  const lastTouched = own.reduce<Date | undefined>(
    (latest, win) => (!latest || win.achievedAt > latest ? win.achievedAt : latest),
    undefined,
  );

  return {
    project,
    winsThisWeek: own.filter((win) => win.achievedAt >= weekStart && win.achievedAt < weekEnd).length,
    totalWins: own.length,
    lastTouched,
    archived: project.archivedAt !== undefined,
    daysSinceTouched: lastTouched ? Math.max(0, daysAgo(lastTouched, now)) : undefined,
    last7Days: Array.from({ length: 7 }, (_, index) => own.filter((win) => daysAgo(win.achievedAt, now) === 6 - index).length),
  };
}
