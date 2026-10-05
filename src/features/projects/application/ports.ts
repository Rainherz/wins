import type { Project } from '../domain/project';

export type NewProject = Omit<Project, 'id' | 'archivedAt'>;
/** `archivedAt: null` reopens a finished project. */
export type ProjectPatch = Partial<Pick<Project, 'name' | 'description'>> & { archivedAt?: Date | null };

export interface ProjectRepository {
  /** Persists the project and returns it with its generated id. */
  add(project: NewProject): Promise<Project>;
  update(id: string, patch: ProjectPatch): Promise<void>;
  /** Fails while the project still has wins. Delete those first. */
  remove(id: string): Promise<void>;
  /** Active projects only, unless `includeArchived` is set. */
  list(options?: { includeArchived?: boolean }): Promise<Project[]>;
}
