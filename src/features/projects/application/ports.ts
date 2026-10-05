import type { Project } from '../domain/project';

export interface ProjectRepository {
  list(): Promise<Project[]>;
}
