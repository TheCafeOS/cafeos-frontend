import assert from "node:assert/strict";
import test from "node:test";

import { createSingleFlight } from "../utils/single-flight.mjs";

test("simultaneous unauthorized requests share one token refresh operation", async () => {
  let refreshCount = 0;
  let resolveRefresh;
  const runSingleRefresh = createSingleFlight();

  const requests = Array.from({ length: 5 }, () =>
    runSingleRefresh(
      () =>
        new Promise((resolve) => {
          refreshCount += 1;
          resolveRefresh = resolve;
        }),
    ),
  );
  await Promise.resolve();
  assert.equal(refreshCount, 1);

  resolveRefresh("new-access-token");
  assert.deepEqual(
    await Promise.all(requests),
    Array(5).fill("new-access-token"),
  );
});

test("refresh failure invokes authentication cleanup once", async () => {
  const failure = new Error("refresh failed");
  let cleanupCount = 0;
  const runSingleRefresh = createSingleFlight(() => {
    cleanupCount += 1;
  });

  const results = await Promise.allSettled([
    runSingleRefresh(async () => {
      throw failure;
    }),
    runSingleRefresh(async () => {
      throw new Error("a second refresh should not run");
    }),
    runSingleRefresh(async () => {
      throw new Error("a third refresh should not run");
    }),
  ]);

  assert.equal(cleanupCount, 1);
  assert.ok(results.every((result) => result.status === "rejected"));
  assert.ok(results.every((result) => result.reason === failure));
});
