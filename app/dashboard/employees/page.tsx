"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { EmployeeDialog } from "@/components/employees/employee-dialog";
import { EmployeeEmptyState } from "@/components/employees/empty-state";
import { EmployeeLoadingSkeleton } from "@/components/employees/loading-skeleton";
import { EmployeeTable } from "@/components/employees/employee-table";

import { getEmployees } from "@/services/employee.service";

import type { Employee } from "@/types/employee";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

const [dialogOpen, setDialogOpen] = useState(false);

const [dialogMode, setDialogMode] = useState<"create" | "edit">(
  "create"
);

const [selectedEmployee, setSelectedEmployee] =
  useState<Employee | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchEmployees() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getEmployees();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to load employees."
      );

      setError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

 useEffect(() => {
  const timer = window.setTimeout(() => {
    void fetchEmployees();
  }, 0);

  return () => window.clearTimeout(timer);
}, []);
  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword)
      );
    });
  }, [employees, search]);

  return (
    <DashboardShell
      title="Employees"
      description="Manage restaurant managers and staff."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>

          <Button
  onClick={() => {
    setDialogMode("create");
    setSelectedEmployee(undefined);
    setDialogOpen(true);
  }}
>
            <Plus className="mr-2 h-4 w-4" />
            Add Manager
          </Button>
        </div>

        {isLoading && <EmployeeLoadingSkeleton />}

        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() => void fetchEmployees()}
            >
              Try Again
            </Button>
          </div>
        )}

        {!isLoading &&
          !error &&
          filteredEmployees.length === 0 && (
            <EmployeeEmptyState />
          )}

        {!isLoading &&
          !error &&
          filteredEmployees.length > 0 && (
            <EmployeeTable
              employees={filteredEmployees}
              onEdit={(employee) => {
  setSelectedEmployee(employee);
  setDialogMode("edit");
  setDialogOpen(true);
}}
              onToggleStatus={(employee) => {
                toast.info(
                  employee.isActive
                    ? `Deactivate ${employee.name} will be available in Phase 4.`
                    : `Activate ${employee.name} will be available in Phase 4.`
                );
              }}
              onDelete={(employee) => {
                toast.info(
                  `Delete ${employee.name} will be available in Phase 5.`
                );
              }}
            />
          )}

       <EmployeeDialog
  open={dialogOpen}
  mode={dialogMode}
  employee={selectedEmployee}
  onOpenChange={setDialogOpen}
  onSuccess={fetchEmployees}
/>
      </div>
    </DashboardShell>
  );
}