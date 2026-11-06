export const AUTH_STATE_LOCK_NAME = "cafeos-auth-refresh";

export function withAuthStateLock(getLockManager, operation) {
  const lockManager = getLockManager();
  if (!lockManager?.request) {
    return Promise.resolve().then(operation);
  }

  return lockManager.request(AUTH_STATE_LOCK_NAME, operation);
}
