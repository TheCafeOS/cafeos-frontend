import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      autoConnect: false,
      transports: ["websocket"],
      auth: {
        token: "",
      },
    });
  }

  return socket;
}

export function connectSocket() {
  const socket = getSocket();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Socket Connected:", socket.id);
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

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}