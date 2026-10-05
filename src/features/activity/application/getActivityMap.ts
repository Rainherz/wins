import type { DayClosureRepository } from '@/features/closeout/application/ports';
import type { Mood } from '@/features/closeout/domain/dayClosure';
import type { ProjectRepository } from '@/features/projects/application/ports';
import type { Project } from '@/features/projects/domain/project';
import type { Clock, WinRepository } from '@/features/wins/application/ports';
import type { Win } from '@/features/wins/domain/win';
import { addDays, dayKey, isSameDay, startOfWeek } from '@/shared/lib/dates';

export type ActivityDay = {
  date: Date;
  key: string;
  /** Wins logged that day. */
  count: number;
  mood?: Mood;
  isToday: boolean;
  isFuture: boolean;
};

export type ProjectEffort = {
  projectId: string;
  project?: Project;
  count: number;
};

export type ActivityMap = {
  /** One entry per week, oldest first. Each week lists its seven days, Monday first. */
  weeks: ActivityDay[][];
  total: number;
  /** Days with at least one win. Reported as progress; days without are deliberately not counted. */
  activeDays: number;
  busiestWeek?: { start: Date; count: number };
  /** The busiest single day, used to scale the color intensity. At least 1. */
  maxDayCount: number;
  /** Wins per project in the period, most first. */
  effort: ProjectEffort[];
  winsByDay: Record<string, Win[]>;
  projects: Record<string, Project>;
};

type Deps = {
  wins: WinRepository;
  projects: ProjectRepository;
  closures: DayClosureRepository;
  clock: Clock;
};

/** The last `weekCount` weeks (the current one included) as a grid of days, plus the numbers behind it. */
export const createGetActivityMap =
  ({ wins, projects, closures, clock }: Deps) =>
  async (weekCount: number): Promise<ActivityMap> => {
    const now = clock.now();
    const currentWeek = startOfWeek(now);
    const from = addDays(currentWeek, -(weekCount - 1) * 7);
    const to = addDays(currentWeek, 7);

    const [rangeWins, rangeClosures, projectList] = await Promise.all([
      wins.listByRange(from, to),
      closures.listByRange(from, to),
      projects.list({ includeArchived: true }),
    ]);

    const winsByDay: Record<string, Win[]> = {};
    for (const win of rangeWins) {
      const key = dayKey(win.achievedAt);
      winsByDay[key] = [...(winsByDay[key] ?? []), win];
    }
    const moods = new Map(rangeClosures.map((closure) => [closure.day, closure.mood]));

    const weeks = Array.from({ length: weekCount }, (_, week) =>
      Array.from({ length: 7 }, (_, day): ActivityDay => {
        const date = addDays(from, week * 7 + day);
        const key = dayKey(date);
        return {
          date,
          key,
          count: winsByDay[key]?.length ?? 0,
          mood: moods.get(key),
          isToday: isSameDay(date, now),
          isFuture: date.getTime() > now.getTime() && !isSameDay(date, now),
        };
      }),
    );

    const days = weeks.flat();
    const weekTotals = weeks.map((week) => ({ start: week[0].date, count: week.reduce((sum, day) => sum + day.count, 0) }));
    const busiest = weekTotals.reduce((best, week) => (week.count > best.count ? week : best), weekTotals[0]);

    const perProject = new Map<string, number>();
    for (const win of rangeWins) perProject.set(win.projectId, (perProject.get(win.projectId) ?? 0) + 1);
    const projectsById = Object.fromEntries(projectList.map((project) => [project.id, project]));

    return {
      weeks,
      total: rangeWins.length,
      activeDays: days.filter((day) => day.count > 0).length,
      busiestWeek: busiest && busiest.count > 0 ? busiest : undefined,
      maxDayCount: Math.max(1, ...days.map((day) => day.count)),
      effort: [...perProject.entries()]
        .map(([projectId, count]): ProjectEffort => ({ projectId, project: projectsById[projectId], count }))
        .sort((a, b) => b.count - a.count),
      winsByDay,
      projects: projectsById,
    };
  };
