import type { SupabaseClient } from '@supabase/supabase-js';

import type { NewProject, ProjectPatch, ProjectRepository } from '../application/ports';
import type { Project } from '../domain/project';

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  color_slot: number;
  archived_at: string | null;
  github_repo: string | null;
};

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  colorSlot: row.color_slot,
  archivedAt: row.archived_at ? new Date(row.archived_at) : undefined,
  githubRepo: row.github_repo ?? undefined,
});

/** Postgres unique violations carry code 23505; say which rule was broken. */
const fail = (error: { code?: string; message: string }): never => {
  if (error.code === '23505') {
    throw new Error(
      error.message.includes('github_repo')
        ? 'Ese repositorio ya está vinculado a otro proyecto.'
        : 'Ya existe un proyecto con ese nombre.',
    );
  }
  throw new Error(error.message);
};

export class SupabaseProjectRepository implements ProjectRepository {
  constructor(private readonly client: SupabaseClient) {}

  async add(project: NewProject) {
    const { data, error } = await this.client
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        color_slot: project.colorSlot,
        github_repo: project.githubRepo ?? null,
      })
      .select()
      .single<ProjectRow>();
    if (error) fail(error);
    return toProject(data!);
  }

  async update(id: string, patch: ProjectPatch) {
    const { error } = await this.client
      .from('projects')
      .update({
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.description !== undefined && { description: patch.description }),
        ...(patch.archivedAt !== undefined && { archived_at: patch.archivedAt ? patch.archivedAt.toISOString() : null }),
        ...(patch.githubRepo !== undefined && { github_repo: patch.githubRepo }),
      })
      .eq('id', id);
    if (error) fail(error);
  }

  async remove(id: string) {
    const { error } = await this.client.from('projects').delete().eq('id', id);
    if (error) fail(error);
  }

  async list(options?: { includeArchived?: boolean }) {
    let query = this.client.from('projects').select();
    if (!options?.includeArchived) query = query.is('archived_at', null);
    const { data, error } = await query.order('created_at', { ascending: true }).returns<ProjectRow[]>();
    if (error) fail(error);
    return data!.map(toProject);
  }
}
