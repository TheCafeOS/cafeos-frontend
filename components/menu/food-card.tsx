"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { MenuItemResponse } from "@/services/public-menu.service";
import { useCart } from "@/lib/cart-store";
import { Plus, Minus } from "lucide-react";

interface FoodCardProps {
  item: MenuItemResponse;
}

export function FoodCard({ item }: FoodCardProps) {
  const [quantity, setQuantity] = useState(0);
  const { addItem, removeItem } = useCart();

  const handleAdd = () => {
    if (quantity === 0) {
      addItem(item, 1);
      setQuantity(1);
    } else {
      addItem(item, 1);
      setQuantity(quantity + 1);
    }
  };

  const handleRemove = () => {
    if (quantity === 1) {
      removeItem(item.id);
      setQuantity(0);
    } else {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
      {item.imageUrl ? (
        <div className="relative w-full h-40 bg-stone-100">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-stone-100 flex items-center justify-center">
          <span className="text-stone-400">No image</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-stone-900 mb-1">{item.name}</h3>

        {item.description && (
          <p className="text-sm text-stone-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.category && (
          <div className="text-xs text-stone-500 mb-3">
            {item.category.name}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-stone-900">
            ₹{Number(item.price).toFixed(2)}
          </span>

          {quantity === 0 ? (
            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-stone-100 rounded-lg">
              <button
                onClick={handleRemove}
                className="p-1 hover:bg-stone-200 rounded"
              >
                <Minus size={16} className="text-stone-700" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                onClick={handleAdd}
                className="p-1 hover:bg-stone-200 rounded"
              >
                <Plus size={16} className="text-stone-700" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
