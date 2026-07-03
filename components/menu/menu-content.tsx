"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FoodCard } from "@/components/menu/food-card";
import type { MenuItemResponse, CategoryResponse } from "@/services/public-menu.service";

interface MenuContentProps {
  categories: CategoryResponse[];
  menuItems: MenuItemResponse[];
}

export function MenuContent({ categories, menuItems }: MenuContentProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategoryId === null || item.categoryId === selectedCategoryId;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(null)}
              className={
                selectedCategoryId === null
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategoryId === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategoryId(category.id)}
                className={
                  selectedCategoryId === category.id
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-stone-600">
            {searchQuery
              ? "No items found matching your search"
              : "No items available"}
          </p>
        </div>
      )}
    </div>
  );
}
