import { createContext, useContext, useState, type ReactNode } from 'react';

import { container } from '@/composition/container';
import type { Project } from '@/features/projects/domain/project';
import type { LogWinInput } from '@/features/wins/application/logWin';
import { AddWinSheet } from '@/features/wins/presentation/AddWinSheet';

type CaptureValue = {
  /** Opens the "add a win" sheet from anywhere in the app. */
  openAddWin: () => void;
  /** Bumps every time a win is saved so screens know to reload. */
  revision: number;
};

const CaptureContext = createContext<CaptureValue | null>(null);

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [revision, setRevision] = useState(0);

  const openAddWin = async () => {
    try {
      setProjects(await container.listProjects());
    } catch {
      setProjects([]);
    }
    setOpen(true);
  };

  const onSave = async (input: LogWinInput) => {
    await container.logWin(input);
    setRevision((current) => current + 1);
    setOpen(false);
  };

  return (
    <CaptureContext.Provider value={{ openAddWin, revision }}>
      {children}
      <AddWinSheet visible={open} projects={projects} onClose={() => setOpen(false)} onSave={onSave} />
    </CaptureContext.Provider>
  );
}

export function useCapture(): CaptureValue {
  const value = useContext(CaptureContext);
  if (!value) throw new Error('useCapture must be used inside CaptureProvider');
  return value;
}
