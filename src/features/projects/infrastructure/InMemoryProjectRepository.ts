import type { ProjectRepository } from '../application/ports';
import type { Project } from '../domain/project';

export class InMemoryProjectRepository implements ProjectRepository {
  constructor(private readonly projects: Project[]) {}

  async list() {
    return this.projects;
  }
}
