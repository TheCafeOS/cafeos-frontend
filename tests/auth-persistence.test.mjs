import assert from "node:assert/strict";
import test from "node:test";

import { persistAuth } from "../utils/auth-persistence.mjs";

function createStorage(initialValues = {}, failOnWriteNumber = null) {
  const values = new Map(Object.entries(initialValues));
  let writeCount = 0;

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      writeCount += 1;
      if (writeCount === failOnWriteNumber) {
        throw new Error("Storage write failed");
      }
      values.set(key, String(value));
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
