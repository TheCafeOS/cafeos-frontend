"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EmployeeStatusDialogProps = {
  open: boolean;
  employeeName: string;
  isActive: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function EmployeeStatusDialog({
  open,
  employeeName,
  isActive,
  loading = false,
  onConfirm,
  onOpenChange,
}: EmployeeStatusDialogProps) {
  const action = isActive ? "Deactivate" : "Activate";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action} Employee
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to {action.toLowerCase()}{" "}
            <span className="font-semibold text-foreground">
              {employeeName}
            </span>
            ?
            <br />
            <br />
            {isActive
              ? "The employee will no longer be able to sign in until activated again."
              : "The employee will be able to sign in again."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
          >
            {loading ? "Saving..." : action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}