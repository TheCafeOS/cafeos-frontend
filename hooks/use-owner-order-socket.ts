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
      console.log(" ORDERS PAGE: ORDER_CREATED received");
      onOrderCreated();
    };

    const handleOrderUpdated = () => {
      console.log(" ORDERS PAGE: ORDER_UPDATED received");
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