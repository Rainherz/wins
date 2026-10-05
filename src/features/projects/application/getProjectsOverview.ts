import type { Clock, WinRepository } from '@/features/wins/application/ports';
import type { ProjectRepository } from './ports';
import { summarizeProject, type ProjectOverview } from './summarizeProject';

export type { ProjectOverview } from './summarizeProject';

export type ProjectsOverview = {
  /** Every project, finished ones included. */
  projects: ProjectOverview[];
  activeCount: number;
  archivedCount: number;
  winsThisWeek: number;
  totalWins: number;
};

export const createGetProjectsOverview =
  ({ wins, projects, clock }: { wins: WinRepository; projects: ProjectRepository; clock: Clock }) =>
  async (): Promise<ProjectsOverview> => {
    const now = clock.now();
    const [allWins, projectList] = await Promise.all([wins.listAll(), projects.list({ includeArchived: true })]);

    const overviews = projectList.map((project) =>
      summarizeProject(
        project,
        allWins.filter((win) => win.projectId === project.id),
        now,
      ),
    );

    // Most recently touched first; projects never touched go last.
    overviews.sort((a, b) => (b.lastTouched?.getTime() ?? 0) - (a.lastTouched?.getTime() ?? 0));

    return {
      projects: overviews,
      activeCount: overviews.filter((item) => !item.archived).length,
      archivedCount: overviews.filter((item) => item.archived).length,
      winsThisWeek: overviews.reduce((sum, item) => sum + item.winsThisWeek, 0),
      totalWins: allWins.length,
    };
  };
