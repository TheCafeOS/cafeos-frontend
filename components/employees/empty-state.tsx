import { Users } from "lucide-react";

type EmployeeEmptyStateProps = {
  onAddEmployee?: () => void;
};

export function EmployeeEmptyState({
  onAddEmployee,
}: EmployeeEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
        <Users className="h-8 w-8 text-stone-500" />
      </div>

      <h3 className="mt-6 text-xl font-semibold text-stone-900">
        No employees yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
        Invite managers and staff members to help operate your restaurant.
        Employees can assist with daily operations based on their assigned role
        and permissions.
      </p>

      {onAddEmployee ? (
        <button
          onClick={onAddEmployee}
          className="mt-8 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Add your first employee
        </button>
      ) : null}
    </div>
  );
}