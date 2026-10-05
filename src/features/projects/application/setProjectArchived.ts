import type { Clock } from '@/features/wins/application/ports';
import type { ProjectRepository } from './ports';

/** Finishing a project keeps its history; reopening it brings it back to the active list. */
export const createSetProjectArchived =
  ({ projects, clock }: { projects: ProjectRepository; clock: Clock }) =>
  (id: string, archived: boolean) =>
    projects.update(id, { archivedAt: archived ? clock.now() : null });
