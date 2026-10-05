export const MAX_TITLE_LENGTH = 280;

export type Win = {
  id: string;
  projectId: string;
  title: string;
  isMilestone: boolean;
  achievedAt: Date;
  /** Stable id of the thing this win was imported from (for example "github:owner/repo#12"). */
  externalId?: string;
  externalUrl?: string;
};
