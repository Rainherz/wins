import { useState } from 'react';

import { container } from '@/composition/container';
import type { Project } from '@/features/projects/domain/project';
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet';
import type { Win } from '../domain/win';
import { WinFormSheet, type WinFormValues } from './WinFormSheet';

type Props = {
  /** The win being edited, or null when the editor is closed. */
  win: Win | null;
  projects: Project[];
  onClose: () => void;
  /** Called after a successful save. The caller refreshes whatever it shows. */
  onSaved: (win: Win, values: WinFormValues) => Promise<void>;
  onDeleted: (win: Win) => Promise<void>;
};

/** Edit form plus the "are you sure?" step for deleting. Shared by every screen that lists wins. */
export function WinEditorSheets({ win, projects, onClose, onSaved, onDeleted }: Props) {
  const [deleting, setDeleting] = useState<Win | null>(null);

  return (
    <>
      <WinFormSheet
        visible={win !== null}
        win={win ?? undefined}
        projects={projects}
        onClose={onClose}
        onSave={async (values) => {
          if (!win) return;
          await container.updateWin({ id: win.id, ...values });
          onClose();
          await onSaved(win, values);
        }}
        onDelete={() => {
          setDeleting(win);
          onClose();
        }}
      />
      <ConfirmSheet
        visible={deleting !== null}
        title="¿Eliminar este logro?"
        description={deleting ? `«${deleting.title}» se eliminará para siempre.` : ''}
        confirmLabel="Eliminar logro"
        onConfirm={async () => {
          if (!deleting) return;
          await container.deleteWin(deleting.id);
          setDeleting(null);
          await onDeleted(deleting);
        }}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
