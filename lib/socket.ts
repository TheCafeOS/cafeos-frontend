import { io, Socket } from "socket.io-client";
import { createSocketAuthSynchronizer } from "@/utils/socket-auth-sync.mjs";

let socket: Socket | null = null;
let synchronizeAuth: ((token: string | null) => boolean) | null = null;

const getAccessToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      autoConnect: false,
      transports: ["websocket"],
      auth: (callback) => callback({ token: getAccessToken() }),
    });

    synchronizeAuth = createSocketAuthSynchronizer(
      socket,
      getAccessToken,
    );

    socket.on("connect", () => {
      console.log("🟢 Socket Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Socket Error:", error.message);
    });
  }

  return socket;
}

export function synchronizeSocketAuth(token: string | null) {
  if (socket) {
    synchronizeAuth?.(token);
  }
}

export function connectSocket() {
  const socket = getSocket();

  synchronizeAuth?.(getAccessToken());

  if (!socket.connected && !socket.active) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}