import type { Session } from '../domain/session';

export interface AuthPort {
  /** Rejects with an Error whose message is safe to show to the user. */
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  /**
   * Calls `listener` with the current session right away (or null) and again on every
   * change. Returns an unsubscribe function.
   */
  onSessionChange(listener: (session: Session | null) => void): () => void;
}
