import assert from "node:assert/strict";
import test from "node:test";

import { createCrossTabRefresh } from "../utils/cross-tab-refresh.mjs";

function createStorage(values) {
  return {
    getItem(key) {
      return values[key] ?? null;
    },
    setItem(key, value) {
      values[key] = value;
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
  const values = {
    accessToken: "old-access",
    refreshToken: "old-refresh",
  };
  const storage = createStorage(values);
  const locks = createLockManager();
  const runFirstTab = createCrossTabRefresh(
    () => locks,
    () => storage,
    () => "employee-1",
  );
  const runSecondTab = createCrossTabRefresh(
    () => locks,
    () => storage,
    () => "employee-1",
  );
  let refreshCount = 0;

  const refresh = async () => {
    refreshCount += 1;
    storage.setItem("accessToken", "new-access");
    storage.setItem("refreshToken", "new-refresh");
    return "new-access";
  };

  const results = await Promise.all([
    runFirstTab("old-refresh", "employee-1", refresh),
    runSecondTab("old-refresh", "employee-1", refresh),
  ]);

  assert.deepEqual(results, ["new-access", "new-access"]);
  assert.equal(refreshCount, 1);
});

test("does not reuse refreshed tokens after an account switch", async () => {
  const storage = createStorage({
    accessToken: "other-access",
    refreshToken: "other-refresh",
  });
  const run = createCrossTabRefresh(
    () => createLockManager(),
    () => storage,
    () => "other-employee",
  );
  let refreshCount = 0;

  await assert.rejects(
    run("old-refresh", "employee-1", async () => {
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
    () => "employee-1",
  );

  await assert.rejects(
    run("refresh", "employee-1", async () => "access"),
    /coordination is unavailable/,
  );
});
