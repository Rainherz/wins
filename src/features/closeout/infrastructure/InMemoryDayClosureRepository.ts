import { dayKey } from '@/shared/lib/dates';

import type { DayClosureRepository } from '../application/ports';
import type { DayClosure } from '../domain/dayClosure';

export class InMemoryDayClosureRepository implements DayClosureRepository {
  constructor(private readonly closures: DayClosure[]) {}

  async listByRange(from: Date, to: Date) {
    const start = dayKey(from);
    const end = dayKey(to);
    return this.closures.filter((closure) => closure.day >= start && closure.day < end);
  }
}
