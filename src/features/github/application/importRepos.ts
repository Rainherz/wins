import type { CreateProjectInput } from '@/features/projects/application/createProject';
import type { Project } from '@/features/projects/domain/project';
import type { RepoSuggestion } from './getRepoSuggestions';

/** Creates one project per selected repository. Returns how many were created. */
export const createImportRepos =
  (createProject: (input: CreateProjectInput) => Promise<Project>) =>
  async (selected: RepoSuggestion[]): Promise<number> => {
    // Sequential on purpose: each new project picks the next free color.
    for (const repo of selected) {
      await createProject({ name: repo.projectName, description: repo.description ?? repo.fullName });
    }
    return selected.length;
  };
