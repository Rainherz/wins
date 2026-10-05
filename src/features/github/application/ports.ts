import type { GithubConnection, GithubWork } from '../domain/githubWork';
import type { GithubRepo } from '../domain/githubRepo';

export interface GithubPort {
  /** Returns the login the token belongs to. Rejects with a user-safe message if the token is invalid. */
  getLogin(token: string): Promise<string>;
  /** Merged PRs authored by the user and closed issues assigned to them, finished on or after `since`. */
  listDoneWork(connection: GithubConnection, since: Date): Promise<GithubWork[]>;
  /** Repositories the token can access, most recently pushed first. */
  listRepos(connection: GithubConnection): Promise<GithubRepo[]>;
}

export interface GithubConnectionRepository {
  get(): Promise<GithubConnection | null>;
  save(connection: GithubConnection): Promise<void>;
  remove(): Promise<void>;
}
