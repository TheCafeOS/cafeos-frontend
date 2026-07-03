"use client";

import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

interface CartSidebarProps {
  onCheckout?: () => void;
}

export function CartSidebar({ onCheckout }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="bg-white border-l border-stone-200 p-4 h-full flex flex-col items-center justify-center text-stone-500">
        <ShoppingCart size={48} className="mb-2 opacity-50" />
        <p className="text-sm">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-l border-stone-200 p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-stone-900 mb-4">Your Cart</h2>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-stone-50 p-3 rounded-lg border border-stone-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-stone-900">
                  {item.name}
                </h4>
                <p className="text-xs text-stone-600">
                  ₹{Number(item.price).toFixed(2)} x {item.quantity}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-stone-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  updateQuantity(
                    item.id,
                    Math.max(1, item.quantity - 1)
                  )
                }
                className="px-2 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
              >
                −
              </button>
              <span className="flex-1 text-center text-sm font-semibold">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
              >
                +
              </button>
            </div>

            <div className="mt-2 text-right">
              <p className="text-sm font-bold text-stone-900">
                ₹{(Number(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total and Checkout */}
      <div className="border-t border-stone-200 pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-stone-900">Total:</span>
          <span className="text-xl font-bold text-orange-600">
            ₹{total.toFixed(2)}
          </span>
        </div>

        <Button
          onClick={onCheckout}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          Proceed to Checkout
        </Button>

        <Button
          onClick={clearCart}
          variant="outline"
          className="w-full text-stone-600 border-stone-200"
        >
          Clear Cart
        </Button>
      </div>
    </div>
  );
}
