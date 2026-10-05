import type { GithubConnectionRepository, GithubPort } from './ports';

export class InvalidGithubTokenError extends Error {}

export const createConnectGithub =
  ({ github, connections }: { github: GithubPort; connections: GithubConnectionRepository }) =>
  async (rawToken: string): Promise<string> => {
    const token = rawToken.trim();
    if (!token) throw new InvalidGithubTokenError('Pega tu token de GitHub.');

    const login = await github.getLogin(token);
    await connections.save({ login, token });
    return login;
  };

export const createDisconnectGithub = (connections: GithubConnectionRepository) => () =>
  connections.remove();
