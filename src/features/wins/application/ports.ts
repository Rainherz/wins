import type { Win } from '../domain/win';

export interface WinRepository {
  add(win: Win): Promise<void>;
  /** Wins achieved in [from, to). */
  listByRange(from: Date, to: Date): Promise<Win[]>;
  countByRange(from: Date, to: Date): Promise<number>;
  setMilestone(id: string, isMilestone: boolean): Promise<void>;
}

export interface Clock {
  now(): Date;
}
