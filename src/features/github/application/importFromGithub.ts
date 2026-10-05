import type { CreateProjectInput } from '@/features/projects/application/createProject';
import type { ProjectRepository } from '@/features/projects/application/ports';
import type { Project } from '@/features/projects/domain/project';
import type { WinRepository } from '@/features/wins/application/ports';
import type { ImportSuggestion } from './getImportSuggestions';

type Deps = {
  wins: WinRepository;
  projects: ProjectRepository;
  createProject: (input: CreateProjectInput) => Promise<Project>;
};

/** Turns the chosen suggestions into wins, creating a project per new repository. Returns how many were imported. */
export const createImportFromGithub =
  ({ wins, projects, createProject }: Deps) =>
  async (selected: ImportSuggestion[]): Promise<number> => {
    const byName = new Map((await projects.list({ includeArchived: true })).map((project) => [project.name.toLowerCase(), project]));

    // Sequential on purpose: each new project picks the next free color.
    for (const item of selected) {
      const key = item.projectName.toLowerCase();
      let project = byName.get(key);
      if (!project) {
        project = await createProject({ name: item.projectName, description: item.repo });
        byName.set(key, project);
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
