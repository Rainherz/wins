import { addDays, daysAgo, startOfWeek } from '@/shared/lib/dates';

import type { Clock, WinRepository } from '@/features/wins/application/ports';
import type { Project } from '../domain/project';
import type { ProjectRepository } from './ports';

export type ProjectOverview = {
  project: Project;
  winsThisWeek: number;
  totalWins: number;
  lastTouched?: Date;
  /** Whole days since the last win (0 = today). Undefined if the project has no wins. */
  daysSinceTouched?: number;
  /** Wins per day for the last 7 days, oldest first. */
  last7Days: number[];
};

export type ProjectsOverview = {
  projects: ProjectOverview[];
  winsThisWeek: number;
  totalWins: number;
};

export const createGetProjectsOverview =
  ({ wins, projects, clock }: { wins: WinRepository; projects: ProjectRepository; clock: Clock }) =>
  async (): Promise<ProjectsOverview> => {
    const now = clock.now();
    const weekStart = startOfWeek(now);
    const weekEnd = addDays(weekStart, 7);

    const [allWins, projectList] = await Promise.all([wins.listAll(), projects.list()]);

    const overviews: ProjectOverview[] = projectList.map((project) => {
      const own = allWins.filter((win) => win.projectId === project.id);
      const last7Days = Array.from({ length: 7 }, (_, index) =>
        own.filter((win) => daysAgo(win.achievedAt, now) === 6 - index).length,
      );
      const lastTouched = own.reduce<Date | undefined>(
        (latest, win) => (!latest || win.achievedAt > latest ? win.achievedAt : latest),
        undefined,
      );
      return {
        project,
        winsThisWeek: own.filter((win) => win.achievedAt >= weekStart && win.achievedAt < weekEnd).length,
        totalWins: own.length,
        lastTouched,
        daysSinceTouched: lastTouched ? daysAgo(lastTouched, now) : undefined,
        last7Days,
      };
    });

    // Most recently touched first; projects never touched go last.
    overviews.sort((a, b) => (b.lastTouched?.getTime() ?? 0) - (a.lastTouched?.getTime() ?? 0));

    return {
      projects: overviews,
      winsThisWeek: overviews.reduce((sum, item) => sum + item.winsThisWeek, 0),
      totalWins: allWins.length,
    };
  };
