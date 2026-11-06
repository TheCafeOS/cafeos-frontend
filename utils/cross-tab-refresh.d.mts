type LockManagerLike = Pick<LockManager, "request">;

type AuthStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type AuthSnapshot = {
  accessToken: string | null;
  refreshToken: string | null;
  employeeId: string | null;
  generation: string | null;
};

export function createCrossTabRefresh<T>(
  getLockManager: () => LockManagerLike | null | undefined,
  getStorage: () => AuthStorage | null | undefined,
): (
  snapshot: AuthSnapshot,
  operation: (snapshot: AuthSnapshot) => Promise<T>,
) => Promise<T>;
