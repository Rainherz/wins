import type { DayClosure } from '../domain/dayClosure';

export interface DayClosureRepository {
  /** Closures whose day falls in [from, to). */
  listByRange(from: Date, to: Date): Promise<DayClosure[]>;
}
