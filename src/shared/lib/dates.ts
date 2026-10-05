export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) => {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
};

/** Monday of the week containing `date`. */
export const startOfWeek = (date: Date) => {
  const day = (date.getDay() + 6) % 7;
  return addDays(date, -day);
};

export const dayKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const isSameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);

export const formatWeekday = (date: Date) => {
  const name = date.toLocaleDateString('es', { weekday: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const formatShortDate = (date: Date) =>
  date.toLocaleDateString('es', { month: 'short', day: 'numeric' });

export const formatWeekRange = (start: Date) => {
  const end = addDays(start, 6);
  return `${formatShortDate(start)} – ${formatShortDate(end)}, ${end.getFullYear()}`;
};

/** Whole calendar days from `date` to `now` (0 = same day). */
export const daysAgo = (date: Date, now: Date) =>
  Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);

export const formatTime = (date: Date) =>
  date.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' });

/** The last `count` days ending at `now`, newest first. */
export const lastDays = (now: Date, count: number) => Array.from({ length: count }, (_, index) => addDays(now, -index));

/** The calendar day `day` at the same clock time as `source`. */
export const atTimeOf = (day: Date, source: Date) => {
  const result = startOfDay(day);
  result.setHours(source.getHours(), source.getMinutes(), source.getSeconds(), 0);
  return result;
};

export const atNoon = (day: Date) => {
  const result = startOfDay(day);
  result.setHours(12, 0, 0, 0);
  return result;
};

/** "Hoy", "Ayer" or a short weekday with the day number, for day pickers. */
export const formatDayChip = (day: Date, now: Date) => {
  const diff = Math.round((startOfDay(now).getTime() - startOfDay(day).getTime()) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return `${day.toLocaleDateString('es', { weekday: 'short' })} ${day.getDate()}`;
};

/** Whole weeks between the week of `date` and the week of `now` (negative for the past). */
export const weekOffsetOf = (date: Date, now: Date) =>
  Math.round((startOfWeek(date).getTime() - startOfWeek(now).getTime()) / (7 * 86_400_000));
