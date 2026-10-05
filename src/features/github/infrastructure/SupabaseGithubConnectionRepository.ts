import type { SupabaseClient } from '@supabase/supabase-js';

import type { GithubConnectionRepository } from '../application/ports';
import type { GithubConnection } from '../domain/githubWork';

export class SupabaseGithubConnectionRepository implements GithubConnectionRepository {
  constructor(private readonly client: SupabaseClient) {}

  async get() {
    const { data, error } = await this.client
      .from('github_connections')
      .select('login, token')
      .maybeSingle<GithubConnection>();
    if (error) throw new Error(error.message);
    return data;
  }

  async save(connection: GithubConnection) {
    const { error } = await this.client.from('github_connections').upsert(
      { login: connection.login, token: connection.token, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
    if (error) throw new Error(error.message);
  }

  async remove() {
    // RLS limits this to the caller's own row; PostgREST just requires some filter.
    const { error } = await this.client.from('github_connections').delete().not('user_id', 'is', null);
    if (error) throw new Error(error.message);
  }
}
