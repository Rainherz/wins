import type { Win } from '../domain/win';
import type { Clock, WinRepository } from './ports';
import { assertNotFuture, normalizeTitle } from './winRules';

export { InvalidWinError } from './winRules';

export type LogWinInput = {
  title: string;
  projectId: string;
  isMilestone: boolean;
  /** When it happened. Defaults to now. */
  achievedAt?: Date;
};

export const createLogWin =
  ({ wins, clock }: { wins: WinRepository; clock: Clock }) =>
  async (input: LogWinInput): Promise<Win> => {
    const now = clock.now();
    const achievedAt = input.achievedAt ?? now;
    assertNotFuture(achievedAt, now);

    return wins.add({
      projectId: input.projectId,
      title: normalizeTitle(input.title),
      isMilestone: input.isMilestone,
      achievedAt,
    });
  };
