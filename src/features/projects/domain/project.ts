export type Project = {
  id: string;
  name: string;
  description: string;
  /** Index into the project palette. Fixed at creation. */
  colorSlot: number;
};
