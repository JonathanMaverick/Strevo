export type MotokoResult<T, E> = { ok: T } | { err: E };

export function isOkResult<T, E>(result: MotokoResult<T, E> | undefined | null): result is { ok: T } {
  return result !== null && result !== undefined && typeof result === 'object' && 'ok' in result;
}

export function isErrResult<T, E>(result: MotokoResult<T, E> | undefined | null): result is { err: E } {
  return result !== null && result !== undefined && typeof result === 'object' && 'err' in result;
}