/** PostgREST returns at most this many rows per request unless asked for a range. */
const PAGE_SIZE = 1000;

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/**
 * Reads a query page by page until it runs out of rows. `fetchPage` receives an inclusive
 * range. The query must have a stable order (add a unique column last) or rows can repeat or go missing.
 */
export async function readAllPages<T>(fetchPage: (from: number, to: number) => Page<T>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}
