import { ClipboardList } from "lucide-react";

type CurrentOrderButtonProps = {
  status?: string;
  orderCount: number;
  onClick: () => void;
};

function formatStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "CONFIRMED":
      return "Accepted";

    case "PREPARING":
      return "Preparing";

    case "READY":
      return "Ready";

    case "COMPLETED":
      return "Delivered";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

export default function CurrentOrderButton({
  status,
  orderCount,
  onClick,
}: CurrentOrderButtonProps) {
  if (orderCount <= 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
      aria-label={
        orderCount === 1
          ? "Track current order"
          : `Track ${orderCount} current orders`
      }
    >
      <ClipboardList className="h-4 w-4" />

      <span className="hidden sm:inline">
        {orderCount === 1 ? "Track order" : `Track ${orderCount} orders`}
      </span>

      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
        {orderCount === 1
          ? formatStatus(status ?? "PENDING")
          : orderCount}
      </span>
    </button>
  );
}