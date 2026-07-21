"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { changePassword } from "@/services/auth.service";
import type { AccountSettings } from "@/types/settings";

type AccountCardProps = {
  account: AccountSettings | null;
};
export function AccountCard({
  account,
}: AccountCardProps) {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const canSubmit =
    currentPassword.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "";

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(
        "New password must be different from your current password.",
      );
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password changed successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
          <UserCircle2 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">
            Account
          </h2>

          <p className="text-sm text-stone-500">
            Manage your account and security.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label> Name</Label>

          <Input
            value={account?.name ?? ""}
            disabled
          />
        </div>

        <div>
          <Label> Email</Label>

          <Input
            value={account?.email ?? ""}
            disabled
          />
        </div>

        <div>
          <Label>Role</Label>

          <Input
            value={account?.role ?? ""}
            disabled
          />
        </div>

        <div className="rounded-xl border border-stone-200 p-4">
          <div className="mb-4 flex items-center gap-2 font-medium">
            <Lock className="h-4 w-4" />
            Change Password
          </div>

          <div className="space-y-4">
            <div>
              <Label>Current Password</Label>

              <Input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value,
                  )
                }
              />
            </div>

            <div>
              <Label>New Password</Label>

              <Input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value,
                  )
                }
              />
            </div>

            <div>
              <Label>Confirm Password</Label>

              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value,
                  )
                }
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={!canSubmit || loading}
            >
              {loading
                ? "Changing..."
                : "Change Password"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}