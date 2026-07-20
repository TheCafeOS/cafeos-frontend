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

  role: z.enum(["MANAGER"]),
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
      role: "MANAGER",
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
        <Label>Role</Label>

        <Input
          value="Manager"
          disabled
        />

        <input
          type="hidden"
          {...register("role")}
        />
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
              ? "Create Manager"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}