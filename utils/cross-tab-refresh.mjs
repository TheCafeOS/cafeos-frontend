export function createCrossTabRefresh(
  getLockManager,
  getStorage,
  getEmployeeId,
  lockName = "cafeos-auth-refresh",
) {
  return function run(refreshToken, employeeId, operation) {
    const lockManager = getLockManager();
    const storage = getStorage();

    if (!lockManager?.request || !storage) {
      return Promise.reject(
        new Error("Cross-tab authentication coordination is unavailable."),
      );
    }

    return lockManager.request(lockName, async () => {
      const currentRefreshToken = storage.getItem("refreshToken");

      if (currentRefreshToken !== refreshToken) {
        if (
          !employeeId ||
          getEmployeeId() !== employeeId
        ) {
          throw new Error("Authentication state changed during refresh.");
        }

        const accessToken = storage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Authentication state is incomplete.");
        }

        return accessToken;
      }

      return operation();
    });
  };
}
