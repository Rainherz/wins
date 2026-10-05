import type { ProjectRepository } from '@/features/projects/application/ports';
import type { GithubRepo } from '../domain/githubRepo';
import { matchRepoToProject } from '../domain/repoMatching';
import { GithubNotConnectedError } from './getImportSuggestions';
import type { GithubConnectionRepository, GithubPort } from './ports';

export type RepoSuggestion = GithubRepo & {
  /** Name of the project this repository maps to (existing or to be created). */
  projectName: string;
  /** linked: already a project. link: an unlinked project with that name will be linked. new: a project will be created. */
  match: 'linked' | 'link' | 'new';
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

    return {
      login: connection.login,
      repos: repos.map((repo): RepoSuggestion => {
        const match = matchRepoToProject(repo.fullName, projectList);
        return {
          ...repo,
          projectName: match.kind === 'new' ? match.name : match.project.name,
          match: match.kind,
        };
      }),
    };
  };
