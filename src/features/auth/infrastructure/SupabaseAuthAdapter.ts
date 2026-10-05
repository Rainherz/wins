import type { Session as SupabaseSession, SupabaseClient } from '@supabase/supabase-js';

import type { AuthPort } from '../application/ports';
import type { Session } from '../domain/session';

const toSession = (session: SupabaseSession | null): Session | null =>
  session ? { userId: session.user.id, email: session.user.email ?? '' } : null;

export class SupabaseAuthAdapter implements AuthPort {
  constructor(private readonly client: SupabaseClient) {}

  async signIn(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (!error) return;
    // Supabase answers 400 "Invalid login credentials" for both unknown email and wrong password.
    throw new Error(
      error.status === 400 ? 'Correo o contraseña incorrectos.' : 'No se pudo iniciar sesión. Inténtalo de nuevo en un momento.',
    );
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw new Error(error.message);
  }

  onSessionChange(listener: (session: Session | null) => void) {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      listener(toSession(session));
    });
    return () => data.subscription.unsubscribe();
  }
}
