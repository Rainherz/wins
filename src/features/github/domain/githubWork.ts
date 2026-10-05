import { MAX_PROJECT_NAME_LENGTH } from '@/features/projects/domain/project';

/** A merged pull request or a closed issue that can become a win. */
export type GithubWork = {
  /** Stable id, for example "github:owner/repo#12". */
  externalId: string;
  title: string;
  /** "owner/name". */
  repo: string;
  number: number;
  url: string;
  kind: 'pr' | 'issue';
  /** When the PR was merged or the issue was closed. */
  doneAt: Date;
};

export type GithubConnection = {
  login: string;
  token: string;
};

/** Repositories become projects: "owner/name" maps to a project called "name". */
export const projectNameFromRepo = (repo: string) =>
  (repo.split('/')[1] ?? repo).slice(0, MAX_PROJECT_NAME_LENGTH);
