const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

export const formatWeekday = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long' });

export const formatShortDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const formatWeekRange = (start: Date) => {
  const end = addDays(start, 6);
  return `${formatShortDate(start)} – ${formatShortDate(end)}, ${end.getFullYear()}`;
};

/** Whole calendar days from `date` to `now` (0 = same day). */
export const daysAgo = (date: Date, now: Date) =>
  Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);
