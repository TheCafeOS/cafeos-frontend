const AUTH_KEYS = [
  "accessToken",
  "refreshToken",
  "employee",
  "authGeneration",
  "logoutPending",
];
const TOKEN_KEYS = ["accessToken", "refreshToken"];

export function createAuthGeneration() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function readAuthSnapshot(storage) {
  let employeeId = null;
  try {
    employeeId = JSON.parse(storage.getItem("employee") ?? "null")?.id ?? null;
  } catch {
    employeeId = null;
  }

  return {
    accessToken: storage.getItem("accessToken"),
    refreshToken: storage.getItem("refreshToken"),
    employeeId,
    generation: storage.getItem("authGeneration"),
  };
}

export function isAuthSnapshotCurrent(storage, snapshot) {
  if (storage.getItem("logoutPending") === "true") {
    return false;
  }

  const current = readAuthSnapshot(storage);
  return current.employeeId === snapshot.employeeId &&
    current.generation === snapshot.generation &&
    current.refreshToken === snapshot.refreshToken;
}

export function isAuthIdentityCurrent(storage, snapshot) {
  if (storage.getItem("logoutPending") === "true") {
    return false;
  }

  const current = readAuthSnapshot(storage);
  return current.employeeId === snapshot.employeeId &&
    current.generation === snapshot.generation;
}

export function invalidateAuthState(storage) {
  storage.setItem("authGeneration", createAuthGeneration());
  storage.setItem("logoutPending", "true");
}

export function clearAuthState(storage) {
  storage.removeItem("accessToken");
  storage.removeItem("refreshToken");
  storage.removeItem("employee");
  storage.removeItem("logoutPending");
}

function restoreValues(storage, previousValues) {
  for (const [key, value] of previousValues) {
    try {
      if (value === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, value);
      }
    } catch {
      // Continue restoring other authentication values.
    }
  }
}

export function persistAuth(storage, data) {
  if (
    !data?.accessToken ||
    !data.refreshToken ||
    !data.employee
  ) {
    throw new Error("Complete authentication data is required.");
  }

  const previousValues = AUTH_KEYS.map((key) => [
    key,
    storage.getItem(key),
  ]);

  try {
    storage.setItem("accessToken", data.accessToken);
    storage.setItem("refreshToken", data.refreshToken);
    storage.setItem("employee", JSON.stringify(data.employee));
    storage.setItem("authGeneration", createAuthGeneration());
    storage.removeItem("logoutPending");
  } catch (error) {
    restoreValues(storage, previousValues);
    throw error;
  }
}

export function persistTokens(storage, data, expectedSnapshot) {
  if (!data?.accessToken || !data.refreshToken) {
    throw new Error("Both authentication tokens are required.");
  }

  if (
    !expectedSnapshot ||
    !isAuthSnapshotCurrent(storage, expectedSnapshot)
  ) {
    throw new Error("Authentication state changed during refresh.");
  }

  const previousValues = TOKEN_KEYS.map((key) => [
    key,
    storage.getItem(key),
  ]);

  try {
    if (!isAuthSnapshotCurrent(storage, expectedSnapshot)) {
      throw new Error("Authentication state changed during refresh.");
    }

    storage.setItem("accessToken", data.accessToken);
    storage.setItem("refreshToken", data.refreshToken);
  } catch (error) {
    restoreValues(storage, previousValues);
    throw error;
  }
}
