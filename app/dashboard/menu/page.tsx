"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Check, X, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/services/category.service";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/services/menu-item.service";
import type { Category } from "@/types/category";
import type { MenuItem, CreateMenuItemPayload } from "@/types/menu-item";

export default function MenuPage() {
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [isMenuItemSubmitting, setIsMenuItemSubmitting] = useState(false);
  const [menuItemError, setMenuItemError] = useState<string | null>(null);

  // Menu item form state
  const [newMenuItem, setNewMenuItem] = useState<CreateMenuItemPayload>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    imageUrl: "",
    isAvailable: true,
  });

  // Menu item editing state
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<CreateMenuItemPayload>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    imageUrl: "",
    isAvailable: true,
  });

  // Fetch categories and menu items on mount
  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    setCategoryError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load categories";
      setCategoryError(message);
      toast.error(message);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchMenuItems = async () => {
    setIsLoadingMenuItems(true);
    setMenuItemError(null);
    try {
      const data = await getMenuItems();
      setMenuItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load menu items";
      setMenuItemError(message);
      toast.error(message);
    } finally {
      setIsLoadingMenuItems(false);
    }
  };

  // Category handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsCategorySubmitting(true);
    try {
      const newCategory = await createCategory(newCategoryName);
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      toast.success("Category created successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create category";
      toast.error(message);
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleStartEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleSaveEditCategory = async (categoryId: string) => {
    if (!editingCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const updatedCategory = await updateCategory(categoryId, editingCategoryName);
      setCategories(
        categories.map((cat) => (cat.id === categoryId ? updatedCategory : cat))
      );
      setEditingCategoryId(null);
      setEditingCategoryName("");
      toast.success("Category updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update category";
      toast.error(message);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Delete category "${categoryName}"?`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      toast.success("Category deleted successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete category";
      toast.error(message);
    }
  };

  // Menu item handlers
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMenuItem.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!newMenuItem.price || newMenuItem.price < 0.01) {
      toast.error("Price must be at least ₹0.01");
      return;
    }

    setIsMenuItemSubmitting(true);
    try {
      const payload: CreateMenuItemPayload = {
        ...newMenuItem,
        price: parseFloat(newMenuItem.price.toString()),
        categoryId: newMenuItem.categoryId || undefined,
        description: newMenuItem.description || undefined,
        imageUrl: newMenuItem.imageUrl || undefined,
      };

      const createdItem = await createMenuItem(payload);
      setMenuItems([...menuItems, createdItem]);
      setNewMenuItem({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        imageUrl: "",
        isAvailable: true,
      });
      toast.success("Menu item created successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create menu item";
      toast.error(message);
    } finally {
      setIsMenuItemSubmitting(false);
    }
  };

  const handleStartEditMenuItem = (item: MenuItem) => {
    setEditingMenuItemId(item.id);
    setEditingMenuItem({
      name: item.name,
      description: item.description || "",
      price: item.price,
      categoryId: item.categoryId || "",
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
    });
  };

  const handleCancelEditMenuItem = () => {
    setEditingMenuItemId(null);
    setEditingMenuItem({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      imageUrl: "",
      isAvailable: true,
    });
  };

  const handleSaveEditMenuItem = async (itemId: string) => {
    if (!editingMenuItem.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!editingMenuItem.price || editingMenuItem.price < 0.01) {
      toast.error("Price must be at least ₹0.01");
      return;
    }

    try {
      const payload: CreateMenuItemPayload = {
        ...editingMenuItem,
        price: parseFloat(editingMenuItem.price.toString()),
        categoryId: editingMenuItem.categoryId || undefined,
        description: editingMenuItem.description || undefined,
        imageUrl: editingMenuItem.imageUrl || undefined,
      };

      const updatedItem = await updateMenuItem(itemId, payload);
      setMenuItems(
        menuItems.map((item) => (item.id === itemId ? updatedItem : item))
      );
      setEditingMenuItemId(null);
      setEditingMenuItem({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        imageUrl: "",
        isAvailable: true,
      });
      toast.success("Menu item updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update menu item";
      toast.error(message);
    }
  };

  const handleDeleteMenuItem = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Delete menu item "${itemName}"?`)) {
      return;
    }

    try {
      await deleteMenuItem(itemId);
      setMenuItems(menuItems.filter((item) => item.id !== itemId));
      toast.success("Menu item deleted successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete menu item";
      toast.error(message);
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    return categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
  };

  const formatPrice = (price: number | string) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "₹0.00";
  }

  return `₹${numericPrice.toFixed(2)}`;
};

  return (
    <DashboardShell title="Menu" description="Manage your restaurant's menu categories and items">
      <div className="space-y-8">
        {/* ===== CATEGORIES SECTION ===== */}
        <div>
          <h2 className="mb-6 text-xl font-semibold text-stone-900">Categories</h2>
          <div className="space-y-6">
            {/* Add Category Form */}
            <div className="rounded-lg border border-stone-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-stone-900">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter category name (e.g., Beverages, Desserts)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm outline-none placeholder:text-stone-500"
                  disabled={isCategorySubmitting}
                />
                <Button
                  type="submit"
                  disabled={isCategorySubmitting}
                  className="rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                >
                  {isCategorySubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    "Add Category"
                  )}
                </Button>
              </form>
            </div>

            {/* Loading State */}
            {isLoadingCategories && (
              <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
                <div className="flex flex-col items-center gap-2 text-stone-600">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p>Loading categories...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {categoryError && !isLoadingCategories && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{categoryError}</p>
                <Button
                  onClick={fetchCategories}
                  variant="outline"
                  className="mt-3 text-sm"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingCategories && !categoryError && categories.length === 0 && (
              <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
                <div className="text-center">
                  <p className="text-stone-600">No categories yet. Create your first one above.</p>
                </div>
              </div>
            )}

            {/* Categories List */}
            {!isLoadingCategories && !categoryError && categories.length > 0 && (
              <div className="rounded-lg border border-stone-200 bg-white">
                <div className="divide-y divide-stone-200">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >
                      {editingCategoryId === category.id ? (
                        <>
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleSaveEditCategory(category.id)}
                              className="text-green-600 hover:bg-green-50"
                              title="Save"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={handleCancelEditCategory}
                              className="text-stone-500 hover:bg-stone-100"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium text-stone-900">{category.name}</p>
                            <p className="text-xs text-stone-500">
                              {new Date(category.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEditCategory(category)}
                              className="text-sm"
                            >
                              Edit
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              className="text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== MENU ITEMS SECTION ===== */}
        <div className="border-t-2 border-stone-200 pt-8">
          <h2 className="mb-6 text-xl font-semibold text-stone-900">Menu Items</h2>
          <div className="space-y-6">
            {/* Add Menu Item Form */}
            {editingMenuItemId === null && (
              <div className="rounded-lg border border-stone-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-stone-900">Add New Item</h3>
                <form onSubmit={handleAddMenuItem} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Item Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Espresso"
                        value={newMenuItem.name}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none placeholder:text-stone-500"
                        disabled={isMenuItemSubmitting}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Price *</label>
                      <input
                        type="number"
                        placeholder="e.g., 50"
                        step="0.01"
                        min="0.01"
                        value={newMenuItem.price || ""}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) || 0 })}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none placeholder:text-stone-500"
                        disabled={isMenuItemSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700">Description</label>
                    <textarea
                      placeholder="Optional description"
                      value={newMenuItem.description || ""}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none placeholder:text-stone-500"
                      rows={2}
                      disabled={isMenuItemSubmitting}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Category</label>
                      <select
                        value={newMenuItem.categoryId || ""}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, categoryId: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                        disabled={isMenuItemSubmitting}
                      >
                        <option value="">No category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Image URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={newMenuItem.imageUrl || ""}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, imageUrl: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none placeholder:text-stone-500"
                        disabled={isMenuItemSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={newMenuItem.isAvailable}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, isAvailable: e.target.checked })}
                      disabled={isMenuItemSubmitting}
                      className="rounded border-stone-300"
                    />
                    <label htmlFor="available" className="text-sm font-medium text-stone-700">
                      Available
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isMenuItemSubmitting}
                    className="rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                  >
                    {isMenuItemSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </span>
                    ) : (
                      "Add Item"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Loading State */}
            {isLoadingMenuItems && (
              <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
                <div className="flex flex-col items-center gap-2 text-stone-600">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p>Loading menu items...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {menuItemError && !isLoadingMenuItems && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{menuItemError}</p>
                <Button
                  onClick={fetchMenuItems}
                  variant="outline"
                  className="mt-3 text-sm"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingMenuItems && !menuItemError && menuItems.length === 0 && (
              <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
                <div className="text-center">
                  <p className="text-stone-600">No menu items yet. Create your first one above.</p>
                </div>
              </div>
            )}

            {/* Menu Items List */}
            {!isLoadingMenuItems && !menuItemError && menuItems.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border ${editingMenuItemId === item.id ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-white"} overflow-hidden`}
                  >
                    {editingMenuItemId === item.id ? (
                      // Edit Mode
                      <div className="p-4 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-stone-700">Name *</label>
                          <input
                            type="text"
                            value={editingMenuItem.name}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, name: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1 text-sm outline-none"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-stone-700">Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={editingMenuItem.price}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, price: parseFloat(e.target.value) || 0 })}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-stone-700">Description</label>
                          <textarea
                            value={editingMenuItem.description || ""}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, description: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1 text-xs outline-none"
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-stone-700">Category</label>
                          <select
                            value={editingMenuItem.categoryId || ""}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, categoryId: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1 text-sm outline-none"
                          >
                            <option value="">No category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-stone-700">Image URL</label>
                          <input
                            type="url"
                            value={editingMenuItem.imageUrl || ""}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, imageUrl: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1 text-sm outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`available-${item.id}`}
                            checked={editingMenuItem.isAvailable}
                            onChange={(e) => setEditingMenuItem({ ...editingMenuItem, isAvailable: e.target.checked })}
                            className="rounded border-stone-300"
                          />
                          <label htmlFor={`available-${item.id}`} className="text-xs font-medium text-stone-700">
                            Available
                          </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEditMenuItem(item.id)}
                            className="flex-1 bg-green-600 text-white hover:bg-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditMenuItem}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-40 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center bg-stone-100">
                            <ImageOff className="h-8 w-8 text-stone-400" />
                          </div>
                        )}

                        <div className="p-4 space-y-2">
                          <div>
                            <p className="font-semibold text-stone-900">{item.name}</p>
                            <p className="text-sm text-stone-600">{getCategoryName(item.categoryId)}</p>
                          </div>

                          {item.description && (
                            <p className="text-xs text-stone-600 line-clamp-2">{item.description}</p>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <span className="font-semibold text-amber-600">{formatPrice(item.price)}</span>
                            <span className={`text-xs font-medium ${item.isAvailable ? "text-green-600" : "text-red-600"}`}>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>

                          <div className="flex gap-2 pt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEditMenuItem(item)}
                              className="flex-1 text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteMenuItem(item.id, item.name)}
                              className="text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}