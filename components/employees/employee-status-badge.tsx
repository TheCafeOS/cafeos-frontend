import { Badge } from "@/components/ui/badge";

type EmployeeStatusBadgeProps = {
  isActive: boolean;
};

export function EmployeeStatusBadge({
  isActive,
}: EmployeeStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}