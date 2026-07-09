"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Download,
  Loader2,
  Printer,
  QrCode,
  Trash2,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "INACTIVE";

const TABLE_STATUS_OPTIONS: TableStatus[] = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "INACTIVE",
];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function isValidTable(value: unknown): value is RestaurantTable {
  if (!value || typeof value !== "object") {
    return false;
  }

  const table = value as Partial<RestaurantTable>;

  return Boolean(table.id && table.name);
}

function normalizeStatus(status: unknown): TableStatus {
  if (
    status === "AVAILABLE" ||
    status === "OCCUPIED" ||
    status === "RESERVED" ||
    status === "INACTIVE"
  ) {
    return status;
  }

  return "AVAILABLE";
}

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedQrTable, setSelectedQrTable] =
    useState<RestaurantTable | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingStatus, setEditingStatus] =
    useState<TableStatus>("AVAILABLE");

  async function fetchTables() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getTables();

      const validTables = Array.isArray(data)
        ? data.filter(isValidTable)
        : [];

      setTables(validTables);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load tables.");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchTables();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleStartEdit(table: RestaurantTable) {
    setEditingId(table.id);
    setEditingName(table.name);
    setEditingStatus(normalizeStatus(table.status));
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditingStatus("AVAILABLE");
  }

  async function handleAddTable(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = newTableName.trim();

    if (!name) {
      toast.error("Table name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateTablePayload = { name };
      const createdTable = await createTable(payload);

      if (!isValidTable(createdTable)) {
        throw new Error("Server did not return a valid table.");
      }

      setTables((currentTables) => [
        ...currentTables,
        createdTable,
      ]);

      setNewTableName("");
      toast.success("Table created successfully.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to create table."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveEdit(tableId: string) {
    const name = editingName.trim();

    if (!name) {
      toast.error("Table name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: UpdateTablePayload = {
        name,
        status: editingStatus,
      };

      const updatedTable = await updateTable(tableId, payload);

      if (!isValidTable(updatedTable)) {
        throw new Error("Server did not return a valid updated table.");
      }

      setTables((currentTables) =>
        currentTables.map((table) =>
          table.id === tableId ? updatedTable : table,
        ),
      );

      handleCancelEdit();
      toast.success("Table updated successfully.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to update table."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTable(
    tableId: string,
    tableName: string,
  ) {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete "${tableName}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteTable(tableId);

      setTables((currentTables) =>
        currentTables.filter((table) => table.id !== tableId),
      );

      if (editingId === tableId) {
        handleCancelEdit();
      }

      toast.success("Table deleted successfully.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to delete table."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function getCustomerMenuUrl(qrCode: string | null | undefined) {
    if (!qrCode) {
      return null;
    }

    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(
      /\/$/,
      "",
    );
    const appUrl = configuredAppUrl || window.location.origin;

    return `${appUrl}/menu/${qrCode}`;
  }

  async function handleCopyQRLink(qrCode: string | null | undefined) {
    const customerMenuUrl = getCustomerMenuUrl(qrCode);

    if (!customerMenuUrl) {
      toast.error("QR code is unavailable for this table.");
      return;
    }

    try {
      await navigator.clipboard.writeText(customerMenuUrl);
      toast.success("QR link copied to clipboard.");
    } catch {
      toast.error("Failed to copy QR link.");
    }
  }

  function handleDownloadQr(table: RestaurantTable) {
    const svg = document.getElementById(`table-qr-${table.id}`);

    if (!svg) {
      toast.error("QR code is not ready to download.");
      return;
    }

    const serializer = new XMLSerializer();
    const svgMarkup = serializer.serializeToString(svg);
    const blob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${table.name
      .replace(/\s+/g, "-")
      .toLowerCase()}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("QR code downloaded.");
  }

  function handlePrintQr(table: RestaurantTable) {
    const customerMenuUrl = getCustomerMenuUrl(table.qrCode);

    if (!customerMenuUrl) {
      toast.error("QR code is unavailable for this table.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=600,height=700");

    if (!printWindow) {
      toast.error("Popup blocked. Please allow popups and try again.");
      return;
    }

    const svg = document.getElementById(`table-qr-${table.id}`);

    if (!svg) {
      toast.error("QR code is not ready to print.");
      printWindow.close();
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${table.name} QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              text-align: center;
            }
            .qr {
              display: inline-block;
              padding: 24px;
              border: 1px solid #d6d3d1;
              border-radius: 12px;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 8px;
            }
            p {
              color: #57534e;
              font-size: 14px;
              overflow-wrap: anywhere;
            }
            svg {
              width: 280px;
              height: 280px;
            }
          </style>
        </head>
        <body>
          <div class="qr">
            <h1>${table.name}</h1>
            ${svg.outerHTML}
            <p>${customerMenuUrl}</p>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  function getStatusColor(status: string) {
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
  }

  const selectedQrUrl = selectedQrTable
    ? getCustomerMenuUrl(selectedQrTable.qrCode)
    : null;

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
              onChange={(event) =>
                setNewTableName(event.target.value)
              }
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
                          disabled={isSubmitting}
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
                            setEditingStatus(
                              event.target.value as TableStatus,
                            )
                          }
                          disabled={isSubmitting}
                          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none"
                        >
                          {TABLE_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => void handleSaveEdit(table.id)}
                          className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        >
                          {isSubmitting ? "Saving..." : "Save"}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSubmitting}
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

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!table.qrCode}
                            onClick={() => setSelectedQrTable(table)}
                            className="text-xs"
                          >
                            <QrCode className="mr-1 h-3 w-3" />
                            View QR
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!table.qrCode}
                            onClick={() =>
                              void handleCopyQRLink(table.qrCode)
                            }
                            className="text-xs"
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copy Link
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSubmitting}
                          onClick={() => handleStartEdit(table)}
                          className="flex-1 text-xs"
                        >
                          Edit
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={isSubmitting}
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

      {selectedQrTable && selectedQrUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="table-qr-title"
          onMouseDown={() => setSelectedQrTable(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="table-qr-title"
                  className="text-lg font-semibold text-stone-900"
                >
                  {selectedQrTable.name} QR Code
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  Customers can scan this code to open the menu.
                </p>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedQrTable(null)}
                title="Close QR dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 flex justify-center rounded-xl border border-stone-200 bg-stone-50 p-6">
              <QRCodeSVG
                id={`table-qr-${selectedQrTable.id}`}
                value={selectedQrUrl}
                size={240}
                level="M"
                includeMargin
              />
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-stone-600">
                QR destination URL
              </p>
              <p className="mt-1 break-all rounded-lg border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-700">
                {selectedQrUrl}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  void handleCopyQRLink(selectedQrTable.qrCode)
                }
                className="text-xs"
              >
                <Copy className="mr-1 h-3 w-3" />
                Copy
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDownloadQr(selectedQrTable)}
                className="text-xs"
              >
                <Download className="mr-1 h-3 w-3" />
                Download
              </Button>

              <Button
                variant="outline"
                onClick={() => handlePrintQr(selectedQrTable)}
                className="text-xs"
              >
                <Printer className="mr-1 h-3 w-3" />
                Print
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}