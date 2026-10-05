import type { WinRepository } from './ports';

export const createDeleteWin = (wins: WinRepository) => (id: string) => wins.remove(id);
