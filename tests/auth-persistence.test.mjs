import assert from "node:assert/strict";
import test from "node:test";

import {
  clearAuthState,
  invalidateAuthState,
  isAuthIdentityCurrent,
  readAuthSnapshot,
  persistAuth,
  persistTokens,
} from "../utils/auth-persistence.mjs";

function createStorage(initialValues = {}, failOnWriteNumber = null) {
  const values = new Map(Object.entries(initialValues));
  let writeCount = 0;
  let writeToFail = failOnWriteNumber;

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      writeCount += 1;
      if (writeCount === writeToFail) {
        throw new Error("Storage write failed");
      }
      values.set(key, String(value));
    },
    failAfterWrites(count) {
      writeToFail = writeCount + count;
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("registration auth data persists tokens and employee information", () => {
  const storage = createStorage();
  const registrationResponse = {
    accessToken: "registration-access-token",
    refreshToken: "registration-refresh-token",
    employee: {
      id: "employee-1",
      restaurantId: "restaurant-1",
      email: "owner@example.test",
      role: "OWNER",
    },
    restaurant: {
      id: "restaurant-1",
      name: "Test Cafe",
      slug: "test-cafe",
      restaurantEmail: "cafe@example.test",
      phone: null,
      address: null,
    },
  };

  persistAuth(storage, registrationResponse);

  assert.equal(storage.getItem("accessToken"), registrationResponse.accessToken);
  assert.equal(storage.getItem("refreshToken"), registrationResponse.refreshToken);
  assert.deepEqual(
    JSON.parse(storage.getItem("employee")),
    registrationResponse.employee,
  );
});

test("failed auth persistence restores the prior complete auth state", () => {
  const previousEmployee = {
    id: "old-employee",
    restaurantId: "old-restaurant",
    email: "old@example.test",
    role: "OWNER",
  };
  const storage = createStorage({
    accessToken: "old-access",
    refreshToken: "old-refresh",
    employee: JSON.stringify(previousEmployee),
  }, 3);

  assert.throws(
    () =>
      persistAuth(storage, {
        accessToken: "new-access",
        refreshToken: "new-refresh",
        employee: {
          id: "new-employee",
          restaurantId: "new-restaurant",
          email: "new@example.test",
          role: "OWNER",
        },
      }),
    /Storage write failed/,
  );

  assert.equal(storage.getItem("accessToken"), "old-access");
  assert.equal(storage.getItem("refreshToken"), "old-refresh");
  assert.deepEqual(
    JSON.parse(storage.getItem("employee")),
    previousEmployee,
  );
});

test("refreshed access and refresh tokens persist together", () => {
  const storage = createStorage({
    accessToken: "old-access",
    refreshToken: "old-refresh",
    employee: JSON.stringify({ id: "employee-1" }),
  });
  persistAuth(storage, {
    accessToken: "old-access",
    refreshToken: "old-refresh",
    employee: { id: "employee-1" },
  });
  const snapshot = readAuthSnapshot(storage);

  persistTokens(storage, {
    accessToken: "new-access",
    refreshToken: "new-refresh",
  }, snapshot);

  assert.equal(storage.getItem("accessToken"), "new-access");
  assert.equal(storage.getItem("refreshToken"), "new-refresh");
  assert.equal(
    JSON.parse(storage.getItem("employee")).id,
    "employee-1",
  );
});

test("failed refreshed-token persistence restores both prior token values", () => {
  const storage = createStorage({
    accessToken: "old-access",
    refreshToken: "old-refresh",
  });
  persistAuth(storage, {
    accessToken: "old-access",
    refreshToken: "old-refresh",
    employee: { id: "employee-1" },
  });
  storage.failAfterWrites(2);
  const snapshot = readAuthSnapshot(storage);

  assert.throws(
    () =>
      persistTokens(storage, {
        accessToken: "new-access",
        refreshToken: "new-refresh",
      }, snapshot),
    /Storage write failed/,
  );

  assert.equal(storage.getItem("accessToken"), "old-access");
  assert.equal(storage.getItem("refreshToken"), "old-refresh");
});

test("a late refresh cannot overwrite the next account's credentials", () => {
  const storage = createStorage();
  persistAuth(storage, {
    accessToken: "account-a-access",
    refreshToken: "account-a-refresh",
    employee: { id: "account-a" },
  });
  const accountASnapshot = readAuthSnapshot(storage);

  invalidateAuthState(storage);
  clearAuthState(storage);
  persistAuth(storage, {
    accessToken: "account-b-access",
    refreshToken: "account-b-refresh",
    employee: { id: "account-b" },
  });

  assert.throws(
    () => persistTokens(storage, {
      accessToken: "late-account-a-access",
      refreshToken: "late-account-a-refresh",
    }, accountASnapshot),
    /Authentication state changed/,
  );
  assert.equal(storage.getItem("accessToken"), "account-b-access");
  assert.equal(storage.getItem("refreshToken"), "account-b-refresh");
  assert.equal(
    isAuthIdentityCurrent(storage, accountASnapshot),
    false,
  );
});
