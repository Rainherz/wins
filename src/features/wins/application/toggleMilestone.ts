import type { WinRepository } from './ports';

export const createToggleMilestone =
  (wins: WinRepository) => (id: string, isMilestone: boolean) =>
    wins.setMilestone(id, isMilestone);
