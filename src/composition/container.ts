import { createCloseDay } from '@/features/closeout/application/closeDay';
import { InMemoryDayClosureRepository } from '@/features/closeout/infrastructure/InMemoryDayClosureRepository';
import { createCreateProject } from '@/features/projects/application/createProject';
import { createGetProjectsOverview } from '@/features/projects/application/getProjectsOverview';
import { createListProjects } from '@/features/projects/application/listProjects';
import { InMemoryProjectRepository } from '@/features/projects/infrastructure/InMemoryProjectRepository';
import { createGetWeekSummary } from '@/features/wins/application/getWeekSummary';
import { createLogWin } from '@/features/wins/application/logWin';
import type { Clock } from '@/features/wins/application/ports';
import { createToggleMilestone } from '@/features/wins/application/toggleMilestone';
import { InMemoryWinRepository } from '@/features/wins/infrastructure/InMemoryWinRepository';

import { buildSeed } from './seed';

const clock: Clock = { now: () => new Date() };

// Local sample data for now. Supabase adapters replace these without touching use cases.
const seed = buildSeed(clock.now());
const wins = new InMemoryWinRepository(seed.wins);
const projects = new InMemoryProjectRepository(seed.projects);
const closures = new InMemoryDayClosureRepository(seed.closures);

export const container = {
  getWeekSummary: createGetWeekSummary({ wins, projects, closures, clock }),
  toggleMilestone: createToggleMilestone(wins),
  logWin: createLogWin({ wins, clock }),
  listProjects: createListProjects(projects),
  closeDay: createCloseDay({ closures, clock }),
  createProject: createCreateProject(projects),
  getProjectsOverview: createGetProjectsOverview({ wins, projects, clock }),
};
