import { PROJECT_COLOR_SLOTS, type Project } from '../domain/project';
import type { ProjectRepository } from './ports';
import { validateProjectName } from './projectRules';

export { InvalidProjectError } from './projectRules';

export type CreateProjectInput = {
  name: string;
  description?: string;
};

/** Smallest palette slot not in use, so colors stay distinct for as long as possible. */
const nextColorSlot = (projects: Project[]) => {
  const used = new Set(projects.map((project) => project.colorSlot));
  for (let slot = 0; slot < PROJECT_COLOR_SLOTS; slot++) {
    if (!used.has(slot)) return slot;
  }
  return projects.length % PROJECT_COLOR_SLOTS;
};

export const createCreateProject =
  (projects: ProjectRepository) =>
  async (input: CreateProjectInput): Promise<Project> => {
    const existing = await projects.list({ includeArchived: true });
    const name = validateProjectName(input.name, existing);

    return projects.add({
      name,
      description: input.description?.trim() ?? '',
      colorSlot: nextColorSlot(existing),
    });
  };
