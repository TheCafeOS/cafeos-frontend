import { Crown, ShieldCheck, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { EmployeeRole } from "@/types/employee";

type EmployeeRoleBadgeProps = {
  role: EmployeeRole;
};

export function EmployeeRoleBadge({
  role,
}: EmployeeRoleBadgeProps) {
  switch (role) {
    case "OWNER":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-200 bg-amber-50 text-amber-700"
        >
          <Crown className="h-3 w-3" />
          Owner
        </Badge>
      );

    case "MANAGER":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-blue-200 bg-blue-50 text-blue-700"
        >
          <ShieldCheck className="h-3 w-3" />
          Manager
        </Badge>
      );

    case "STAFF":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-stone-200 bg-stone-100 text-stone-700"
        >
          <User className="h-3 w-3" />
          Staff
        </Badge>
      );

    default:
      return null;
  }
}