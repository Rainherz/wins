import type { SupabaseClient } from '@supabase/supabase-js';

import type { NewProject, ProjectPatch, ProjectRepository } from '../application/ports';
import type { Project } from '../domain/project';

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  color_slot: number;
  archived_at: string | null;
};

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  colorSlot: row.color_slot,
  archivedAt: row.archived_at ? new Date(row.archived_at) : undefined,
});

export class SupabaseProjectRepository implements ProjectRepository {
  constructor(private readonly client: SupabaseClient) {}

  async add(project: NewProject) {
    const { data, error } = await this.client
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        color_slot: project.colorSlot,
      })
      .select()
      .single<ProjectRow>();
    if (error) throw new Error(error.message);
    return toProject(data);
  }

  async update(id: string, patch: ProjectPatch) {
    const { error } = await this.client
      .from('projects')
      .update({
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.description !== undefined && { description: patch.description }),
        ...(patch.archivedAt !== undefined && { archived_at: patch.archivedAt ? patch.archivedAt.toISOString() : null }),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async remove(id: string) {
    const { error } = await this.client.from('projects').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async list(options?: { includeArchived?: boolean }) {
    let query = this.client.from('projects').select();
    if (!options?.includeArchived) query = query.is('archived_at', null);
    const { data, error } = await query.order('created_at', { ascending: true }).returns<ProjectRow[]>();
    if (error) throw new Error(error.message);
    return data.map(toProject);
  }
}
