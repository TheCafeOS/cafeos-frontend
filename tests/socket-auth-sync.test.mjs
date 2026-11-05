import assert from "node:assert/strict";
import test from "node:test";

import { createSocketAuthSynchronizer } from "../utils/socket-auth-sync.mjs";

function createSocket(initialToken) {
  let token = initialToken;
  const socket = {
    auth: null,
    connected: false,
    active: false,
    connectCount: 0,
    disconnectCount: 0,
    connect() {
      this.connectCount += 1;
      this.active = true;
      this.auth((auth) => {
        this.lastHandshakeAuth = auth;
      });
    },
    disconnect() {
      this.disconnectCount += 1;
      this.connected = false;
      this.active = false;
    },
    setToken(value) {
      token = value;
    },
    listeners: new Map(),
    on(event, listener) {
      this.listeners.set(event, listener);
    },
    emit(event, ...args) {
      this.listeners.get(event)?.(...args);
    },
  };

  return { socket, getAccessToken: () => token };
}

test("initial socket connection authenticates with the current access token", () => {
  const { socket, getAccessToken } = createSocket("current-token");
  createSocketAuthSynchronizer(socket, getAccessToken);

  socket.connect();

  assert.deepEqual(socket.lastHandshakeAuth, { token: "current-token" });
});

test("successful token refresh reauthenticates an active socket", () => {
  const { socket, getAccessToken } = createSocket("expired-token");
  const synchronize = createSocketAuthSynchronizer(socket, getAccessToken);
  socket.connected = true;
  socket.active = true;

  socket.setToken("refreshed-token");
  assert.equal(synchronize("refreshed-token"), true);

  assert.equal(socket.disconnectCount, 1);
  assert.equal(socket.connectCount, 1);
  assert.deepEqual(socket.lastHandshakeAuth, { token: "refreshed-token" });
});

test("reconnection uses the refreshed token and retains order and notification listeners", () => {
  const { socket, getAccessToken } = createSocket("expired-token");
  createSocketAuthSynchronizer(socket, getAccessToken);
  let eventCount = 0;
  socket.on("ORDER_CREATED", () => {
    eventCount += 1;
  });
  socket.on("NOTIFICATION_CREATED", () => {
    eventCount += 1;
  });

  socket.setToken("refreshed-token");
  socket.connect();

  assert.deepEqual(socket.lastHandshakeAuth, { token: "refreshed-token" });
  socket.emit("ORDER_CREATED");
  socket.emit("NOTIFICATION_CREATED");
  assert.equal(eventCount, 2);
});

test("unchanged access tokens do not cause socket reconnects", () => {
  const { socket, getAccessToken } = createSocket("same-token");
  const synchronize = createSocketAuthSynchronizer(socket, getAccessToken);
  socket.connected = true;
  socket.active = true;

  assert.equal(synchronize("same-token"), false);
  assert.equal(socket.disconnectCount, 0);
  assert.equal(socket.connectCount, 0);
});
