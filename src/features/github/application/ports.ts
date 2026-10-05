import type { GithubConnection, GithubWork } from '../domain/githubWork';
import type { GithubOpenItem } from '../domain/githubOpenItem';
import type { GithubRepo } from '../domain/githubRepo';

export interface GithubPort {
  /** Returns the login the token belongs to. Rejects with a user-safe message if the token is invalid. */
  getLogin(token: string): Promise<string>;
  /** Merged PRs authored by the user and closed issues assigned to them, finished on or after `since`. */
  listDoneWork(connection: GithubConnection, since: Date): Promise<GithubWork[]>;
  /** Repositories the token can access, most recently pushed first. */
  listRepos(connection: GithubConnection): Promise<GithubRepo[]>;
  /** Open issues and pull requests of `repo` ("owner/name"), most recently updated first. */
  listOpenWork(connection: GithubConnection, repo: string): Promise<GithubOpenItem[]>;
  /** The README of `repo` as Markdown, or null when it has none. */
  getReadme(connection: GithubConnection, repo: string): Promise<string | null>;
}

export interface GithubConnectionRepository {
  get(): Promise<GithubConnection | null>;
  save(connection: GithubConnection): Promise<void>;
  remove(): Promise<void>;
}
