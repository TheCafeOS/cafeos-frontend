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

type EmployeeDeleteDialogProps = {
  open: boolean;
  employeeName: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function EmployeeDeleteDialog({
  open,
  employeeName,
  loading = false,
  onConfirm,
  onOpenChange,
}: EmployeeDeleteDialogProps) {
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
            Delete Employee
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {employeeName}
            </span>
            ?
            <br />
            <br />
            This action cannot be undone.
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
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}