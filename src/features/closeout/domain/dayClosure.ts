export type Mood = 'good' | 'so-so' | 'tough';

export type DayClosure = {
  /** Day key in YYYY-MM-DD. */
  day: string;
  mood: Mood;
  stuckNote?: string;
};
