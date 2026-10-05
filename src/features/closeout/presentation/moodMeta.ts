import type { Colors } from '@/shared/theme/tokens';
import type { Mood } from '../domain/dayClosure';

export const MOODS: { value: Mood; label: string; glyph: string; hint: string }[] = [
  { value: 'good', label: 'Bien', glyph: ':)', hint: 'Todo fluyó' },
  { value: 'so-so', label: 'Regular', glyph: ':|', hint: 'Un día estable' },
  { value: 'tough', label: 'Difícil', glyph: ':(', hint: 'Costó avanzar' },
];

export const moodMeta = (mood: Mood) => MOODS.find((item) => item.value === mood)!;

export const moodColor = (colors: Colors, mood: Mood) => colors.mood[mood === 'so-so' ? 'soSo' : mood];
