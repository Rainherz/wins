/** A message that is safe to show to the user for anything that was thrown. */
export const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
