"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PasswordField } from "./password-field";

import type { Employee } from "@/types/employee";

const employeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name is too long."),

  email: z
    .string()
    .email("Please enter a valid email address."),

  password: z.string().optional(),

  role: z.enum(["MANAGER", "STAFF"]),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

type EmployeeFormProps = {
  mode: "create" | "edit";
  employee?: Employee;
  loading?: boolean;
  onSubmit: (values: EmployeeFormValues) => void | Promise<void>;
  onCancel: () => void;
};

export function EmployeeForm({
  mode,
  employee,
  loading = false,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "MANAGER",
    },
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const role = useWatch({
    control,
    name: "role",
    defaultValue: "MANAGER",
  });

  useEffect(() => {
    if (!employee) {
      reset({
        name: "",
        email: "",
        password: "",
        role: "MANAGER",
      });

      return;
    }

    reset({
      name: employee.name,
      email: employee.email,
      password: "",
      role: employee.role === "STAFF" ? "STAFF" : "MANAGER",
    });
  }, [employee, reset]);

  async function submit(values: EmployeeFormValues) {
    if (mode === "create") {
      if (!values.password || values.password.length < 8) {
        return;
      }
    }

    await onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>

        <Input
          id="name"
          placeholder="Rahul Sharma"
          disabled={loading}
          {...register("name")}
        />

        {errors.name && (
          <p className="text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          type="email"
          placeholder="rahul@example.com"
          disabled={loading || mode === "edit"}
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      {mode === "create" && (
        <div className="space-y-2">
          <Label>Password</Label>

          <PasswordField
            value={password ?? ""}
            disabled={loading}
            onChange={(value) =>
              setValue("password", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />

          {errors.password && (
            <p className="text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>

        <select
          id="role"
          value={role}
          disabled={loading}
          onChange={(event) =>
            setValue(
              "role",
              event.target.value as "MANAGER" | "STAFF",
              {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              }
            )
          }
          className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm transition-colors focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="MANAGER">Manager</option>
          <option value="STAFF">Staff</option>
        </select>

        {errors.role && (
          <p className="text-sm text-red-600">
            {errors.role.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Employee"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}