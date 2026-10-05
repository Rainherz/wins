import type { AuthPort } from './ports';

export class InvalidCredentialsError extends Error {}

export const createSignIn =
  (auth: AuthPort) =>
  async (email: string, password: string): Promise<void> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new InvalidCredentialsError('Ingresa tu correo y tu contraseña.');
    }
    await auth.signIn(trimmedEmail, password);
  };
