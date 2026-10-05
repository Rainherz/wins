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
    if (!name) throw new InvalidProjectError('El nombre es obligatorio');
    if (name.length > MAX_PROJECT_NAME_LENGTH) {
      throw new InvalidProjectError(`El nombre admite como máximo ${MAX_PROJECT_NAME_LENGTH} caracteres`);
    }

    const existing = await projects.list();
    if (existing.some((project) => project.name.toLowerCase() === name.toLowerCase())) {
      throw new InvalidProjectError('Ya existe un proyecto con ese nombre');
    }

    return projects.add({
      name,
      description: input.description?.trim() ?? '',
      colorSlot: nextColorSlot(existing),
    });
  };
