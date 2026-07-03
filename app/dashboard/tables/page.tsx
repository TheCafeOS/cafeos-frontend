"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Check, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getTables, createTable, updateTable, deleteTable } from "@/services/table.service";
import type { RestaurantTable, CreateTablePayload, UpdateTablePayload } from "@/types/table";

const TABLE_STATUSES = ["AVAILABLE", "OCCUPIED", "RESERVED", "INACTIVE"] as const;

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingStatus, setEditingStatus] = useState<"AVAILABLE" | "OCCUPIED" | "RESERVED" | "INACTIVE">("AVAILABLE");

  // Fetch tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTables();
      setTables(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load tables";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTableName.trim()) {
      toast.error("Table name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateTablePayload = { name: newTableName };
      const newTable = await createTable(payload);
      setTables([...tables, newTable]);
      setNewTableName("");
      toast.success("Table created successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create table";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (table: RestaurantTable) => {
    setEditingId(table.id);
    setEditingName(table.name);
    setEditingStatus(table.status);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingStatus("AVAILABLE");
  };

  const handleSaveEdit = async (tableId: string) => {
    if (!editingName.trim()) {
      toast.error("Table name is required");
      return;
    }

    try {
      const payload: UpdateTablePayload = {
        name: editingName,
        status: editingStatus,
      };
      const updatedTable = await updateTable(tableId, payload);
      setTables(
        tables.map((table) => (table.id === tableId ? updatedTable : table))
      );
      setEditingId(null);
      setEditingName("");
      setEditingStatus("AVAILABLE");
      toast.success("Table updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update table";
      toast.error(message);
    }
  };

  const handleDeleteTable = async (tableId: string, tableName: string) => {
    if (!window.confirm(`Delete table "${tableName}"?`)) {
      return;
    }

    try {
      await deleteTable(tableId);
      setTables(tables.filter((table) => table.id !== tableId));
      toast.success("Table deleted successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete table";
      toast.error(message);
    }
  };

  const handleCopyQRLink = async (qrCode: string) => {
    try {
      const qrUrl = `${window.location.origin}/menu/${qrCode}`;
      await navigator.clipboard.writeText(qrUrl);
      toast.success("QR link copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy QR link");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-50 text-green-700 border-green-200";
      case "OCCUPIED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "RESERVED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "INACTIVE":
        return "bg-stone-100 text-stone-600 border-stone-300";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  return (
    <DashboardShell title="Tables" description="Manage your restaurant's dining tables">
      <div className="space-y-6">
        {/* Add Table Form */}
        <div className="rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Add New Table</h2>
          <form onSubmit={handleAddTable} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter table name (e.g., Table 1, Window Seat)"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
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
                "Add Table"
              )}
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
            <div className="flex flex-col items-center gap-2 text-stone-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Loading tables...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              onClick={fetchTables}
              variant="outline"
              className="mt-3 text-sm"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && tables.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
            <div className="text-center">
              <p className="text-stone-600">No tables yet. Create your first one above.</p>
            </div>
          </div>
        )}

        {/* Tables List */}
        {!isLoading && !error && tables.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`rounded-lg border ${editingId === table.id ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-white"} overflow-hidden`}
              >
                {editingId === table.id ? (
                  // Edit Mode
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-stone-700">Table Name *</label>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-stone-700">Status</label>
                      <select
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value as any)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                      >
                        {TABLE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(table.id)}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="font-semibold text-stone-900">{table.name}</p>
                      <div className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(table.status)}`}>
                        {table.status}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-stone-600">QR Code URL</p>
                      <div className="overflow-hidden rounded-lg border border-stone-300 bg-stone-50 p-2">
                        <p className="truncate text-xs text-stone-600 font-mono">
                          {table.qrCode}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyQRLink(table.qrCode)}
                        className="w-full text-xs"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy QR Link
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(table)}
                        className="flex-1 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteTable(table.id, table.name)}
                        className="text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
