type LockManagerLike = Pick<LockManager, "request">;

export const AUTH_STATE_LOCK_NAME: string;

export function withAuthStateLock<T>(
  getLockManager: () => LockManagerLike | null | undefined,
  operation: () => Promise<T> | T,
): Promise<T>;
