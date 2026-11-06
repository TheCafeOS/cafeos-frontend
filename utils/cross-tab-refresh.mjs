import {
  isAuthIdentityCurrent,
  isAuthSnapshotCurrent,
  readAuthSnapshot,
} from "./auth-persistence.mjs";
import { AUTH_STATE_LOCK_NAME } from "./auth-state-lock.mjs";

export function createCrossTabRefresh(
  getLockManager,
  getStorage,
) {
  return function run(expectedSnapshot, operation) {
    const lockManager = getLockManager();
    const storage = getStorage();

    if (!lockManager?.request || !storage) {
      return Promise.reject(
        new Error("Cross-tab authentication coordination is unavailable."),
      );
    }

    return lockManager.request(AUTH_STATE_LOCK_NAME, async () => {
      if (!isAuthIdentityCurrent(storage, expectedSnapshot)) {
        throw new Error("Authentication state changed during refresh.");
      }

      const current = readAuthSnapshot(storage);

      if (current.refreshToken !== expectedSnapshot.refreshToken) {
        if (!current.accessToken) {
          throw new Error("Authentication state is incomplete.");
        }

        return current.accessToken;
      }

      if (!isAuthSnapshotCurrent(storage, expectedSnapshot)) {
        throw new Error("Authentication state changed during refresh.");
      }

      const accessToken = await operation(expectedSnapshot);
      if (
        !isAuthIdentityCurrent(storage, expectedSnapshot) ||
        storage.getItem("accessToken") !== accessToken
      ) {
        throw new Error("Authentication state changed during refresh.");
      }

      return accessToken;
    });
  };
}
