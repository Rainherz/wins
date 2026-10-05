import type { Clock, WinRepository } from './ports';
import { assertNotFuture, normalizeTitle } from './winRules';

export type UpdateWinInput = {
  id: string;
  title: string;
  projectId: string;
  isMilestone: boolean;
  /** Only sent when the day changed. */
  achievedAt?: Date;
};

export const createUpdateWin =
  ({ wins, clock }: { wins: WinRepository; clock: Clock }) =>
  async ({ id, title, projectId, isMilestone, achievedAt }: UpdateWinInput): Promise<void> => {
    if (achievedAt) assertNotFuture(achievedAt, clock.now());
    await wins.update(id, {
      title: normalizeTitle(title),
      projectId,
      isMilestone,
      ...(achievedAt ? { achievedAt } : {}),
    });
  };
