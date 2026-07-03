"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  createTable,
  deleteTable,
  getTables,
  updateTable,
} from "@/services/table.service";
import type {
  CreateTablePayload,
  RestaurantTable,
  UpdateTablePayload,
} from "@/types/table";

const TABLE_STATUSES = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "INACTIVE",
] as const;

type TableStatus = (typeof TABLE_STATUSES)[number];

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingStatus, setEditingStatus] =
    useState<TableStatus>("AVAILABLE");

  useEffect(() => {
    void fetchTables();
  }, []);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  };

  const fetchTables = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load tables");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = newTableName.trim();

    if (!name) {
      toast.error("Table name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateTablePayload = { name };
      const newTable = await createTable(payload);

      setTables((currentTables) => [...currentTables, newTable]);
      setNewTableName("");
      toast.success("Table created successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create table"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (table: RestaurantTable) => {
    setEditingId(table.id);
    setEditingName(table.name);
    setEditingStatus(table.status as TableStatus);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingStatus("AVAILABLE");
  };

  const handleSaveEdit = async (tableId: string) => {
    const name = editingName.trim();

    if (!name) {
      toast.error("Table name is required");
      return;
    }

    try {
      const payload: UpdateTablePayload = {
        name,
        status: editingStatus,
      };

      const updatedTable = await updateTable(tableId, payload);

      setTables((currentTables) =>
        currentTables.map((table) =>
          table.id === tableId ? updatedTable : table,
        ),
      );

      handleCancelEdit();
      toast.success("Table updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update table"));
    }
  };

  const handleDeleteTable = async (tableId: string, tableName: string) => {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete "${tableName}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteTable(tableId);

      setTables((currentTables) =>
        currentTables.filter((table) => table.id !== tableId),
      );

      toast.success("Table deleted successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete table"));
    }
  };

  const handleCopyQRLink = async (qrCode: string | null | undefined) => {
    const qrToken = qrCode?.split("/").filter(Boolean).pop();

    if (!qrToken) {
      toast.error("QR code is unavailable for this table");
      return;
    }

    try {
      const customerMenuUrl = `${window.location.origin}/menu/${qrToken}`;

      await navigator.clipboard.writeText(customerMenuUrl);

      toast.success("QR link copied to clipboard");
    } catch {
      toast.error("Failed to copy QR link");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "border-green-200 bg-green-50 text-green-700";
      case "OCCUPIED":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "RESERVED":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "INACTIVE":
        return "border-stone-300 bg-stone-100 text-stone-600";
      default:
        return "border-stone-200 bg-stone-50 text-stone-700";
    }
  };

  return (
    <DashboardShell
      title="Tables"
      description="Manage your restaurant's dining tables"
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Add New Table
          </h2>

          <form onSubmit={handleAddTable} className="flex gap-3">
            <input
              type="text"
              value={newTableName}
              onChange={(event) => setNewTableName(event.target.value)}
              placeholder="Enter table name (e.g., Table 1, Window Seat)"
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm outline-none placeholder:text-stone-500"
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
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
            <div className="flex flex-col items-center gap-2 text-stone-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Loading tables...</p>
            </div>
          </div>
        ) : null}

        {error && !isLoading ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              onClick={() => void fetchTables()}
              variant="outline"
              className="mt-3 text-sm"
            >
              Try Again
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && tables.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
            <p className="text-stone-600">
              No tables yet. Create your first one above.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && tables.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => {
              const isEditing = editingId === table.id;

              return (
                <article
                  key={table.id}
                  className={`overflow-hidden rounded-lg border ${
                    isEditing
                      ? "border-amber-300 bg-amber-50"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3 p-4">
                      <div>
                        <label className="text-xs font-medium text-stone-700">
                          Table Name
                        </label>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          autoFocus
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-stone-700">
                          Status
                        </label>
                        <select
                          value={editingStatus}
                          onChange={(event) =>
                            setEditingStatus(event.target.value as TableStatus)
                          }
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
                          onClick={() => void handleSaveEdit(table.id)}
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
                    <div className="space-y-3 p-4">
                      <div>
                        <p className="font-semibold text-stone-900">
                          {table.name}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                            table.status,
                          )}`}
                        >
                          {table.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-stone-600">
                          QR Code URL
                        </p>

                        <div className="overflow-hidden rounded-lg border border-stone-300 bg-stone-50 p-2">
                          <p className="truncate font-mono text-xs text-stone-600">
                            {table.qrCode || "Not generated"}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!table.qrCode}
                          onClick={() =>
                            void handleCopyQRLink(table.qrCode)
                          }
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
                          onClick={() =>
                            void handleDeleteTable(table.id, table.name)
                          }
                          className="text-red-600 hover:bg-red-50"
                          title="Delete table"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}