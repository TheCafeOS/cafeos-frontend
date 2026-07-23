"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ImageOff,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "sonner";
import { getEmployee } from "@/utils/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "@/components/dashboard/image-upload";
import { uploadMenuItemImage } from "@/services/image.service";
import axios from "axios";
import Image from "next/image";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/category.service";

import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from "@/services/menu-item.service";

import type { Category } from "@/types/category";
import type { CreateMenuItemPayload, MenuItem } from "@/types/menu-item";

const emptyMenuItem: CreateMenuItemPayload = {
  name: "",
  description: "",
  price: 0,
  categoryId: "",
  imageUrl: "",
  isAvailable: true,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(true);

  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [menuItemError, setMenuItemError] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [newMenuItem, setNewMenuItem] =
    useState<CreateMenuItemPayload>(emptyMenuItem);
  const [isMenuItemSubmitting, setIsMenuItemSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(
    null,
  );
  const [editingMenuItem, setEditingMenuItem] =
    useState<CreateMenuItemPayload>(emptyMenuItem);
const employee = getEmployee();

const canManageMenu =
  employee?.role === "OWNER" ||
  employee?.role === "MANAGER";

const canDeleteMenu =
  employee?.role === "OWNER";
 const [menuSearch, setMenuSearch] = useState("");

const [selectedMenuCategoryId, setSelectedMenuCategoryId] =
  useState("");

const [availabilityFilter, setAvailabilityFilter] = useState<
  "" | "true" | "false"
>("");

const [page, setPage] = useState(1);

const limit = 10;

const [sort, setSort] = useState<
  "createdAt" | "name" | "price"
>("createdAt");

const [order, setOrder] = useState<"asc" | "desc">("desc");

const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
});
  const menuItemFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMenuData() {
      try {
        setIsLoadingCategories(true);
        setIsLoadingMenuItems(true);
        setCategoryError(null);
        setMenuItemError(null);

        const [categoriesResult, menuItemsResult] =
  await Promise.allSettled([
    getCategories(),
    getMenuItems({
      page,
      limit,
      search: menuSearch,
      categoryId: selectedMenuCategoryId || undefined,
      isAvailable:
        availabilityFilter === ""
          ? undefined
          : availabilityFilter === "true",
      sort,
      order,
    }),
  ]);

        if (!isMounted) return;

        if (categoriesResult.status === "fulfilled") {
  const loadedCategories = categoriesResult.value.data ?? [];

  console.log("Loaded Categories:", loadedCategories);

  setCategories(loadedCategories);
}
        else {
          const message = getErrorMessage(
            categoriesResult.reason,
            "Failed to load categories",
          );
          setCategoryError(message);
          toast.error(message);
        }

        if (menuItemsResult.status === "fulfilled") {
          setMenuItems(menuItemsResult.value.data);
setPagination(menuItemsResult.value.pagination);
        } else {
          const message = getErrorMessage(
            menuItemsResult.reason,
            "Failed to load menu items",
          );
          setMenuItemError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
          setIsLoadingMenuItems(false);
        }
      }
    }

    void loadMenuData();

    return () => {
      isMounted = false;
    };
  }, [
  page,
  menuSearch,
  selectedMenuCategoryId,
  availabilityFilter,
  sort,
  order,
]);

  async function handleAddCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newCategoryName.trim();

    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    setIsCategorySubmitting(true);

    try {
      const createdCategory = await createCategory(name);

      if (!createdCategory?.id) {
        throw new Error("Server did not return a valid category.");
      }

      setCategories((current) => [...current, createdCategory]);
      setNewCategoryName("");
      toast.success("Category created successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create category"));
    } finally {
      setIsCategorySubmitting(false);
    }
  }

function handleStartEditCategory(category: Category) {
  if (!canManageMenu) return;
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  }

  function handleCancelEditCategory() {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  }

  async function handleSaveEditCategory(categoryId: string) {
    const name = editingCategoryName.trim();

    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    try {
      const updatedCategory = await updateCategory(categoryId, name);

      if (!updatedCategory?.id) {
        throw new Error("Server did not return a valid category.");
      }

      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId ? updatedCategory : category,
        ),
      );

      handleCancelEditCategory();
      toast.success("Category updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update category"));
    }
  }

  async function handleDeleteCategory(category: Category) {
    const confirmed = window.confirm(`Delete "${category.name}" category?`);

    if (!confirmed) return;

    try {
      await deleteCategory(category.id);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );

      toast.success("Category deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete category"));
    }
  }

  async function handleAddMenuItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newMenuItem.name.trim()) {
      toast.error("Item name is required.");
      return;
    }

    if (!newMenuItem.price || Number(newMenuItem.price) <= 0) {
      toast.error("Enter a valid price.");
      return;
    }

    setIsMenuItemSubmitting(true);

    try {
      const createdItem = await createMenuItem({
  name: newMenuItem.name.trim(),
  description: newMenuItem.description?.trim() || undefined,
  price: Number(newMenuItem.price),
  categoryId: newMenuItem.categoryId || undefined,
  isAvailable: newMenuItem.isAvailable,
});if (!createdItem?.id) {
  throw new Error("Server did not return a valid menu item.");
}

let finalItem = createdItem;

if (selectedImage) {
  finalItem = await uploadMenuItemImage(
    createdItem.id,
    selectedImage,
  );
}

setMenuItems((current) => [...current, finalItem]);

setNewMenuItem(emptyMenuItem);
setSelectedImage(null);

toast.success("Menu item created successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create menu item"));
    } finally {
      setIsMenuItemSubmitting(false);
    }
  }
function handleStartEditMenuItem(item: MenuItem) {
  if (!canManageMenu) return;
    setEditingMenuItemId(item.id);

    setEditingMenuItem({
      name: item.name,
      description: item.description || "",
      price: Number(item.price),
      categoryId: item.categoryId || "",
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
    });

    window.setTimeout(() => {
      menuItemFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function handleCancelEditMenuItem() {
  setEditingMenuItemId(null);
  setEditingMenuItem(emptyMenuItem);
  setSelectedImage(null);
}
  
async function handleSaveEditMenuItem(itemId: string) {
  if (!editingMenuItem.name.trim()) {
    toast.error("Item name is required.");
    return;
  }

  if (!editingMenuItem.price || Number(editingMenuItem.price) <= 0) {
    toast.error("Enter a valid price.");
    return;
  }

  setIsMenuItemSubmitting(true);

  try {
    const updatedItem = await updateMenuItem(itemId, {
      name: editingMenuItem.name.trim(),
      description: editingMenuItem.description?.trim() || undefined,
      price: Number(editingMenuItem.price),
      categoryId: editingMenuItem.categoryId || undefined,
      isAvailable: editingMenuItem.isAvailable,
    });

    if (!updatedItem?.id) {
      throw new Error("Server did not return a valid menu item.");
    }

    let finalItem = updatedItem;

    if (selectedImage) {
      finalItem = await uploadMenuItemImage(updatedItem.id, selectedImage);
    }

    setMenuItems((current) =>
      current.map((item) =>
        item.id === itemId ? finalItem : item
      )
    );

    setSelectedImage(null);
    handleCancelEditMenuItem();

    toast.success("Menu item updated successfully.");
  } catch (error) {
    toast.error(getErrorMessage(error, "Failed to update menu item"));
  } finally {
    setIsMenuItemSubmitting(false);
  }
}

  async function handleDeleteMenuItem(item: MenuItem) {
    const confirmed = window.confirm(`Delete "${item.name}" menu item?`);

    if (!confirmed) return;

    try {
      await deleteMenuItem(item.id);

      setMenuItems((current) =>
        current.filter((menuItem) => menuItem.id !== item.id),
      );

      toast.success("Menu item deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete menu item"));
    }
  }

  function getCategoryName(categoryId?: string | null) {
    if (!categoryId) return "Uncategorized";

    return (
      categories.find((category) => category.id === categoryId)?.name ||
      "Uncategorized"
    );
  }

  function formatPrice(price: number | string) {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return "₹0.00";
    }

    return `₹${numericPrice.toFixed(2)}`;
  }

  const isEditingMenuItem = editingMenuItemId !== null;
  const activeMenuItem = isEditingMenuItem ? editingMenuItem : newMenuItem;

  function updateActiveMenuItem(
    field: keyof CreateMenuItemPayload,
    value: string | number | boolean,
  ) {
    if (isEditingMenuItem) {
      setEditingMenuItem((current) => ({
        ...current,
        [field]: value,
      }));
      return;
    }

    setNewMenuItem((current) => ({
      ...current,
      [field]: value,
    }));
  }
  
  const menuStats = useMemo(() => {
    const safeItems = menuItems.filter(Boolean);

    return {
      total: safeItems.length,
      available: safeItems.filter((item) => item.isAvailable !== false).length,
      unavailable: safeItems.filter((item) => item.isAvailable === false)
        .length,
    };
  }, [menuItems]);

 
  
  return (
    <DashboardShell
      title="Menu"
      description="Manage your restaurant's menu categories and items"
    >
      <div className="space-y-8">
        <section>
          <h2 className="mb-6 text-xl font-semibold text-stone-900">
            Categories
          </h2>

          <div className="space-y-6">
            {canManageMenu && (
<div className="rounded-lg border border-stone-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-stone-900">
                Add New Category
              </h3>

              <form onSubmit={handleAddCategory} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter category name (e.g., Beverages, Desserts)"
                  value={newCategoryName}
                 onChange={(event) => {
  setNewCategoryName(event.target.value);
}}
                  disabled={isCategorySubmitting}
                  className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm outline-none"
                />

                <Button
                  type="submit"
                  disabled={isCategorySubmitting}
                  className="rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                >
                  {isCategorySubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Category"
                  )}
                </Button>
              </form>
            </div>
            )}
           {isLoadingMenuItems ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="rounded-lg border border-stone-200 bg-white p-4"
      >
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="mt-4 h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    ))}
  </div>
) : null}

            {categoryError && !isLoadingCategories ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{categoryError}</p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : null}

            {!isLoadingCategories &&
            !categoryError &&
            categories.length === 0 ? (
              <div className="rounded-lg border border-stone-200 bg-stone-50 py-12 text-center text-stone-600">
                No categories yet. Create your first one above.
              </div>
            ) : null}

            {!isLoadingCategories &&
            !categoryError &&
            categories.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                {categories.filter(Boolean).map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-4 border-b border-stone-200 px-6 py-4 last:border-b-0"
                  >
                    {editingCategoryId === category.id ? (
                      <>
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(event) =>
                            setEditingCategoryName(event.target.value)
                          }
                          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                        />

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              void handleSaveEditCategory(category.id)
                            }
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handleCancelEditCategory}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-stone-900">
                          {category.name}
                        </p>

                        <div className="flex gap-2">
                          {canManageMenu && (
<Button
  type="button"
  size="sm"
  variant="outline"
  onClick={() => handleStartEditCategory(category)}
>
  Edit
</Button>
)}

                          {canDeleteMenu && (
<Button
  type="button"
  size="icon"
  variant="ghost"
  onClick={() => void handleDeleteCategory(category)}
>
  <Trash2 className="h-4 w-4 text-red-600" />
</Button>
)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="border-t-2 border-stone-200 pt-8">
          <h2 className="mb-6 text-xl font-semibold text-stone-900">
            Menu Items
          </h2>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <p className="text-sm text-stone-600">Total items</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900">
                {menuStats.total}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Available</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-800">
                {menuStats.available}
              </p>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm text-stone-600">Unavailable</p>
              <p className="mt-1 text-2xl font-semibold text-stone-800">
                {menuStats.unavailable}
              </p>
            </div>
          </div>

          {canManageMenu && (
<div
  ref={menuItemFormRef}
  className="rounded-lg border border-stone-200 bg-white p-6"
>
            <h3 className="mb-4 text-lg font-semibold text-stone-900">
              {isEditingMenuItem ? "Edit Menu Item" : "Add New Item"}
            </h3>

            <form
              onSubmit={(event) => {
                event.preventDefault();

                if (editingMenuItemId) {
                  void handleSaveEditMenuItem(editingMenuItemId);
                  return;
                }

                void handleAddMenuItem(event);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                 <label className="text-sm font-medium text-stone-700">
  Item Name *
</label>

<input
  type="text"
  value={activeMenuItem.name}
  onChange={(event) =>
    updateActiveMenuItem("name", event.target.value)
  }
  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
  placeholder="e.g. Espresso"
/>
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    Price *
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={activeMenuItem.price || ""}
                    onChange={(event) =>
                      updateActiveMenuItem(
                        "price",
                        Number(event.target.value) || 0,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                    placeholder="e.g., 50"
                  />
                </div>
              </div>

              <textarea
                value={activeMenuItem.description || ""}
                onChange={(event) =>
                  updateActiveMenuItem("description", event.target.value)
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                placeholder="Optional description"
                rows={2}
              />

              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">

  <div className="space-y-5">

  <div>
    <label className="mb-2 block text-sm font-medium text-stone-700">
      Category
    </label>

    <select
      value={activeMenuItem.categoryId || ""}
      onChange={(event) =>
        updateActiveMenuItem("categoryId", event.target.value)
      }
      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
    >
      <option value="">Select category</option>

      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  </div>

  <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
    <input
      type="checkbox"
      checked={activeMenuItem.isAvailable ?? true}
      onChange={(event) =>
        updateActiveMenuItem("isAvailable", event.target.checked)
      }
    />

    <div>
      <p className="font-medium text-stone-900">
        Available
      </p>

      <p className="text-xs text-stone-500">
        Customers can order this item
      </p>
    </div>
  </label>

</div>
                

      <ImageUpload
  imageUrl={activeMenuItem.imageUrl || ""}
  onUrlChange={(url) =>
    updateActiveMenuItem("imageUrl", url)
  }
  onFileSelect={setSelectedImage}
/>
    </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isMenuItemSubmitting}
                  className="bg-amber-600 text-white hover:bg-amber-700"
                >
                  {isMenuItemSubmitting
                    ? isEditingMenuItem
                      ? "Saving..."
                      : "Adding..."
                    : isEditingMenuItem
                      ? "Save Changes"
                      : "Add Item"}
                </Button>

                {isEditingMenuItem ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEditMenuItem}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </div>
          )}
         
          <div className="mt-6 rounded-lg border border-stone-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-4">
              
              <input
                type="search"
                value={menuSearch}
onChange={(event) => {
  setPage(1);
  setMenuSearch(event.target.value);
}}                placeholder="Search by item name or description..."
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
              />
 <select
  value={selectedMenuCategoryId}
  onChange={(event) => {
    setPage(1);
    setSelectedMenuCategoryId(event.target.value);
  }}
  className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
>
  <option value="">All Categories</option>

  {categories.map((category) => (
    <option key={category.id} value={category.id}>
      {category.name}
    </option>
  ))}
</select>
    

              <select
  value={availabilityFilter}
  onChange={(event) => {
    setPage(1);
    setAvailabilityFilter(
      event.target.value as "" | "true" | "false"
    );
  }}
  className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
>
  <option value="">All Availability</option>
  <option value="true">Available</option>
  <option value="false">Unavailable</option>
</select>
            <select
  value={`${sort}-${order}`}
  onChange={(event) => {
    setPage(1);

    const [newSort, newOrder] = event.target.value.split("-");

    setSort(newSort as "createdAt" | "name" | "price");
    setOrder(newOrder as "asc" | "desc");
  }}
  className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
>
  <option value="createdAt-desc">Newest</option>
  <option value="createdAt-asc">Oldest</option>
  <option value="name-asc">Name (A–Z)</option>
  <option value="name-desc">Name (Z–A)</option>
  <option value="price-asc">Price (Low → High)</option>
  <option value="price-desc">Price (High → Low)</option>
</select>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {isLoadingMenuItems ? (
              <div className="flex justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-stone-600" />
              </div>
            ) : null}

           {menuItemError && !isLoadingMenuItems ? (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
    <p className="text-sm text-red-700">
      {menuItemError}
    </p>

    <Button
      type="button"
      variant="outline"
      className="mt-3"
      onClick={() => window.location.reload()}
    >
      Try Again
    </Button>
  </div>
) : null}
{!isLoadingMenuItems &&
!menuItemError &&
menuItems.length === 0 ? (
  <div className="rounded-lg border border-stone-200 bg-stone-50 py-12 text-center">
    <p className="font-medium text-stone-900">
      No matching menu items.
    </p>

    <p className="mt-1 text-sm text-stone-600">
      Change the search or filters to see more items.
    </p>
  </div>
) : null}

{!isLoadingMenuItems &&
!menuItemError &&
menuItems.length > 0 ? (
  <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {menuItems.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-lg border border-stone-200 bg-white"
        >
          {item.imageUrl ? (
  <div className="relative h-40 w-full">
    <Image
      src={item.imageUrl}
      alt={item.name}
      fill
      className="object-cover"
    />
  </div>
) : (
            <div className="flex h-40 items-center justify-center bg-stone-100">
              <ImageOff className="h-8 w-8 text-stone-400" />
            </div>
          )}

          <div className="space-y-2 p-4">
            <p className="font-semibold text-stone-900">
              {item.name}
            </p>

            <p className="text-sm text-stone-600">
              {getCategoryName(item.categoryId)}
            </p>

            {item.description?.trim() ? (
              <p className="text-sm leading-6 text-stone-600">
                {item.description}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-amber-600">
                {formatPrice(item.price)}
              </p>

              <span
                className={
                  item.isAvailable
                    ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                    : "rounded-full bg-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700"
                }
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              {canManageMenu && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStartEditMenuItem(item)}
                >
                  Edit
                </Button>
              )}

              {canDeleteMenu && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => void handleDeleteMenuItem(item)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    {pagination.totalPages > 1 && (
      <div className="mt-6 flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4">
        <Button
          variant="outline"
          disabled={!pagination.hasPreviousPage}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>

        <p className="text-sm text-stone-600">
          Page {pagination.page} of {pagination.totalPages}
        </p>

        <Button
          variant="outline"
          disabled={!pagination.hasNextPage}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    )}
  </>
) : null}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}