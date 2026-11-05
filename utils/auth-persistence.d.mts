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

export function persistAuth(
  storage: AuthStorage,
  data: AuthData,
): void;

export function persistTokens(
  storage: AuthStorage,
  data: Pick<AuthData, "accessToken" | "refreshToken">,
): void;
