/** A repository the connected token can see. Importing one creates a project. */
export type GithubRepo = {
  /** "owner/name". */
  fullName: string;
  name: string;
  owner: string;
  description?: string;
  /** Archived repositories are the ones you consider finished. */
  archived: boolean;
  isPrivate: boolean;
  isFork: boolean;
  /** Open issues and pull requests: what is still pending. */
  openIssues: number;
  pushedAt?: Date;
  url: string;
};
