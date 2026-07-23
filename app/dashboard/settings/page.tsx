import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description=" "
    >
      <SettingsContent />
    </DashboardShell>
  );
}
