import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  description?: string;
  onMenuClick?: () => void;
};

export function DashboardHeader({ title, description, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">{title}</h1>
          {description ? <p className="text-sm text-stone-500">{description}</p> : null}
        </div>
      </div>

      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>
    </header>
  );
}
