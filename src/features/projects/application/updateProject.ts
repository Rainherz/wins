import type { ProjectRepository } from './ports';
import { validateProjectName } from './projectRules';

export type UpdateProjectInput = {
  id: string;
  name: string;
  description: string;
};

export const createUpdateProject =
  (projects: ProjectRepository) =>
  async ({ id, name, description }: UpdateProjectInput): Promise<void> => {
    const others = (await projects.list({ includeArchived: true })).filter((project) => project.id !== id);
    await projects.update(id, { name: validateProjectName(name, others), description: description.trim() });
  };
