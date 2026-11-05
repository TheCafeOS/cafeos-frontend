type LockManagerLike = Pick<LockManager, "request">;

type AuthStorage = Pick<Storage, "getItem">;

export function createCrossTabRefresh<T>(
  getLockManager: () => LockManagerLike | null | undefined,
  getStorage: () => AuthStorage | null | undefined,
  getEmployeeId: () => string | null,
  lockName?: string,
): (
  refreshToken: string,
  employeeId: string | null,
  operation: () => Promise<T>,
) => Promise<T>;
