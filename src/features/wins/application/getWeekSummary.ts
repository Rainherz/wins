import { addDays, dayKey, isSameDay, startOfWeek } from '@/shared/lib/dates';

import type { DayClosureRepository } from '@/features/closeout/application/ports';
import type { Mood } from '@/features/closeout/domain/dayClosure';
import type { ProjectRepository } from '@/features/projects/application/ports';
import type { Project } from '@/features/projects/domain/project';
import type { Win } from '../domain/win';
import type { Clock, WinRepository } from './ports';

export type DaySummary = {
  date: Date;
  key: string;
  wins: Win[];
  mood?: Mood;
  stuckNote?: string;
  isToday: boolean;
  isFuture: boolean;
};

export type WeekSummary = {
  weekStart: Date;
  days: DaySummary[];
  total: number;
  projectCount: number;
  previousTotal: number;
  projects: Record<string, Project>;
};

type Deps = {
  wins: WinRepository;
  projects: ProjectRepository;
  closures: DayClosureRepository;
  clock: Clock;
};

export const createGetWeekSummary =
  ({ wins, projects, closures, clock }: Deps) =>
  async (weekOffset = 0): Promise<WeekSummary> => {
    const now = clock.now();
    const weekStart = addDays(startOfWeek(now), weekOffset * 7);
    const weekEnd = addDays(weekStart, 7);

    const [weekWins, previousTotal, projectList, weekClosures] = await Promise.all([
      wins.listByRange(weekStart, weekEnd),
      wins.countByRange(addDays(weekStart, -7), weekStart),
      projects.list(),
      closures.listByRange(weekStart, weekEnd),
    ]);

    const closureByDay = new Map(weekClosures.map((closure) => [closure.day, closure]));

    const days: DaySummary[] = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const key = dayKey(date);
      return {
        date,
        key,
        wins: weekWins
          .filter((win) => dayKey(win.achievedAt) === key)
          .sort((a, b) => b.achievedAt.getTime() - a.achievedAt.getTime()),
        mood: closureByDay.get(key)?.mood,
        stuckNote: closureByDay.get(key)?.stuckNote,
        isToday: isSameDay(date, now),
        isFuture: date.getTime() > now.getTime() && !isSameDay(date, now),
      };
    });

    return {
      weekStart,
      days,
      total: weekWins.length,
      projectCount: new Set(weekWins.map((win) => win.projectId)).size,
      previousTotal,
      projects: Object.fromEntries(projectList.map((project) => [project.id, project])),
    };
  };
