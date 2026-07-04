import { ClipboardList } from "lucide-react";

type CurrentOrderButtonProps = {
  status: string;
  onClick: () => void;
};

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function CurrentOrderButton({
  status,
  onClick,
}: CurrentOrderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
    >
      <ClipboardList className="h-4 w-4" />

      <span className="hidden sm:inline">Orders</span>

      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
        {formatStatus(status)}
      </span>
    </button>
  );
}