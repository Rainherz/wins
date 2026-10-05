import { dayKey } from '@/shared/lib/dates';

import type { DayClosureRepository } from '../application/ports';
import type { DayClosure } from '../domain/dayClosure';

export class InMemoryDayClosureRepository implements DayClosureRepository {
  constructor(private closures: DayClosure[]) {}

  async upsert(closure: DayClosure) {
    this.closures = [...this.closures.filter((existing) => existing.day !== closure.day), closure];
  }

  async listByRange(from: Date, to: Date) {
    const start = dayKey(from);
    const end = dayKey(to);
    return this.closures.filter((closure) => closure.day >= start && closure.day < end);
  }
}
