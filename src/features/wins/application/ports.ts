import type { Win } from '../domain/win';

export type NewWin = Omit<Win, 'id'>;

export interface WinRepository {
  /** Persists the win and returns it with its generated id. */
  add(win: NewWin): Promise<Win>;
  listAll(): Promise<Win[]>;
  /** Wins achieved in [from, to). */
  listByRange(from: Date, to: Date): Promise<Win[]>;
  countByRange(from: Date, to: Date): Promise<number>;
  setMilestone(id: string, isMilestone: boolean): Promise<void>;
}

export interface Clock {
  now(): Date;
}
