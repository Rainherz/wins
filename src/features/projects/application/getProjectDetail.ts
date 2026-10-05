import type { Clock, WinRepository } from '@/features/wins/application/ports';
import type { Win } from '@/features/wins/domain/win';
import type { ProjectRepository } from './ports';
import { summarizeProject, type ProjectOverview } from './summarizeProject';

export type ProjectDetail = {
  overview: ProjectOverview;
  /** Newest first. */
  wins: Win[];
  milestoneCount: number;
};

export const createGetProjectDetail =
  ({ wins, projects, clock }: { wins: WinRepository; projects: ProjectRepository; clock: Clock }) =>
  async (id: string): Promise<ProjectDetail> => {
    const [project, own] = await Promise.all([
      projects.list({ includeArchived: true }).then((list) => list.find((item) => item.id === id)),
      wins.listByProject(id),
    ]);
    if (!project) throw new Error('No se encontró el proyecto.');

    return {
      overview: summarizeProject(project, own, clock.now()),
      wins: own,
      milestoneCount: own.filter((win) => win.isMilestone).length,
    };
  };
