import type { WinRepository } from '@/features/wins/application/ports';
import type { ProjectRepository } from './ports';

/** Deletes the project together with all of its wins. Returns how many wins went with it. */
export const createDeleteProject =
  ({ projects, wins }: { projects: ProjectRepository; wins: WinRepository }) =>
  async (id: string): Promise<number> => {
    const removed = await wins.removeByProject(id);
    await projects.remove(id);
    return removed;
  };
