import { dayKey } from '@/shared/lib/dates';

import type { Clock } from '@/features/wins/application/ports';
import type { Mood } from '../domain/dayClosure';
import type { DayClosureRepository } from './ports';

export type CloseDayInput = {
  mood: Mood;
  stuckNote?: string;
};

export const createCloseDay =
  ({ closures, clock }: { closures: DayClosureRepository; clock: Clock }) =>
  async ({ mood, stuckNote }: CloseDayInput): Promise<void> => {
    const note = stuckNote?.trim();
    await closures.upsert({ day: dayKey(clock.now()), mood, stuckNote: note ? note : undefined });
  };
