"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { EmployeeDialog } from "@/components/employees/employee-dialog";
import { EmployeeStatusDialog } from "@/components/employees/employee-status-dialog";
import { EmployeeEmptyState } from "@/components/employees/empty-state";
import { EmployeeLoadingSkeleton } from "@/components/employees/loading-skeleton";
import { EmployeeTable } from "@/components/employees/employee-table";
import type { Pagination } from "@/types/employee";
import { EmployeeDeleteDialog } from "@/components/employees/employee-delete-dialog";
import {
  deleteEmployee,
  getEmployees,
  updateEmployeeStatus,
} from "@/services/employee.service";

import type { Employee } from "@/types/employee";
import { RefreshCw } from "lucide-react";
function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function EmployeesPage() {
 const [employees, setEmployees] = useState<Employee[]>([]);

const [search, setSearch] = useState("");

const [role, setRole] = useState<"" | "MANAGER" | "STAFF">("");
const [status, setStatus] = useState<"" | "true" | "false">("");
const [sort, setSort] = useState<
  "name" | "createdAt" | "lastLoginAt"
>("createdAt");

const [order, setOrder] = useState<"asc" | "desc">("desc");

const [page, setPage] = useState(1);
const limit = 10;

const [pagination, setPagination] = useState<Pagination>({
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
});

const [dialogOpen, setDialogOpen] = useState(false);

const [dialogMode, setDialogMode] = useState<"create" | "edit">(
  "create"
);

const [selectedEmployee, setSelectedEmployee] =
  useState<Employee | undefined>(undefined);
const [statusDialogOpen, setStatusDialogOpen] = useState(false);

const [statusLoading, setStatusLoading] = useState(false);

const [statusEmployee, setStatusEmployee] =
  useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

const [deleteLoading, setDeleteLoading] = useState(false);

const [deleteEmployeeData, setDeleteEmployeeData] =
  useState<Employee | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
    const response = await getEmployees({
  page,
  limit,
  search,

  role: role || undefined,

  isActive:
    status === ""
      ? undefined
      : status === "true",

  sort,
  order,
});

setEmployees(response.data);
setPagination(response.pagination);
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
 }, [page, limit, search, role, status, sort, order]);
async function handleStatusConfirm() {
  if (!statusEmployee) {
    return;
  }

  try {
    setStatusLoading(true);

    await updateEmployeeStatus(statusEmployee.id, {
      isActive: !statusEmployee.isActive,
    });

    toast.success(
      statusEmployee.isActive
        ? "Employee deactivated successfully."
        : "Employee activated successfully."
    );

    await fetchEmployees();

    setStatusDialogOpen(false);
    setStatusEmployee(undefined);
  } catch (error) {
    toast.error(
      getErrorMessage(
        error,
        "Failed to update employee status."
      )
    );
  } finally {
    setStatusLoading(false);
  }
}
  async function handleDeleteConfirm() {
  if (!deleteEmployeeData) {
    return;
  }

  try {
    setDeleteLoading(true);

    await deleteEmployee(deleteEmployeeData.id);

    toast.success("Employee deleted successfully.");

    await fetchEmployees();

    setDeleteDialogOpen(false);
    setDeleteEmployeeData(undefined);
  } catch (error) {
    toast.error(
      getErrorMessage(
        error,
        "Failed to delete employee."
      )
    );
  } finally {
    setDeleteLoading(false);
  }
}
 useEffect(() => {
  const timer = setTimeout(() => {
    void fetchEmployees();
  }, 400);

  return () => clearTimeout(timer);
}, [fetchEmployees]);

  return (
   <DashboardShell
  title="Employees"
      description="Manage restaurant managers and staff."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
  <div>
    <h2 className="text-xl font-semibold text-stone-900">
      Employees
    </h2>

    <p className="mt-1 text-sm text-stone-600">
      Showing {employees.length} of {pagination.totalItems} employee
      {pagination.totalItems === 1 ? "" : "s"}.
    </p>
  </div>

 <Button
  variant="outline"
  onClick={() => void fetchEmployees()}
>
  <RefreshCw className="mr-2 h-4 w-4" />
  Refresh
</Button>
</div>
        <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
         <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
  <div className="flex flex-1 flex-wrap items-center gap-3">
  <div className="relative min-w-[260px] flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

    <Input
      placeholder="Search by name or email..."
      value={search}
      onChange={(event) => {
        setPage(1);
        setSearch(event.target.value);
      }}
      className="pl-10"
    />
  </div>

  <select
    value={role}
    onChange={(e) => {
      setPage(1);
      setRole(e.target.value as "" | "MANAGER" | "STAFF");
    }}
    className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm"
  >
    <option value="">All Roles</option>
    <option value="MANAGER">Manager</option>
    <option value="STAFF">Staff</option>
  </select>

  <select
    value={status}
    onChange={(e) => {
      setPage(1);
      setStatus(e.target.value as "" | "true" | "false");
    }}
    className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm"
  >
    <option value="">All Status</option>
    <option value="true">Active</option>
    <option value="false">Inactive</option>
  </select>

  <select
    value={`${sort}-${order}`}
    onChange={(e) => {
      setPage(1);

      const [newSort, newOrder] = e.target.value.split("-");

      setSort(newSort as "name" | "createdAt" | "lastLoginAt");
      setOrder(newOrder as "asc" | "desc");
    }}
    className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm"
  >
    <option value="createdAt-desc">Newest</option>
    <option value="createdAt-asc">Oldest</option>
    <option value="name-asc">Name (A–Z)</option>
    <option value="name-desc">Name (Z–A)</option>
    <option value="lastLoginAt-desc">Last Login</option>
  </select>
</div>


</div>

<Button
  onClick={() => {
    setDialogMode("create");
    setSelectedEmployee(undefined);
    setDialogOpen(true);
  }}
>
  <Plus className="mr-2 h-4 w-4" />
  Add Employee
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
 employees.length === 0 &&
 (search || role || status) && (
  <div className="rounded-xl border border-stone-200 bg-stone-50 py-12 text-center">
    <p className="font-medium text-stone-900">
      No matching employees found.
    </p>

    <Button
      variant="outline"
      className="mt-4"
      onClick={() => {
        setSearch("");
        setRole("");
        setStatus("");
        setPage(1);
      }}
    >
      Clear Filters
    </Button>
  </div>
)}

{!isLoading &&
 !error &&
 employees.length === 0 &&
 !search &&
 !role &&
 !status && (
  <EmployeeEmptyState />
)}

  {!isLoading &&
  !error &&
  employees.length > 0 && (
    <>
      <EmployeeTable
        employees={employees}
        onEdit={(employee) => {
          setSelectedEmployee(employee);
          setDialogMode("edit");
          setDialogOpen(true);
        }}
        onToggleStatus={(employee) => {
          setStatusEmployee(employee);
          setStatusDialogOpen(true);
        }}
        onDelete={(employee) => {
          setDeleteEmployeeData(employee);
          setDeleteDialogOpen(true);
        }}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-6 py-4">
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
)} 
      

       <EmployeeDialog
  open={dialogOpen}
  mode={dialogMode}
  employee={selectedEmployee}
  onOpenChange={setDialogOpen}
  onSuccess={fetchEmployees}
/>


<EmployeeStatusDialog 

  open={statusDialogOpen}
  employeeName={statusEmployee?.name ?? ""}
  isActive={statusEmployee?.isActive ?? false}
  loading={statusLoading}
  onOpenChange={(open) => {
    setStatusDialogOpen(open);

    if (!open) {
      setStatusEmployee(undefined);
    }
  }}
  onConfirm={handleStatusConfirm}
/>
<EmployeeDeleteDialog
  open={deleteDialogOpen}
  employeeName={deleteEmployeeData?.name ?? ""}
  loading={deleteLoading}
  onOpenChange={(open) => {
    setDeleteDialogOpen(open);

    if (!open) {
      setDeleteEmployeeData(undefined);
    }
  }}
  onConfirm={handleDeleteConfirm}
/>
      </div>
    </DashboardShell>
  );
}
