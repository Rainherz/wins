import { createSignIn } from '@/features/auth/application/signIn';
import { SupabaseAuthAdapter } from '@/features/auth/infrastructure/SupabaseAuthAdapter';
import { createCloseDay } from '@/features/closeout/application/closeDay';
import { SupabaseDayClosureRepository } from '@/features/closeout/infrastructure/SupabaseDayClosureRepository';
import { createCreateProject } from '@/features/projects/application/createProject';
import { createGetProjectsOverview } from '@/features/projects/application/getProjectsOverview';
import { createListProjects } from '@/features/projects/application/listProjects';
import { SupabaseProjectRepository } from '@/features/projects/infrastructure/SupabaseProjectRepository';
import { createGetWeekSummary } from '@/features/wins/application/getWeekSummary';
import { createLogWin } from '@/features/wins/application/logWin';
import type { Clock } from '@/features/wins/application/ports';
import { createToggleMilestone } from '@/features/wins/application/toggleMilestone';
import { SupabaseWinRepository } from '@/features/wins/infrastructure/SupabaseWinRepository';
import { supabase } from '@/shared/lib/supabase';

const clock: Clock = { now: () => new Date() };

const auth = new SupabaseAuthAdapter(supabase);
const wins = new SupabaseWinRepository(supabase);
const projects = new SupabaseProjectRepository(supabase);
const closures = new SupabaseDayClosureRepository(supabase);

export const container = {
  signIn: createSignIn(auth),
  signOut: () => auth.signOut(),
  onSessionChange: auth.onSessionChange.bind(auth),
  getWeekSummary: createGetWeekSummary({ wins, projects, closures, clock }),
  toggleMilestone: createToggleMilestone(wins),
  logWin: createLogWin({ wins, clock }),
  listProjects: createListProjects(projects),
  closeDay: createCloseDay({ closures, clock }),
  createProject: createCreateProject(projects),
  getProjectsOverview: createGetProjectsOverview({ wins, projects, clock }),
};
