import type { Colors } from '@/shared/theme/tokens';
import type { IconName } from '@/shared/ui/Icon';
import type { Mood } from '../domain/dayClosure';

export const MOODS: { value: Mood; label: string; icon: IconName; hint: string }[] = [
  { value: 'good', label: 'Bien', icon: 'emoticon-happy-outline', hint: 'Todo fluyó' },
  { value: 'so-so', label: 'Regular', icon: 'emoticon-neutral-outline', hint: 'Un día estable' },
  { value: 'tough', label: 'Difícil', icon: 'emoticon-sad-outline', hint: 'Costó avanzar' },
];

export const moodMeta = (mood: Mood) => MOODS.find((item) => item.value === mood)!;

export const moodColor = (colors: Colors, mood: Mood) => colors.mood[mood === 'so-so' ? 'soSo' : mood];
