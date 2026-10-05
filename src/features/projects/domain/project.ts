/** Number of colors in the project palette. */
export const PROJECT_COLOR_SLOTS = 5;
export const MAX_PROJECT_NAME_LENGTH = 40;

export type Project = {
  id: string;
  name: string;
  description: string;
  /** Index into the project palette. Fixed at creation. */
  colorSlot: number;
};
