import type { ProjectRepository } from './ports';

export const createListProjects = (projects: ProjectRepository) => () => projects.list();
