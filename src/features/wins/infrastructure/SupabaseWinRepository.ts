import type { SupabaseClient } from '@supabase/supabase-js';

import type { NewWin, WinRepository } from '../application/ports';
import type { Win } from '../domain/win';

type WinRow = {
  id: string;
  project_id: string;
  title: string;
  is_milestone: boolean;
  achieved_at: string;
  external_id: string | null;
  external_url: string | null;
};

const toWin = (row: WinRow): Win => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  isMilestone: row.is_milestone,
  achievedAt: new Date(row.achieved_at),
  externalId: row.external_id ?? undefined,
  externalUrl: row.external_url ?? undefined,
});

export class SupabaseWinRepository implements WinRepository {
  constructor(private readonly client: SupabaseClient) {}

  async add(win: NewWin) {
    const { data, error } = await this.client
      .from('wins')
      .insert({
        project_id: win.projectId,
        title: win.title,
        is_milestone: win.isMilestone,
        achieved_at: win.achievedAt.toISOString(),
        external_id: win.externalId ?? null,
        external_url: win.externalUrl ?? null,
      })
      .select()
      .single<WinRow>();
    if (error) throw new Error(error.message);
    return toWin(data);
  }

  async listAll() {
    const { data, error } = await this.client
      .from('wins')
      .select()
      .order('achieved_at', { ascending: false })
      .returns<WinRow[]>();
    if (error) throw new Error(error.message);
    return data.map(toWin);
  }

  async listByRange(from: Date, to: Date) {
    const { data, error } = await this.client
      .from('wins')
      .select()
      .gte('achieved_at', from.toISOString())
      .lt('achieved_at', to.toISOString())
      .order('achieved_at', { ascending: false })
      .returns<WinRow[]>();
    if (error) throw new Error(error.message);
    return data.map(toWin);
  }

  async countByRange(from: Date, to: Date) {
    const { count, error } = await this.client
      .from('wins')
      .select('id', { count: 'exact', head: true })
      .gte('achieved_at', from.toISOString())
      .lt('achieved_at', to.toISOString());
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async setMilestone(id: string, isMilestone: boolean) {
    const { error } = await this.client.from('wins').update({ is_milestone: isMilestone }).eq('id', id);
    if (error) throw new Error(error.message);
  }

  async listExternalIds() {
    const { data, error } = await this.client
      .from('wins')
      .select('external_id')
      .not('external_id', 'is', null)
      .returns<{ external_id: string }[]>();
    if (error) throw new Error(error.message);
    return data.map((row) => row.external_id);
  }
}
