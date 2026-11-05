import assert from "node:assert/strict";
import test from "node:test";

import { createOrderSubmissionGuard } from "../utils/order-submission.mjs";

function createGuard() {
  let keyNumber = 0;
  return createOrderSubmissionGuard(() => `order-key-${++keyNumber}`);
}

test("reuses the same key when retrying a submission after network failure", () => {
  const guard = createGuard();
  const fingerprint = JSON.stringify({ items: ["item-1"] });

  const firstKey = guard.begin(fingerprint);
  guard.fail();
  const retryKey = guard.begin(fingerprint);

  assert.equal(retryKey, firstKey);
});

test("uses a different key for a separate order payload", () => {
  const guard = createGuard();

  const firstKey = guard.begin(JSON.stringify({ items: ["item-1"] }));
  guard.fail();
  const secondKey = guard.begin(JSON.stringify({ items: ["item-2"] }));

  assert.notEqual(secondKey, firstKey);
});

test("blocks a second submission while the first request is in flight", () => {
  const guard = createGuard();
  const fingerprint = JSON.stringify({ items: ["item-1"] });

  const firstKey = guard.begin(fingerprint);
  const secondSubmission = guard.begin(fingerprint);

  assert.ok(firstKey);
  assert.equal(secondSubmission, null);
});

test("clears the key after confirmed success so a new order gets a fresh key", () => {
  const guard = createGuard();
  const fingerprint = JSON.stringify({ items: ["item-1"] });

  const firstKey = guard.begin(fingerprint);
  guard.complete();
  const nextOrderKey = guard.begin(fingerprint);

  assert.notEqual(nextOrderKey, firstKey);
});

test("retains the key after an unconfirmed response failure", () => {
  const guard = createGuard();
  const fingerprint = JSON.stringify({ items: ["item-1"] });

  const firstKey = guard.begin(fingerprint);
  guard.fail();
  const retryKey = guard.begin(fingerprint);

  assert.equal(retryKey, firstKey);
});
