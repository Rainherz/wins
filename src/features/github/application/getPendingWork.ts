import { GithubNotConnectedError } from './getImportSuggestions';
import type { GithubConnectionRepository, GithubPort } from './ports';

export const createGetPendingWork =
  ({ github, connections }: { github: GithubPort; connections: GithubConnectionRepository }) =>
  async (repo: string) => {
    const connection = await connections.get();
    if (!connection) throw new GithubNotConnectedError();
    return github.listOpenWork(connection, repo);
  };
