import type { SupabaseClient } from '@supabase/supabase-js';

import { dayKey } from '@/shared/lib/dates';

import type { DayClosureRepository } from '../application/ports';
import type { DayClosure, Mood } from '../domain/dayClosure';

type DayClosureRow = {
  day: string;
  mood: Mood;
  stuck_note: string | null;
};

export class SupabaseDayClosureRepository implements DayClosureRepository {
  constructor(private readonly client: SupabaseClient) {}

  async upsert(closure: DayClosure) {
    const { error } = await this.client.from('day_closures').upsert(
      {
        day: closure.day,
        mood: closure.mood,
        stuck_note: closure.stuckNote ?? null,
      },
      { onConflict: 'user_id,day' },
    );
    if (error) throw new Error(error.message);
  }

  async listByRange(from: Date, to: Date) {
    const { data, error } = await this.client
      .from('day_closures')
      .select('day, mood, stuck_note')
      .gte('day', dayKey(from))
      .lt('day', dayKey(to))
      .returns<DayClosureRow[]>();
    if (error) throw new Error(error.message);
    return data.map((row): DayClosure => ({
      day: row.day,
      mood: row.mood,
      stuckNote: row.stuck_note ?? undefined,
    }));
  }
}
