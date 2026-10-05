import type { ProjectRepository } from '@/features/projects/application/ports';
import type { GithubRepo } from '../domain/githubRepo';
import { projectNameFromRepo } from '../domain/githubWork';
import { GithubNotConnectedError } from './getImportSuggestions';
import type { GithubConnectionRepository, GithubPort } from './ports';

export type RepoSuggestion = GithubRepo & {
  projectName: string;
  /** True when a project with that name already exists, so it cannot be imported again. */
  alreadyProject: boolean;
};

type Deps = {
  github: GithubPort;
  connections: GithubConnectionRepository;
  projects: ProjectRepository;
};

export const createGetRepoSuggestions =
  ({ github, connections, projects }: Deps) =>
  async (): Promise<{ login: string; repos: RepoSuggestion[] }> => {
    const connection = await connections.get();
    if (!connection) throw new GithubNotConnectedError();

    const [repos, projectList] = await Promise.all([github.listRepos(connection), projects.list({ includeArchived: true })]);
    const projectNames = new Set(projectList.map((project) => project.name.toLowerCase()));

    return {
      login: connection.login,
      repos: repos.map((repo): RepoSuggestion => {
        const projectName = projectNameFromRepo(repo.fullName);
        return { ...repo, projectName, alreadyProject: projectNames.has(projectName.toLowerCase()) };
      }),
    };
  };
