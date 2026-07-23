"use client";

import { Edit3, MoreHorizontal, Trash2, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmployeeRoleBadge } from "@/components/employees/employee-role-badge";
import { EmployeeStatusBadge } from "@/components/employees/employee-status-badge";
import type { Employee } from "@/types/employee";

type EmployeeTableProps = {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onToggleStatus?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatLastLogin(lastLoginAt: string | null) {
  if (!lastLoginAt) {
    return "Never";
  }

  const date = new Date(lastLoginAt);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function EmployeeTable({
  employees,
  onEdit,
  onToggleStatus,
  onDelete,
}: EmployeeTableProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm lg:block">
        <table className="w-full">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="w-40 px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b border-stone-100 transition-colors hover:bg-stone-50"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                      {getInitials(employee.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">
                        {employee.name}
                      </p>

                      <p className="truncate text-sm text-stone-500">
                        {employee.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <EmployeeRoleBadge role={employee.role} />
                </td>

                <td className="px-6 py-5">
                  <EmployeeStatusBadge
                    isActive={employee.isActive}
                  />
                </td>

                <td className="px-6 py-5 text-sm text-stone-600">
                  {formatLastLogin(employee.lastLoginAt)}
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={employee.role === "OWNER"}
                      onClick={() => onEdit?.(employee)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={employee.role === "OWNER"}
                      onClick={() =>
                        onToggleStatus?.(employee)
                      }
                    >
                      <UserX className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={employee.role === "OWNER"}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 disabled:text-stone-400 disabled:hover:bg-transparent"
                      onClick={() => onDelete?.(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-4 lg:hidden">
        {employees.map((employee) => (
          <article
            key={employee.id}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">                  {getInitials(employee.name)}
                </div>

               <div className="min-w-0 flex-1">
  <h3 className="truncate font-semibold text-stone-900">
    {employee.name}
  </h3>

  <p className="truncate text-sm text-stone-500">
    {employee.email}
  </p>
</div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled
                className="shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Role
                </p>

                <div className="mt-2">
                  <EmployeeRoleBadge role={employee.role} />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Status
                </p>

                <div className="mt-2">
                  <EmployeeStatusBadge
                    isActive={employee.isActive}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Last Login
              </p>

              <p className="mt-2 text-sm text-stone-700">
                {formatLastLogin(employee.lastLoginAt)}
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={employee.role === "OWNER"}
                onClick={() => onEdit?.(employee)}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                disabled={employee.role === "OWNER"}
                onClick={() => onToggleStatus?.(employee)}
              >
                <UserX className="mr-2 h-4 w-4" />
                {employee.isActive ? "Deactivate" : "Activate"}
              </Button>

              <Button
                variant="outline"
                disabled={employee.role === "OWNER"}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:border-stone-200 disabled:text-stone-400 disabled:hover:bg-transparent"
                onClick={() => onDelete?.(employee)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}