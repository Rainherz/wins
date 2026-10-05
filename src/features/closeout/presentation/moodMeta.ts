import type { Colors } from '@/shared/theme/tokens';
import type { Mood } from '../domain/dayClosure';

export const MOODS: { value: Mood; label: string; glyph: string; hint: string }[] = [
  { value: 'good', label: 'Good', glyph: ':)', hint: 'Things flowed' },
  { value: 'so-so', label: 'So-so', glyph: ':|', hint: 'A steady day' },
  { value: 'tough', label: 'Tough', glyph: ':(', hint: 'Heavy going' },
];

export const moodMeta = (mood: Mood) => MOODS.find((item) => item.value === mood)!;

export const moodColor = (colors: Colors, mood: Mood) => colors.mood[mood === 'so-so' ? 'soSo' : mood];
