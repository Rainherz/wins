import type { SupabaseClient } from '@supabase/supabase-js';

import type { NewProject, ProjectRepository } from '../application/ports';
import type { Project } from '../domain/project';

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  color_slot: number;
};

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  colorSlot: row.color_slot,
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

  async list() {
    const { data, error } = await this.client
      .from('projects')
      .select()
      .is('archived_at', null)
      .order('created_at', { ascending: true })
      .returns<ProjectRow[]>();
    if (error) throw new Error(error.message);
    return data.map(toProject);
  }
}
