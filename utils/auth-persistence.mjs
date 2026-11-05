const AUTH_KEYS = ["accessToken", "refreshToken", "employee"];
const TOKEN_KEYS = ["accessToken", "refreshToken"];

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
  } catch (error) {
    restoreValues(storage, previousValues);
    throw error;
  }
}

export function persistTokens(storage, data) {
  if (!data?.accessToken || !data.refreshToken) {
    throw new Error("Both authentication tokens are required.");
  }

  const previousValues = TOKEN_KEYS.map((key) => [
    key,
    storage.getItem(key),
  ]);

  try {
    storage.setItem("accessToken", data.accessToken);
    storage.setItem("refreshToken", data.refreshToken);
  } catch (error) {
    restoreValues(storage, previousValues);
    throw error;
  }
}
