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
      ? localStorage.getItem("token")
      : null;

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}