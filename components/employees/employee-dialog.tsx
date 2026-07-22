"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  EmployeeForm,
  type EmployeeFormValues,
} from "./employee-form";

import {
  createEmployee,
  updateEmployee,
} from "@/services/employee.service";

import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from "@/types/employee";

type EmployeeDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  employee?: Employee;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void> | void;
};

export function EmployeeDialog({
  open,
  mode,
  employee,
  onOpenChange,
  onSuccess,
}: EmployeeDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: EmployeeFormValues) {
    if (loading) {
      return;
    }

    if (
      mode === "create" &&
      (!values.password || values.password.trim().length < 8)
    ) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        const payload: CreateEmployeePayload = {
          name: values.name,
          email: values.email,
          password: values.password!,
          role: values.role,
        };

        await createEmployee(payload);

        toast.success("Employee created successfully.");
      } else if (employee) {
        const payload: UpdateEmployeePayload = {
          name: values.name,
          role: values.role,
        };

        await updateEmployee(employee.id, payload);

        toast.success("Employee updated successfully.");
      }

      await onSuccess();

      onOpenChange(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const message =
          typeof (error.response?.data as { message?: unknown } | undefined)
            ?.message === "string"
            ? (error.response?.data as { message: string }).message
            : "Something went wrong.";

        toast.error(message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "create"
      ? "Add Employee"
      : "Edit Employee";

  const description =
    mode === "create"
      ? "Invite a manager or staff member to help operate your restaurant."
      : "Update employee information and role.";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <EmployeeForm
          mode={mode}
          employee={employee}
          loading={loading}
          onCancel={() => {
            if (!loading) {
              onOpenChange(false);
            }
          }}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}