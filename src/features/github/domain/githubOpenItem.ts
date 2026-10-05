/** How many open items are fetched. When the list reaches this size there may be more. */
export const OPEN_WORK_LIMIT = 50;

/** An open issue or pull request in a repository: what is still pending. */
export type GithubOpenItem = {
  number: number;
  title: string;
  url: string;
  kind: 'pr' | 'issue';
  isDraft: boolean;
  updatedAt: Date;
  labels: string[];
  author: string;
};
