import { create } from "zustand";
import type { MenuItemResponse } from "@/services/public-menu.service";

export interface CartItem extends MenuItemResponse {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItemResponse, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: (item, quantity) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return {
        items: [...state.items, { ...item, quantity }],
      };
    });
  },
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
    } else {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      }));
    }
  },
  clearCart: () => {
    set({ items: [] });
  },
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
  },
}));
