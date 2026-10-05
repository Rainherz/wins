import { MAX_TITLE_LENGTH, type Win } from '../domain/win';
import type { Clock, WinRepository } from './ports';

export class InvalidWinError extends Error {}

export type LogWinInput = {
  title: string;
  projectId: string;
  isMilestone: boolean;
};

export const createLogWin =
  ({ wins, clock }: { wins: WinRepository; clock: Clock }) =>
  async (input: LogWinInput): Promise<Win> => {
    const title = input.title.trim();
    if (!title) throw new InvalidWinError('Title is required');
    if (title.length > MAX_TITLE_LENGTH) {
      throw new InvalidWinError(`Title must be at most ${MAX_TITLE_LENGTH} characters`);
    }

    return wins.add({
      projectId: input.projectId,
      title,
      isMilestone: input.isMilestone,
      achievedAt: clock.now(),
    });
  };
