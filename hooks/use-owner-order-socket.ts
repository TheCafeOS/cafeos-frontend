"use client";

import { useEffect } from "react";
import { connectSocket } from "@/lib/socket";

type OwnerOrderSocketOptions = {
  onOrderCreated: () => void;
  onOrderUpdated: () => void;
};

export function useOwnerOrderSocket({
  onOrderCreated,
  onOrderUpdated,
}: OwnerOrderSocketOptions) {
  useEffect(() => {
    const socket = connectSocket();

    const handleOrderCreated = () => {
      onOrderCreated();
    };

    const handleOrderUpdated = () => {
      onOrderUpdated();
    };

    socket.on("ORDER_CREATED", handleOrderCreated);
    socket.on("ORDER_UPDATED", handleOrderUpdated);

    return () => {
      socket.off("ORDER_CREATED", handleOrderCreated);
      socket.off("ORDER_UPDATED", handleOrderUpdated);
    };
  }, [onOrderCreated, onOrderUpdated]);
}