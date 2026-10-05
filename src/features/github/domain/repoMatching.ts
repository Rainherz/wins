import { MAX_PROJECT_NAME_LENGTH, type Project } from '@/features/projects/domain/project';
import { projectNameFromRepo } from './githubWork';

/**
 * How a repository relates to the existing projects:
 * - linked: a project is already linked to this exact repository.
 * - link: a project with the same name exists but has no repository yet; it can be linked.
 * - new: nothing matches, so a project with `name` would be created.
 */
export type RepoMatch =
  | { kind: 'linked'; project: Project }
  | { kind: 'link'; project: Project }
  | { kind: 'new'; name: string };

/** Matches by repository first and by name only for projects that are not linked yet. */
export function matchRepoToProject(fullName: string, projects: Project[]): RepoMatch {
  const key = fullName.toLowerCase();
  const linked = projects.find((project) => project.githubRepo?.toLowerCase() === key);
  if (linked) return { kind: 'linked', project: linked };

  const base = projectNameFromRepo(fullName);
  const sameName = projects.find((project) => project.name.toLowerCase() === base.toLowerCase());
  if (!sameName) return { kind: 'new', name: base };
  if (!sameName.githubRepo) return { kind: 'link', project: sameName };

  // The name belongs to a project linked to another repository: keep both and tell them apart by owner.
  const owner = fullName.split('/')[0];
  const taken = new Set(projects.map((project) => project.name.toLowerCase()));
  let candidate = `${base} (${owner})`.slice(0, MAX_PROJECT_NAME_LENGTH);
  for (let n = 2; taken.has(candidate.toLowerCase()); n++) {
    candidate = `${base} (${owner}) ${n}`.slice(0, MAX_PROJECT_NAME_LENGTH);
  }
  return { kind: 'new', name: candidate };
}
