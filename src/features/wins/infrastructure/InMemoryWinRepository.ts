import type { WinRepository } from '../application/ports';
import type { Win } from '../domain/win';

export class InMemoryWinRepository implements WinRepository {
  constructor(private wins: Win[]) {}

  async listByRange(from: Date, to: Date) {
    return this.wins.filter((win) => win.achievedAt >= from && win.achievedAt < to);
  }

  async countByRange(from: Date, to: Date) {
    return (await this.listByRange(from, to)).length;
  }

  async setMilestone(id: string, isMilestone: boolean) {
    this.wins = this.wins.map((win) => (win.id === id ? { ...win, isMilestone } : win));
  }
}
