import type { CreateProjectInput } from '@/features/projects/application/createProject';
import type { ProjectRepository } from '@/features/projects/application/ports';
import type { Project } from '@/features/projects/domain/project';
import type { WinRepository } from '@/features/wins/application/ports';
import { matchRepoToProject } from '../domain/repoMatching';
import type { ImportSuggestion } from './getImportSuggestions';

type Deps = {
  wins: WinRepository;
  projects: ProjectRepository;
  createProject: (input: CreateProjectInput) => Promise<Project>;
};

/**
 * Turns the chosen suggestions into wins. Each one goes to the project linked to its repository;
 * a missing project is created, and an unlinked project of the same name gets linked.
 * Returns how many were imported.
 */
export const createImportFromGithub =
  ({ wins, projects, createProject }: Deps) =>
  async (selected: ImportSuggestion[]): Promise<number> => {
    let known = await projects.list({ includeArchived: true });

    // Sequential on purpose: each new project picks the next free color.
    for (const item of selected) {
      const match = matchRepoToProject(item.repo, known);
      let project: Project;

      if (match.kind === 'linked') {
        project = match.project;
      } else if (match.kind === 'link') {
        await projects.update(match.project.id, { githubRepo: item.repo });
        project = { ...match.project, githubRepo: item.repo };
        known = known.map((candidate) => (candidate.id === project.id ? project : candidate));
      } else {
        project = await createProject({ name: match.name, description: item.repo, githubRepo: item.repo });
        known = [...known, project];
      }

      await wins.add({
        projectId: project.id,
        title: item.title,
        isMilestone: false,
        achievedAt: item.doneAt,
        externalId: item.externalId,
        externalUrl: item.url,
      });
    }

    return selected.length;
  };
