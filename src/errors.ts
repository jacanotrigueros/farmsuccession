/** The message of anything thrown, without assuming it is an Error. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * The error together with its low-level cause. Node's fetch reports every network failure as the
 * same "fetch failed", and the cause is what distinguishes a portal that is down from one that is
 * blocking us or has a broken certificate chain — which is the difference between a source to
 * retry, a source to check by hand, and a source to pin an intermediate for.
 */
export function describeError(error: unknown): string {
  const message = errorMessage(error);
  if (!(error instanceof Error) || !(error.cause instanceof Error)) return message;
  const cause = "code" in error.cause && typeof error.cause.code === "string" ? error.cause.code : error.cause.message;
  return cause ? `${message} (${cause})` : message;
}
