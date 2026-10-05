import { MAX_PROJECT_NAME_LENGTH, type Project } from '../domain/project';

export class InvalidProjectError extends Error {}

/** Trims the name and checks length and uniqueness against every other project, finished ones included. */
export const validateProjectName = (raw: string, others: Project[]) => {
  const name = raw.trim();
  if (!name) throw new InvalidProjectError('El nombre es obligatorio');
  if (name.length > MAX_PROJECT_NAME_LENGTH) {
    throw new InvalidProjectError(`El nombre admite como máximo ${MAX_PROJECT_NAME_LENGTH} caracteres`);
  }
  if (others.some((project) => project.name.toLowerCase() === name.toLowerCase())) {
    throw new InvalidProjectError('Ya existe un proyecto con ese nombre');
  }
  return name;
};
