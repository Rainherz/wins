import type { DayClosure } from '../domain/dayClosure';

export interface DayClosureRepository {
  /** Creates or replaces the closure for `closure.day`. */
  upsert(closure: DayClosure): Promise<void>;
  /** Closures whose day falls in [from, to). */
  listByRange(from: Date, to: Date): Promise<DayClosure[]>;
}
