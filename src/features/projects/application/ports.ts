import type { Project } from '../domain/project';

export interface ProjectRepository {
  add(project: Project): Promise<void>;
  list(): Promise<Project[]>;
}
