import type { Project } from '../domain/project';

export type NewProject = Omit<Project, 'id'>;

export interface ProjectRepository {
  /** Persists the project and returns it with its generated id. */
  add(project: NewProject): Promise<Project>;
  list(): Promise<Project[]>;
}
