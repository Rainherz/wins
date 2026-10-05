import type { GithubConnection, GithubWork } from '../domain/githubWork';

export interface GithubPort {
  /** Returns the login the token belongs to. Rejects with a user-safe message if the token is invalid. */
  getLogin(token: string): Promise<string>;
  /** Merged PRs authored by the user and closed issues assigned to them, finished on or after `since`. */
  listDoneWork(connection: GithubConnection, since: Date): Promise<GithubWork[]>;
}

export interface GithubConnectionRepository {
  get(): Promise<GithubConnection | null>;
  save(connection: GithubConnection): Promise<void>;
  remove(): Promise<void>;
}
