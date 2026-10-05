import type { ProjectRepository } from '../application/ports';
import type { Project } from '../domain/project';

export class InMemoryProjectRepository implements ProjectRepository {
  constructor(private projects: Project[]) {}

  async add(project: Project) {
    this.projects = [...this.projects, project];
  }

  async list() {
    return this.projects;
  }
}
