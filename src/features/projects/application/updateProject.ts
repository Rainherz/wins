import type { ProjectRepository } from './ports';
import { normalizeGithubRepo, validateProjectName } from './projectRules';

export type UpdateProjectInput = {
  id: string;
  name: string;
  description: string;
  /** Empty or undefined unlinks the repository. */
  githubRepo?: string;
};

export const createUpdateProject =
  (projects: ProjectRepository) =>
  async ({ id, name, description, githubRepo }: UpdateProjectInput): Promise<void> => {
    const others = (await projects.list({ includeArchived: true })).filter((project) => project.id !== id);
    await projects.update(id, {
      name: validateProjectName(name, others),
      description: description.trim(),
      githubRepo: normalizeGithubRepo(githubRepo) ?? null,
    });
  };
