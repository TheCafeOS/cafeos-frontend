import assert from "node:assert/strict";
import test from "node:test";

import { createCrossTabRefresh } from "../utils/cross-tab-refresh.mjs";
import {
  clearAuthState,
  invalidateAuthState,
  persistAuth,
  persistTokens,
  readAuthSnapshot,
} from "../utils/auth-persistence.mjs";

function createStorage(values) {
  return {
    getItem(key) {
      return values[key] ?? null;
    },
    setItem(key, value) {
      values[key] = value;
    },
    removeItem(key) {
      delete values[key];
    },
  };
}

function createLockManager() {
  let pending = Promise.resolve();

  return {
    request(_name, operation) {
      const current = pending.then(operation);
      pending = current.catch(() => {});
      return current;
    },
  };
}

test("concurrent tabs reuse the token pair produced by the first refresh", async () => {
  const values = {};
  const storage = createStorage(values);
  persistAuth(storage, {
    accessToken: "old-access",
    refreshToken: "old-refresh",
    employee: { id: "employee-1" },
  });
  const snapshot = readAuthSnapshot(storage);
  const locks = createLockManager();
  const runFirstTab = createCrossTabRefresh(
    () => locks,
    () => storage,
  );
  const runSecondTab = createCrossTabRefresh(
    () => locks,
    () => storage,
  );
  let refreshCount = 0;

  const refresh = async () => {
    refreshCount += 1;
    persistTokens(storage, {
      accessToken: "new-access",
      refreshToken: "new-refresh",
    }, snapshot);
    return "new-access";
  };

  const results = await Promise.all([
    runFirstTab(snapshot, refresh),
    runSecondTab(snapshot, refresh),
  ]);

  assert.deepEqual(results, ["new-access", "new-access"]);
  assert.equal(refreshCount, 1);
});

test("does not reuse refreshed tokens after an account switch", async () => {
  const storage = createStorage({});
  persistAuth(storage, {
    accessToken: "account-a-access",
    refreshToken: "account-a-refresh",
    employee: { id: "employee-a" },
  });
  const snapshot = readAuthSnapshot(storage);
  const run = createCrossTabRefresh(
    () => createLockManager(),
    () => storage,
  );
  let refreshCount = 0;
  invalidateAuthState(storage);
  clearAuthState(storage);
  persistAuth(storage, {
    accessToken: "other-access",
    refreshToken: "other-refresh",
    employee: { id: "other-employee" },
  });

  await assert.rejects(
    run(snapshot, async () => {
      refreshCount += 1;
      return "unexpected-access";
    }),
    /Authentication state changed/,
  );
  assert.equal(refreshCount, 0);
});

test("fails closed when cross-tab locks are unavailable", async () => {
  const run = createCrossTabRefresh(
    () => null,
    () => createStorage({}),
  );

  await assert.rejects(
    run({ accessToken: null, refreshToken: "refresh", employeeId: "employee-1", generation: "g1" }, async () => "access"),
    /coordination is unavailable/,
  );
});

test("a refresh response arriving after logout cannot be persisted or used", async () => {
  const storage = createStorage({});
  persistAuth(storage, {
    accessToken: "account-a-access",
    refreshToken: "account-a-refresh",
    employee: { id: "account-a" },
  });
  const snapshot = readAuthSnapshot(storage);
  const run = createCrossTabRefresh(
    () => createLockManager(),
    () => storage,
  );
  let resolveResponse;
  const refresh = run(snapshot, async (expected) => {
    const response = await new Promise((resolve) => {
      resolveResponse = resolve;
    });
    persistTokens(storage, response, expected);
    return response.accessToken;
  });

  await Promise.resolve();
  invalidateAuthState(storage);
  clearAuthState(storage);
  resolveResponse({
    accessToken: "late-account-a-access",
    refreshToken: "late-account-a-refresh",
  });

  await assert.rejects(refresh, /Authentication state changed/);
  assert.equal(storage.getItem("accessToken"), null);
  assert.equal(storage.getItem("refreshToken"), null);
});
