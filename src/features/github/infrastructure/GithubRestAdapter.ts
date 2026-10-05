import type { GithubPort } from '../application/ports';
import type { GithubConnection, GithubWork } from '../domain/githubWork';

const API = 'https://api.github.com';

type SearchItem = {
  number: number;
  title: string;
  html_url: string;
  closed_at: string | null;
  repository_url: string;
  pull_request?: { merged_at: string | null };
};

async function request<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (response.status === 401) {
    throw new Error('GitHub rechazó el token. Revisa que sea válido y que no haya expirado.');
  }
  if (response.status === 403 || response.status === 429) {
    throw new Error('GitHub limitó las solicitudes o el token no tiene permisos. Inténtalo en un minuto.');
  }
  if (!response.ok) throw new Error('No se pudo consultar GitHub.');
  return response.json() as Promise<T>;
}

const search = async (token: string, query: string) =>
  (await request<{ items: SearchItem[] }>(token, `/search/issues?q=${encodeURIComponent(query)}&per_page=100`)).items;

export class GithubRestAdapter implements GithubPort {
  async getLogin(token: string) {
    return (await request<{ login: string }>(token, '/user')).login;
  }

  async listDoneWork({ token, login }: GithubConnection, since: Date) {
    // The date qualifier is day-granular; the use case filters the exact range afterwards.
    const day = since.toISOString().slice(0, 10);
    const [mergedPrs, closedIssues] = await Promise.all([
      search(token, `author:${login} is:pr is:merged merged:>=${day}`),
      search(token, `assignee:${login} is:issue is:closed closed:>=${day}`),
    ]);

    const work = new Map<string, GithubWork>();
    for (const item of [...mergedPrs, ...closedIssues]) {
      const isPr = item.pull_request !== undefined;
      const doneAt = isPr ? item.pull_request?.merged_at : item.closed_at;
      if (!doneAt) continue;

      const repo = item.repository_url.replace(`${API}/repos/`, '');
      const externalId = `github:${repo}#${item.number}`;
      work.set(externalId, {
        externalId,
        title: item.title,
        repo,
        number: item.number,
        url: item.html_url,
        kind: isPr ? 'pr' : 'issue',
        doneAt: new Date(doneAt),
      });
    }
    return [...work.values()];
  }
}
