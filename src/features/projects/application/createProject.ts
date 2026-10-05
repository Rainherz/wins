import { MAX_PROJECT_NAME_LENGTH, PROJECT_COLOR_SLOTS, type Project } from '../domain/project';
import type { ProjectRepository } from './ports';

export class InvalidProjectError extends Error {}

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
    const name = input.name.trim();
    if (!name) throw new InvalidProjectError('Name is required');
    if (name.length > MAX_PROJECT_NAME_LENGTH) {
      throw new InvalidProjectError(`Name must be at most ${MAX_PROJECT_NAME_LENGTH} characters`);
    }

    const existing = await projects.list();
    if (existing.some((project) => project.name.toLowerCase() === name.toLowerCase())) {
      throw new InvalidProjectError('A project with that name already exists');
    }

    const project: Project = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      description: input.description?.trim() ?? '',
      colorSlot: nextColorSlot(existing),
    };
    await projects.add(project);
    return project;
  };
