import { Loader2, Gift } from "lucide-react";

import type { LoyaltyCustomerProfile, LoyaltyProgram } from "@/types/loyalty";

type LoyaltyCardProps = {
  program: LoyaltyProgram | null;
  profile: LoyaltyCustomerProfile | null;
  isLoading: boolean;
  error: string;
  emptyMessage?: string;
};

export default function LoyaltyCard({
  program,
  profile,
  isLoading,
  error,
  emptyMessage,
}: LoyaltyCardProps) {
  if (isLoading) {
    return (
      <div className="mx-auto mb-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#171A20] p-5 shadow-sm">
          <div className="flex items-center gap-3 text-neutral-200">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            <span className="text-sm">Loading loyalty progress...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mb-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!program) {
    return null;
  }

  if (!profile) {
    return (
      <div className="mx-auto mb-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#171A20] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
              <Gift className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-100">
                {program.rewardName}
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                {emptyMessage ?? "Place your first order to unlock loyalty rewards."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressCount = profile.progress.progressCount;
  const purchaseThreshold = profile.progress.purchaseThreshold;
  const progressPercentage = Math.min(
    100,
    (progressCount / Math.max(purchaseThreshold, 1)) * 100,
  );

  return (
    <div className="mx-auto mb-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-[#171A20] p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
            <Gift className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-neutral-100">
                  {program.rewardName}
                </p>
                <p className="text-sm text-neutral-400">
                  {progressCount} / {purchaseThreshold} purchases
                </p>
              </div>
              <div className="text-sm font-medium text-orange-400">
                {progressCount} / {purchaseThreshold}
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
              <span>Rewards available: {Math.max(0, purchaseThreshold - progressCount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
