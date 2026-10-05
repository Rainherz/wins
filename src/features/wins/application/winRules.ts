import { MAX_TITLE_LENGTH } from '../domain/win';

export class InvalidWinError extends Error {}

export const normalizeTitle = (raw: string) => {
  const title = raw.trim();
  if (!title) throw new InvalidWinError('El título es obligatorio');
  if (title.length > MAX_TITLE_LENGTH) {
    throw new InvalidWinError(`El título admite como máximo ${MAX_TITLE_LENGTH} caracteres`);
  }
  return title;
};

/** A win records something already done, so it cannot be dated in the future. */
export const assertNotFuture = (date: Date, now: Date) => {
  if (date.getTime() > now.getTime() + 60_000) throw new InvalidWinError('La fecha no puede ser futura');
};
