import { create } from "zustand";

type OrderDialogStore = {
  selectedOrderId: string | null;

  setSelectedOrderId: (orderId: string) => void;

  clearSelectedOrderId: () => void;
};

export const useOrderDialogStore = create<OrderDialogStore>((set) => ({
  selectedOrderId: null,

  setSelectedOrderId: (orderId) =>
    set({
      selectedOrderId: orderId,
    }),

  clearSelectedOrderId: () =>
    set({
      selectedOrderId: null,
    }),
}));