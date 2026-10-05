import type { CreateProjectInput } from '@/features/projects/application/createProject';
import type { ProjectRepository } from '@/features/projects/application/ports';
import type { Project } from '@/features/projects/domain/project';
import { matchRepoToProject } from '../domain/repoMatching';
import type { RepoSuggestion } from './getRepoSuggestions';

type Deps = {
  projects: ProjectRepository;
  createProject: (input: CreateProjectInput) => Promise<Project>;
};

/**
 * Creates a project for each selected repository, or links it to the unlinked project of the same name.
 * Returns how many repositories were processed.
 */
export const createImportRepos =
  ({ projects, createProject }: Deps) =>
  async (selected: RepoSuggestion[]): Promise<number> => {
    let known = await projects.list({ includeArchived: true });

    // Sequential on purpose: each new project picks the next free color and later names must see earlier ones.
    for (const repo of selected) {
      const match = matchRepoToProject(repo.fullName, known);
      if (match.kind === 'link') {
        await projects.update(match.project.id, { githubRepo: repo.fullName });
        known = known.map((project) => (project.id === match.project.id ? { ...project, githubRepo: repo.fullName } : project));
      } else if (match.kind === 'new') {
        const created = await createProject({
          name: match.name,
          description: repo.description ?? repo.fullName,
          githubRepo: repo.fullName,
        });
        known = [...known, created];
      }
    }

    return selected.length;
  };
