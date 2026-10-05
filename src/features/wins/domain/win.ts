export const MAX_TITLE_LENGTH = 280;

export type Win = {
  id: string;
  projectId: string;
  title: string;
  isMilestone: boolean;
  achievedAt: Date;
};
