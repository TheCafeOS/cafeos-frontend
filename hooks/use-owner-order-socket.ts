"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

type OwnerOrderSocketOptions = {
  onOrderCreated: () => void;
  onOrderUpdated: () => void;
};

export function useOwnerOrderSocket({
  onOrderCreated,
  onOrderUpdated,
}: OwnerOrderSocketOptions) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    console.log("Owner socket setup", {
      hasToken: Boolean(token),
      backendUrl,
    });

    if (!token || !backendUrl) {
      console.error("Owner socket not started: missing token or backend URL.");
      return;
    }

    const socket = io(backendUrl, {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Owner socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Owner socket connection failed:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Owner socket disconnected:", reason);
    });

    socket.on("ORDER_CREATED", (payload) => {
      console.log("ORDER_CREATED received:", payload);
      onOrderCreated();
    });

    socket.on("ORDER_UPDATED", (payload) => {
      console.log("ORDER_UPDATED received:", payload);
      onOrderUpdated();
    });

    return () => {
      socket.disconnect();
    };
  }, [onOrderCreated, onOrderUpdated]);
}