"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/services/category.service";
import type { Category } from "@/types/category";

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load categories";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const newCategory = await createCategory(newCategoryName);
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      toast.success("Category created successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create category";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (categoryId: string) => {
    if (!editingName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const updatedCategory = await updateCategory(categoryId, editingName);
      setCategories(
        categories.map((cat) => (cat.id === categoryId ? updatedCategory : cat))
      );
      setEditingId(null);
      setEditingName("");
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

  return (
    <DashboardShell title="Menu Categories" description="Manage your restaurant's menu categories">
      <div className="space-y-6">
        {/* Add Category Form */}
        <div className="rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter category name (e.g., Beverages, Desserts)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm outline-none placeholder:text-stone-500"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-amber-600 text-white hover:bg-amber-700"
            >
              {isSubmitting ? (
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
        {isLoading && (
          <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
            <div className="flex flex-col items-center gap-2 text-stone-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Loading categories...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
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
        {!isLoading && !error && categories.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
            <div className="text-center">
              <p className="text-stone-600">No categories yet. Create your first one above.</p>
            </div>
          </div>
        )}

        {/* Categories List */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="rounded-lg border border-stone-200 bg-white">
            <div className="divide-y divide-stone-200">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  {editingId === category.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveEdit(category.id)}
                          className="text-green-600 hover:bg-green-50"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelEdit}
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
                          onClick={() => handleStartEdit(category)}
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
    </DashboardShell>
  );
}