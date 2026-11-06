import type { AuthEmployee } from "@/types/auth.types";

type AuthData = {
  accessToken: string;
  refreshToken: string;
  employee: AuthEmployee;
};

type AuthStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type AuthSnapshot = {
  accessToken: string | null;
  refreshToken: string | null;
  employeeId: string | null;
  generation: string | null;
};

export function createAuthGeneration(): string;
export function readAuthSnapshot(storage: AuthStorage): AuthSnapshot;
export function isAuthSnapshotCurrent(
  storage: AuthStorage,
  snapshot: AuthSnapshot,
): boolean;
export function isAuthIdentityCurrent(
  storage: AuthStorage,
  snapshot: AuthSnapshot,
): boolean;
export function invalidateAuthState(storage: AuthStorage): void;
export function clearAuthState(storage: AuthStorage): void;

export function persistAuth(
  storage: AuthStorage,
  data: AuthData,
): void;

export function persistTokens(
  storage: AuthStorage,
  data: Pick<AuthData, "accessToken" | "refreshToken">,
  expectedSnapshot: AuthSnapshot,
): void;
