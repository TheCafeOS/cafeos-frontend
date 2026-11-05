import type { Socket } from "socket.io-client";

export function createSocketAuthSynchronizer(
  socket: Pick<
    Socket,
    "auth" | "connected" | "active" | "disconnect" | "connect"
  >,
  getAccessToken: () => string | null,
): (token: string | null) => boolean;
