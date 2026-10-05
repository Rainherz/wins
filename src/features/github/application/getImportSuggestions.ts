import type { ProjectRepository } from '@/features/projects/application/ports';
import type { WinRepository } from '@/features/wins/application/ports';
import type { GithubWork } from '../domain/githubWork';
import { matchRepoToProject } from '../domain/repoMatching';
import type { GithubConnectionRepository, GithubPort } from './ports';

export class GithubNotConnectedError extends Error {}

export type ImportSuggestion = GithubWork & {
  projectName: string;
  /** False when importing will create a new project for this repository. */
  projectExists: boolean;
};

type Deps = {
  github: GithubPort;
  connections: GithubConnectionRepository;
  wins: WinRepository;
  projects: ProjectRepository;
};

export const createGetImportSuggestions =
  ({ github, connections, wins, projects }: Deps) =>
  async (from: Date, to: Date): Promise<{ login: string; suggestions: ImportSuggestion[] }> => {
    const connection = await connections.get();
    if (!connection) throw new GithubNotConnectedError();

    const [work, importedIds, projectList] = await Promise.all([
      github.listDoneWork(connection, from),
      wins.listExternalIds(),
      projects.list({ includeArchived: true }),
    ]);

    const imported = new Set(importedIds);

    const suggestions = work
      .filter((item) => item.doneAt >= from && item.doneAt < to && !imported.has(item.externalId))
      .sort((a, b) => b.doneAt.getTime() - a.doneAt.getTime())
      .map((item): ImportSuggestion => {
        const match = matchRepoToProject(item.repo, projectList);
        return {
          ...item,
          projectName: match.kind === 'new' ? match.name : match.project.name,
          projectExists: match.kind !== 'new',
        };
      });

    return { login: connection.login, suggestions };
  };
