import { GithubNotConnectedError } from './getImportSuggestions';
import type { GithubConnectionRepository, GithubPort } from './ports';

/** READMEs can be huge; past this many characters the text is cut and the UI links to GitHub. */
export const MAX_README_CHARS = 30_000;

export type Readme = { markdown: string; truncated: boolean };

export const createGetReadme =
  ({ github, connections }: { github: GithubPort; connections: GithubConnectionRepository }) =>
  async (repo: string): Promise<Readme | null> => {
    const connection = await connections.get();
    if (!connection) throw new GithubNotConnectedError();

    const markdown = await github.getReadme(connection, repo);
    if (markdown === null) return null;
    return { markdown: markdown.slice(0, MAX_README_CHARS), truncated: markdown.length > MAX_README_CHARS };
  };
