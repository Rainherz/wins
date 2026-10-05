import { createContext, useContext, useState, type ReactNode } from 'react';

import { container } from '@/composition/container';
import type { Project } from '@/features/projects/domain/project';
import { WinFormSheet, type WinFormValues } from '@/features/wins/presentation/WinFormSheet';
import { weekOffsetOf } from '@/shared/lib/dates';

type CaptureValue = {
  /** Opens the "add a win" sheet from anywhere in the app. */
  openAddWin: () => void;
  /** Bumps every time a win is saved so screens know to reload. */
  revision: number;
  /** Weeks back from the current one where the last saved win landed (0 = this week). */
  savedWeekOffset: number;
};

const CaptureContext = createContext<CaptureValue | null>(null);

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saved, setSaved] = useState({ revision: 0, weekOffset: 0 });

  const openAddWin = async () => {
    try {
      // Only active projects: a finished project no longer takes new wins.
      setProjects(await container.listProjects());
    } catch {
      setProjects([]);
    }
    setOpen(true);
  };

  const onSave = async (values: WinFormValues) => {
    await container.logWin(values);
    setSaved((current) => ({
      revision: current.revision + 1,
      weekOffset: weekOffsetOf(values.achievedAt ?? new Date(), new Date()),
    }));
    setOpen(false);
  };

  return (
    <CaptureContext.Provider value={{ openAddWin, revision: saved.revision, savedWeekOffset: saved.weekOffset }}>
      {children}
      <WinFormSheet visible={open} projects={projects} onClose={() => setOpen(false)} onSave={onSave} />
    </CaptureContext.Provider>
  );
}

export function useCapture(): CaptureValue {
  const value = useContext(CaptureContext);
  if (!value) throw new Error('useCapture must be used inside CaptureProvider');
  return value;
}
