import type { AuthPort } from './ports';

export class InvalidCredentialsError extends Error {}

export const createSignIn =
  (auth: AuthPort) =>
  async (email: string, password: string): Promise<void> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new InvalidCredentialsError('Enter your email and password.');
    }
    await auth.signIn(trimmedEmail, password);
  };
