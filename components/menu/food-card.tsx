"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { MenuItemResponse } from "@/services/public-menu.service";
import { useCart } from "@/lib/cart-store";
import {
  Plus,
  Minus,
  Leaf,
  Drumstick,
  Egg,
  ImageOff,
} from "lucide-react";

interface FoodCardProps {
  item: MenuItemResponse;
}

export function FoodCard({ item }: FoodCardProps) {
  const [quantity, setQuantity] = useState(0);

  const { addItem, removeItem } = useCart();

  const handleAdd = () => {
    if (!item.isAvailable) return;

    addItem(item, 1);
    setQuantity((q) => q + 1);
  };

  const handleRemove = () => {
    if (quantity <= 1) {
      removeItem(item.id);
      setQuantity(0);
      return;
    }

    setQuantity((q) => q - 1);
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200
      ${
        item.isAvailable
          ? "border-stone-200 bg-white hover:shadow-md"
          : "border-stone-200 bg-stone-100 opacity-75"
      }`}
    >
      {/* Image */}

      {item.imageUrl ? (
        <div className="relative h-44 w-full bg-stone-100">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />

          {!item.isAvailable && (
            <div className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              Sold Out
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-stone-100">
          <ImageOff className="h-10 w-10 text-stone-400" />
        </div>
      )}

      {/* Content */}

      <div className="space-y-3 p-4">

        {/* Food Type */}

        <div>
          {item.foodType === "VEG" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              <Leaf className="h-3.5 w-3.5" />
              Veg
            </span>
          )}

          {item.foodType === "NON_VEG" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
              <Drumstick className="h-3.5 w-3.5" />
              Non-Veg
            </span>
          )}

          {item.foodType === "EGG" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
              <Egg className="h-3.5 w-3.5" />
              Egg
            </span>
          )}
        </div>

        {/* Name */}

        <h3 className="text-lg font-semibold text-stone-900">
          {item.name}
        </h3>

        {/* Description */}

        {item.description && (
          <p className="line-clamp-2 text-sm text-stone-600">
            {item.description}
          </p>
        )}

        {/* Category */}

        {item.category && (
          <p className="text-xs uppercase tracking-wide text-stone-500">
            {item.category.name}
          </p>
        )}

        {/* Footer */}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-stone-900">
            ₹{Number(item.price).toFixed(2)}
          </span>

          {quantity === 0 ? (
            <Button
              size="sm"
              disabled={!item.isAvailable}
              onClick={handleAdd}
              className={
                item.isAvailable
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              {item.isAvailable ? "Add" : "Unavailable"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-stone-100 px-2 py-1">
              <button
                onClick={handleRemove}
                className="rounded p-1 hover:bg-stone-200"
              >
                <Minus size={16} />
              </button>

              <span className="w-6 text-center font-semibold">
                {quantity}
              </span>

              <button
                onClick={handleAdd}
                className="rounded p-1 hover:bg-stone-200"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}